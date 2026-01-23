<template>
    <div class="bg-container">
        <div class="main-container max-w-4xl items-center">
            <h2 v-if="roomName" class="section-title">{{ roomName }}</h2>

            <!-- Pulsante Copia -->
            <div class="subtitle flex flex-row items-center gap-2">
                <label class="text-primary border border-primary p-2 rounded-lg">id: {{ roomCode }}</label>
                <button v-if="roomCode" @click="copyRoomCode" class="text-primary p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-inset hover:ring-2 hover:ring-highlight hover:ring-inset">
                    <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </button>
            </div>
            <WaitingPlayersLabel :ready-to-start="canStartGame" :players-number="players.length" :room-capacity="roomCapacity" />
            <PlayerCardList 
                :players="players" 
                :thisPlayerHost="isHost" 
                @remove-player="kickPlayer" 
            />
            <div class="w-full flex flex-row gap-4">
                <button @click="onExitButtonClick" class="no-button">Exit</button>
                <button 
                    v-if="isHost" 
                    @click="onStartButtonClick" 
                    :disabled="!canStartGame"
                    class="submit-button"
                    :class="{ 'opacity-50 cursor-not-allowed! grayscale': !canStartGame }">
                    Start
                </button>
                <button v-else @click="onReadyButtonClick" class="submit-button">
                    {{ isReady ? 'Not Ready' : 'Ready' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { lobbyApi, lobbySocket } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import router from '../router';
import PlayerCardList from './PlayerCardList.vue';
import WaitingPlayersLabel from './WaitingPlayersLabel.vue';
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            players: [],
            socket: null,
            roomName: null,
            roomId: null,
            roomCode: null,
            copied: false,
            roomCapacity: 0,
            isHost: null,
            isReady: null,
            gameStarted: false,
            isMobileDevice: false
        };
    },
    components: {
        PlayerCardList,
        WaitingPlayersLabel
    },
    computed: {
        canStartGame() {
            const minPlayersReached = this.players.length >= 6;
            const allReady = this.players.every(p => p.isReady || p.isHost);
            return minPlayersReached && allReady;
        }
    },
    mounted() {
        await this.joinRoom();
        this.checkPlayers();
        this.isMobileDevice = this.isMobile();
    },
    beforeUnmount() {
        this.leaveRoom();
    },
    methods: {
        isMobile() {
            console.log(screen.width);
            return screen.width <= 760;            
        },
        async copyRoomCode() {
            try {
                await navigator.clipboard.writeText(this.roomCode);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 1000);
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
                Swal.fire({
                            title: "Error joining room!",
                            text: "Try again.",
                            icon: "warning",
                            color: "var(--color-primary)",
                            iconColor: "var(--color-secondary)",
                            background: "var(--color-section-background)",
                            confirmButtonColor: "var(--color-primary)",
                            iconColor: "var(--color-highlight)"
                            }).then( () => router.push("/dashboard"));
            }
        },
        async checkPlayers() {
            const response = await lobbyApi.get(`/rooms/${this.roomId}`);
            const authStore = useAuthStore();
            this.players = response.data.players;
            for (let player of response.data.players) {
                if (player.userId === authStore.user.id) {
                    this.isHost = player.isHost;
                    this.isReady = player.isReady;
                    return;
                }
            }
            this.isHost = false;
            this.isReady = false;
        },
        setupSocket() {
            const authStore = useAuthStore();
            console.log(`using access token: ${authStore.accessToken}`)
            this.socket = lobbySocket(authStore.accessToken);

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
                console.log('Player: ' + userInfo.userId + ' left.');
                this.players = this.players.filter(p => String(p.userId) !== String(userInfo.userId));
            });

            // A player was kicked
            this.socket.on('PLAYER_KICKED', (data) => {
                const authStore = useAuthStore();
                if (String(data.userId) === String(authStore.user.id)) {
                    router.push("/dashboard"); // Reindirizza alla dashboard
                    Swal.fire({
                            title: "You have been removed!",
                            text: "The host removed you from the room.",
                            icon: "warning",
                            color: "var(--color-primary)",
                            iconColor: "var(--color-secondary)",
                            background: "var(--color-section-background)",
                            confirmButtonColor: "var(--color-primary)",
                            iconColor: "var(--color-highlight)"
                            });
                }
                this.players = this.players.filter(p => String(p.userId) !== String(data.userId));
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
                router.push(`/games/${gameData.gameId}`);
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
            if (this.isMobileDevice) {
                router.push("/rooms");
            } else {
                router.push("/dashboard");
            }
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

                this.isReady = this.safeUpdatePlayers(response.data.players);

                if (this.socket) {
                    this.socket.emit('PLAYER_READY', {
                        userId: authStore.user.id, 
                        isReady: this.isReady
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
        },
        async kickPlayer(targetUserId) {
            console.log(`Attempting to remove player: ${targetUserId}`);
            try {
                // 1. Chiamata API per rimuovere lo specifico giocatore
                // Nota: Assicurati che il tuo backend accetti l'ID del giocatore da rimuovere in questa DELETE
                const response = await lobbyApi.delete(`/rooms/${this.roomId}/players/${targetUserId}`);
                
                if (response.status === 200) {
                    console.log(`Player ${targetUserId} removed by host`);
                    
                    // 2. Opzionale: Se il backend non invia già un broadcast 'PLAYER_LEFT', 
                    // puoi emettere un evento socket qui per forzare l'uscita dell'altro client
                    if (this.socket) {
                        this.socket.emit('PLAYER_KICKED', { userId: targetUserId });
                    }
                    
                    // Aggiorna la lista locale
                    this.players = this.players.filter(p => String(p.userId) !== String(targetUserId));
                }
            } catch (error) {
                console.error('Error removing player:', error);
            }
        }
    }
};
</script>

<style scoped>
</style>