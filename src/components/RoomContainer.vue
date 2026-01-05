<template>
    <div class="lobby">
        <h2 v-if="roomName">{{ roomName }}</h2>
        
        <h3>Players:</h3>
        <ul>
            <li v-for="player in players" :key="player.id">
                {{ player.name }}
            </li>
        </ul>
        <button @click="onExitButtonClick">Exit</button>
        <button @click="onStartButtonClick">Start</button>
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
            roomId: null
        };
    },
    mounted() {
        this.joinRoom();
    },
    beforeUnmount() {
        this.leaveRoom();
    },
    methods: {
        async joinRoom() {
            try {
                this.roomId = this.$route.params.id;
                const response = await lobbyApi.post(`/rooms/${this.roomId}/players`);
                if (response.status === 200 || response.status === 201) {
                    this.players = response.data.players;
                    this.roomName = response.data.name;
                    this.setupSocket();
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
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

            // --- STANDARD EVENTS ---
            
            this.socket.on('connect', () => {
                this.connectionStatus = 'Connected to lobby';
                this.socket.emit("JOIN_LOBBY_ROOM", this.roomId);
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
        },
        async leaveRoom() {
            try {
                const response = await lobbyApi.delete(`/rooms/${this.roomId}/players`);
                if (response.status === 200) {
                    console.log("Successfully removed");
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
                this.roomId = this.$route.params.id;
                const response = await lobbyApi.post(`/rooms/${this.roomId}/start`);
                if (response.status === 200 || response.status === 201) {
                    router.push(`/games/${room._id}`)
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        }
    }
};
</script>

<style scoped>
</style>