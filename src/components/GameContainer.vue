<template>
    <div class="bg-container">
        <div class="main-container">
            <h1>Players:</h1>
            <div class="flex flex-row gap-4 flex-wrap">
                <div v-for="player in players" :key="player.id" class="flex items-center justify-center">
                    <p class="max-w-fit">{{ player.name }}</p>
                    <button @click="votePlayer(player.id)" class="main-button max-w-fit">Vote</button>
                </div>
            </div>
        </div>
        <div class="main-container">
            <label class="flex">Time Remaining: <progress :value="progressRate"></progress></label>
            <div class="flex">{{ ((duration - elapsed) / 1000).toFixed(1) }}s</div>
        </div>
        <div class="main-container">
            <h2>Chat</h2>
            <div class="border border-gray-600 rounded-lg p-2">
                <div v-for="msg in messages">
                    {{msg}}
                </div>
            </div>
            <input v-model="newMessage" placeholder="Type here" class="form-field">
            <button @click="onSend" class="submit-button">Send</button>
        </div>
    </div>
</template>

<script>
import { gameplayApi, GAMEPLAY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

export default {
    data() {
        return {
            players: [],
            socket: null,
            gameId: null,
            newMessage: null,
            messages: [],
            duration: 30 * 1000,
            elapsed: 0
        };
    },
    mounted() {
        this.joinGame();
        this.resetTimer();
    },
    unmounted() {
        cancelAnimationFrame(this.handle);
    },
    computed: {
        progressRate() {
            return Math.min(this.elapsed / this.duration, 1);
        }
    },
    methods: {
        async joinGame() {
            try {
                this.gameId = this.$route.params.id;
                const response = await gameplayApi.get(`/games/${this.gameId}`);
                if (response.status === 200 || response.status === 201) {
                    this.players = response.data.players;
                    this.setupSocket();
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        },
        setupSocket() {
            const authStore = useAuthStore();
            console.log(`using access token: ${authStore.accessToken}`)
            this.socket = io(GAMEPLAY_API_URL, {
                auth: {
                    token: authStore.accessToken 
                },
                query: {
                    gameId: this.gameId
                },
                withCredentials: true,
                reconnection: false
            });

            // --- STANDARD EVENTS ---
            this.socket.on('connect', () => {
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

            // --- GAMEPLAY EVENTS ---

            // Someone died :C
            this.socket.on('PLAYER_DEATH', (data) => {
                console.log('Player death: ', data);
                this.messages.push(`${this.getPlayerName(data.id)} ${data.cause}`);
            });

            // Message on chat
            this.socket.on('MESSAGE_SENT', (message) => {
                this.messages.push(message);
            });

            // The game over handler
            this.socket.on('GAMEOVER', (data) => {
                // Navigate to game board or change view
                console.log("Gameover! ", data);
                console.error("Not implemented yet");
            });
        },
        onSend() {
            this.socket.emit(
                "MESSAGE", 
                this.newMessage
            );
            this.newMessage = null;
        },
        getPlayerName(playerId) {
            const specificPlayer = this.players.find(p => p.userId === playerId);
            return specificPlayer ? specificPlayer.name : "Unknown";
        },
        updateTimer() {
            this.elapsed = performance.now() - this.lastTime
            if (this.elapsed >= this.duration) {
                cancelAnimationFrame(this.handle)
            } else {
                this.handle = requestAnimationFrame(this.updateTimer)
            }
        },
        resetTimer() {
            this.elapsed = 0
            this.lastTime = performance.now()
            this.updateTimer()
        }
    }
};
</script>

<style scoped>
</style>