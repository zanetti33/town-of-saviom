<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 v-if="roomName" class="section-title">{{ roomName }}</h2>

            <!-- Pulsante Copia -->
            <div class="absolute right-0 top-0 m-4 items-center justify-center gap-2">
                <label v-if="roomCode" class="text-slate-400 align-super">{{ roomCode }}</label>
                <button @click="copyRoomCode" class="p-2 rounded-md hover:bg-slate-700 transition-colors cursor-pointer">
                    <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>

            <div class="mb-4 items-center justify-center">
                <h3 class="text-center text-lg font-bold" :class="players.length === roomCapacity ? 'text-light-blue' : ''">
                    Players {{ players.length }}/{{ roomCapacity }}:
                </h3>
            </div>
            <div class="grid gap-3 md:grid-cols-2 w-full mb-4 justify-center">
                <div v-for="player in players" :key="player.id" class="player-lobby-card p-4 mb-4">
                    <div class="grid grid-cols-2 w-full items-center justify-center">
                        <div class="relative w-25 h-25"> 
                            <!-- Mi serve questo div per non far "sfarfallare" tutte le immagini una volta che si clicca ready-->
                            <div 
                                class="absolute inset-0 rounded-full border-2 transition-colors duration-100 pointer-events-none"
                                :class="player.isReady ? 'border-light-blue' : 'border-transparent'"
                            ></div>

                            <component 
                                :is="getAvatarComponent(player.imageUrl)"
                                class="avatar-image" 
                                :aria-label="'Player Icon'"
                            />
                        </div>

                        <div class="grid grid-cols-1 gap-2 justify-center items-center">
                            <span class="text-lg font-bold">{{ player.name }}</span>
                            <span v-if="player.isHost" class="text-sm text-background-5">Host</span>
                            <span v-if="player.isReady" class="text-light-blue">Ready</span>
                        </div>
                    </div>
                </div>
            </div>
            <button @click="onExitButtonClick" class="no-button">Exit</button>
            <button v-if="isHost" @click="onStartButtonClick" class="submit-button">Start</button>
            <button v-else @click="onReadyButtonClick" class="submit-button">Ready</button>
        </div>
    </div>
</template>

<script>
import { lobbyApi, LOBBY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import router from '../router';
import { defineAsyncComponent } from 'vue'
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });
const iconsCache = new Map();
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarsCache = new Map();

