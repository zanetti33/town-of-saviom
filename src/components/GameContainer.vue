<template>
    <div>
        <h1>Players:</h1>
        <ul>
            <li v-for="player in players" :key="player.id">
                <p>{{ player.name }}</p>
                <button @click="votePlayer(player.id)">Vote</button>
            </li>
        </ul>
        <h2>Chat</h2>
        <div v-for="msg in messages">
            {{msg}}
        </div>
        <input v-model="newMessage" placeholder="Type here">
        <button @click="onSend">Send</button>
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
            messages: []
        };
    },
    mounted() {
        this.joinGame();
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
        }
    }
};
</script>

<style scoped>
</style>