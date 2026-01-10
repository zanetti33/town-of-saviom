<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 v-if="roomName" class="section-title">{{ roomName }}</h2>
            <div>
                <p v-if="roomCode">Room: #{{ roomCode }}</p>
                <button @click="copyRoomCode" class="copy-btn">
                    {{ copied ? 'Copied!' : 'Copy' }}
                </button>
            </div>
            <h3>Players {{ players.length }}/{{ roomCapacity }}:</h3>
            <div v-for="player in players" :key="player.id" class="player-card" :class="{ 'is-ready': player.isReady }">
                <div>
                    <img :src="getImageUrl(player.imageUrl)" alt="Player Icon" class="profile-preview" />
                </div>

                <div class="player-info">
                    <div>
                        <span>{{ player.name }}</span>
                        <span v-if="player.isHost">👑</span>
                    </div>
                
                    <div>
                        <span v-if="player.isHost" class="host-label">Host</span>
                        <div v-if="player.isReady" class="ready-status">
                            <span class="ready-text">Ready</span>
                            <span class="ready-check">✔️</span>
                        </div>
                    </div>
                </div>
            </div>
            <button @click="onExitButtonClick" class="no-button">Exit</button>
            <button v-if="isHost" @click="onStartButtonClick" class="main-button">Start</button>
            <button v-else @click="onReadyButtonClick" class="main-button">Ready</button>
        </div>
    </div>
</template>

<script>
import { lobbyApi, LOBBY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

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
        getImageUrl(name) {
            console.log(name);
            if(name)
                return new URL(`../assets/img/profile/${name}`, import.meta.url).href;
            return new URL(`../assets/img/profile/default.png`, import.meta.url).href;
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
                const response = await lobbyApi.put(`/rooms/${this.roomId}/players`);
                this.players = response.data.players;
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
};
</script>

<style scoped>
</style>