export default {
    data() {
        return {
            players: [],
            socket: null,
            roomName: null,
            roomId: null,
            roomCode: null,
            copied: false,
            roomCapacity: null,
            isHost: null,
            gameStarted: false
        };
    },
    mounted() {
        this.joinRoom();
        this.checkPlayers();
    },
    beforeUnmount() {
        this.leaveRoom();
    },
    methods: {
        getIconComponent(imgName) {
            const path = `../assets/img/${imgName}`;
            
            if (iconsCache.has(path)) {
                return iconsCache.get(path);
            }
            if (!icons[path]) {
                console.warn(`Icon not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(icons[path]);
            iconsCache.set(path, comp);
            return comp;
        },
        getAvatarComponent(imgName) {
            if (!imgName) {
                return defineAsyncComponent(avatars['../assets/img/profile/default.svg']);
            } else {
                const path = `../assets/img/profile/${imgName}`;
            
            if (avatarsCache.has(path)) {
                return avatarsCache.get(path);
            }
            if (!avatars[path]) {
                console.warn(`Avatar not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(avatars[path]);
            avatarsCache.set(path, comp);
            return comp;
            }
        },
        async copyRoomCode() {
            try {
                await navigator.clipboard.writeText(this.roomCode);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            } catch (err) {
                console.error('Errore durante la copia:', err);
            }
        },
        async joinRoom() {
            try {
                this.roomId = this.$route.params.id;
                const response = await lobbyApi.post(`/rooms/${this.roomId}/players`);
                if (response.status === 200 || response.status === 201) {
                    this.players = response.data.players;
                    this.roomName = response.data.name;
                    this.roomCode = response.data.code;
                    this.roomCapacity = response.data.roomCapacity;
                    this.gameStarted = response.data.status === "playing";
                    if (this.gameStarted) {
                        router.push(`/games/${gameData.gameId}`)
                    }
                    this.setupSocket();
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        },
        async checkPlayers() {
            const response = await lobbyApi.get(`/rooms/${this.roomId}`);
            const authStore = useAuthStore();
            this.players = response.data.players;
            for (let player of response.data.players) {
                if (player.userId === authStore.user.id) {
                    this.isHost = player.isHost;
                    return;
                }
            }
            this.isHost = false;
        },
        setupSocket() {
            const authStore = useAuthStore();
            console.log(`using access token: ${authStore.accessToken}`)
            this.socket = io(LOBBY_API_URL, {
                auth: {
                    token: authStore.accessToken 
                },
                withCredentials: true,
                reconnection: false
            });

            // --- STANDARD EVENTS --
            this.socket.on('connect', () => {
                this.socket.emit("JOIN_LOBBY_ROOM", this.roomId);
                console.log('Socket Connected:', this.socket.id);
            });

            this.socket.on('connect_error', async (err) => {
                console.error("Socket Error:", err.message);

                // Check if it's an auth error (based on your backend error message)
                if (err.message.includes("Authentication error")) {
                    
                    this.connectionStatus = "Refreshing session...";
                    
                    try {
                        // 1. Trigger the shared refresh logic
                        // This will wait if Axios is already refreshing!
                        const newToken = await refreshAccessToken();

                        // 2. Update Socket Token
                        this.socket.auth.token = newToken;
                        
                        // 3. Manually reconnect
                        this.socket.connect();
                        
                    } catch (refreshErr) {
                        console.error("Refresh failed, redirecting to login");
                    }
                }
            });

            // --- LOBBY EVENTS ---

            // A new player joined the room
            this.socket.on('PLAYER_JOINED', (userInfo) => {
                console.log('New player:', userInfo);
                this.players.push(userInfo);
            });

            // A player left
            this.socket.on('PLAYER_LEFT', (userInfo) => {
                this.players = this.players.filter(p => p.id !== userInfo.id);
            });

            // A player is ready to start the game
            this.socket.on('PLAYER_READY', (userInfo) => {
                console.log('Player: ' + userInfo.userId + ' isReady: ' + userInfo.isReady);
                const playerIndex = this.players.findIndex(p => String(p.userId) === String(userInfo.userId));

                if (playerIndex !== -1) {
                    this.players[playerIndex].isReady = userInfo.isReady;
                } else {
                    console.warn("Player not found via Socket update:", userInfo.userId);
                }
            });

            // The game started
            this.socket.on('GAME_STARTED', (gameData) => {
                // Navigate to game board or change view
                console.log("Game started!", gameData);
                this.gameStarted = true;
                router.push(`/games/${gameData.gameId}`)
            });
        },
        async leaveRoom() {
            try {
                if (!this.gameStarted) {
                    const response = await lobbyApi.delete(`/rooms/${this.roomId}/players`);
                    if (response.status === 200) {
                        console.log("Successfully removed");
                    }
                }
                if (this.socket) {
                    this.socket.disconnect();
                    console.log("Socket disconnected");
                }
            } catch (error) {
                console.log(error);
            }
        },
        onExitButtonClick() {
            router.push("/rooms");
        },
        async onStartButtonClick() {
            try {
                if (this.isHost){
                    this.roomId = this.$route.params.id;
                    const response = await lobbyApi.post(`/rooms/${this.roomId}/start`);
                    if (response.status === 200 || response.status === 201) {
                        router.push(`/games/${this.roomId}`)
                    }
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        },
        async onReadyButtonClick() {
            try {
                this.roomId = this.$route.params.id;
                const authStore = useAuthStore();
                const response = await lobbyApi.put(`/rooms/${this.roomId}/players`);

                const myReadyStatus = this.safeUpdatePlayers(response.data.players);

                if (this.socket) {
                    this.socket.emit('PLAYER_READY', {
                        userId: authStore.user.id, 
                        isReady: myReadyStatus
                    });
                }
            } catch (error) {
                console.error('Error:', error);
            }
        },
        safeUpdatePlayers(newPlayersData) {
            //Mantiene fissi nel DOM gli oggetti che non cambiano (cioè gli avatar degli altri utenti)
            const authStore = useAuthStore();
            let isThisPlayerReady = null;

            newPlayersData.forEach(newP => {
                const existingP = this.players.find(p => String(p.userId) === String(newP.userId));
                if (existingP) {
                    existingP.isReady = newP.isReady;
                    if (String(existingP.userId) === String(authStore.user.id)) {
                        isThisPlayerReady = newP.isReady;
                    }
                }
            });
            
            return isThisPlayerReady;
        }
    }
};
</script>

<style scoped>
</style>