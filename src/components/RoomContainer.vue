<template>
    <div class="lobby">
        <h2 v-if="roomName">{{ roomName }}</h2>
        
        <h3>Players:</h3>
        <ul>
            <li v-for="player in players" :key="player.id">
                {{ player.name }}
            </li>
        </ul>
    </div>
</template>

<script>
import { lobbyApi, LOBBY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

export default {
    data() {
        return {
            players: [],
            socket: null,
            roomName: null
        };
    },
    mounted() {
        this.joinRoom();
    },
    beforeUnmount() {
        if (this.socket) {
            this.socket.disconnect();
            console.log("Socket disconnected");
        }
    },
    methods: {
        async joinRoom() {
            try {
                const roomId = this.$route.params.id;
                const response = await lobbyApi.post(`/rooms/${roomId}/players`);
                if (response.status === 200 || response.status === 201) {
                    this.players = response.data.players;
                    this.roomName = response.data.name;
                    this.setupSocket(LOBBY_API_URL);
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        },
        setupSocket(url) {
            const authStore = useAuthStore();
            console.log(`using access token: ${authStore.accessToken}`)
            this.socket = io(url, {
                auth: {
                    token: authStore.accessToken 
                },
                withCredentials: true,
                reconnection: false
            });

            // --- STANDARD EVENTS ---
            
            this.socket.on('connect', () => {
                this.connectionStatus = 'Connected to lobby';
                console.log('Socket Connected:', this.socket.id);
            });

            this.socket.on('disconnect', () => {
                this.connectionStatus = 'Disconnected';
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
            });
        }
    }
};
</script>

<style scoped>
</style>