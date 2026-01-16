<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <h1>Players:</h1>
            <PlayerCardList :players="players" />
        </div>
        <div class="main-container max-w-2xl">
            <label class="flex">Time Remaining: {{ ((duration - elapsed) / 1000).toFixed(0) }}s</label>
            <progress :value="progressRate" label="Phase Progress" :class="progressBarClass"></progress>
            <p>{{ this.phase }}</p>
            <div>
                <DayIcon 
                    v-if="this.phase == 'DAY' || this.phase == 'STARTUP'"
                    key="day-icon"
                    class="w-15 h-15"/>
                <DefenseIcon 
                    v-if="this.phase == 'DEFENSE'"
                    key="defence-icon"
                    class="w-15 h-15"/>
                <NightIcon 
                    v-if="this.phase == 'NIGHT'"
                    key="night-icon"
                    class="w-15 h-15"/>
            </div>
        </div>
        <div class="main-container max-w-2xl">
            <h2>Chat</h2>
            <div class="wide-container overflow-y-auto scroll-auto">
                <p v-for="msg in messages">{{msg}}</p>
            </div>
            <form @submit.prevent="onSend">
                <input v-model="newMessage" placeholder="Discuss..." class="form-field">
                <input type="submit" hidden />
            </form>
        </div>
    </div>
</template>

<script>
import { gameplayApi, GAMEPLAY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { defineAsyncComponent } from 'vue'
import PlayerCardList from './PlayerCardList.vue';
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });

export default {
    name: 'GameContainer',
    components: {
        DayIcon: defineAsyncComponent(icons['../assets/img/day.svg']),
        DefenseIcon: defineAsyncComponent(icons['../assets/img/defense.svg']),
        NightIcon: defineAsyncComponent(icons['../assets/img/night.svg']),
        PlayerCardList
    },
    data() {
        return {
            players: [],
            socket: null,
            gameId: null,
            newMessage: null,
            messages: [],
            duration: null,
            phase: 'STARTUP',
            elapsed: 0
        };
    },
    mounted() {
        this.joinGame();
    },
    unmounted() {
        cancelAnimationFrame(this.handle);
    },
    computed: {
        progressRate() {
            this.duration = this.duration || 1; // prevent division by zero
            return Math.min(1 - this.elapsed / this.duration, 1);
        },
        progressBarClass() {
            return {
                'day-progress-bar': this.isDay(),
                'night-progress-bar': this.isNight()
            }
        }
    },
    methods: {
        async joinGame() {
            try {
                this.gameId = this.$route.params.id;
                const response = await gameplayApi.get(`/games/${this.gameId}`);
                if (response.status === 200 || response.status === 201) {
                    this.players = response.data.players;
                    this.duration = response.data.phaseDuration * 1000;
                    this.phase = response.data.currentPhase;
                    this.resetTimer();
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
            this.socket.on('PLAYER_ELIMINATED', (data) => {
                console.log('Player death: ', data);
                this.messages.push(`${this.getPlayerName(data.userId)} ${data.cause}`);
            });

            // Message on chat
            this.socket.on('MESSAGE_SENT', (message) => {
                this.messages.push(message);
            });

            // Phase change
            this.socket.on('PHASE_CHANGE', (data) => {
                console.log("Phase changed to: ", data.phase);
                this.messages.push(
                    `Phase changed to: ${data.phase}` + 
                        (data.accused ? ` | Accused: ${this.getPlayerName(data.accused)}` : '')
                );
                this.phase = data.phase;
                this.duration = data.timeRemaining * 1000;
                this.resetTimer();
            });

            // Sync time
            this.socket.on('SYNC_TIME', (data) => {
                console.log("Sync time: ", data.time);
                const remainingMs = data.time * 1000;
                const serverElapsedMs = this.duration - remainingMs;
                this.lastTime = performance.now() - serverElapsedMs;
                this.elapsed = serverElapsedMs;
            });

            // The game over handler
            this.socket.on('GAMEOVER', (data) => {
                // Navigate to game board or change view
                console.log("Gameover! ", data);
                console.error("Not implemented yet");
            });
        },
        onSend() {
            if (this.newMessage == null || this.newMessage.trim() === "") {
                return;
            }
            this.socket.emit(
                "MESSAGE", 
                this.newMessage
            );
            this.newMessage = null;
        },
        onVotePlayer(playerId) {
            console.log("Voting player: ", playerId);
            this.socket.emit(
                "VOTE", 
                playerId
            );
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
        },
        isDay() {
            return !this.isNight();
        },
        isNight() {
            return this.phase == 'NIGHT';
        }  
    }
};
</script>

<style scoped>
    .day-progress-bar::-moz-progress-bar {
        background-color: var(--color-dark-yellow);
    }
    .day-progress-bar::-webkit-progress-value {
        background-color: var(--color-dark-yellow);
    }
    .day-progress-bar {
        color: var(--color-dark-yellow);
    }
    .night-progress-bar::-moz-progress-bar {
        background-color: var(--color-dark-red);
    }
    .night-progress-bar::-webkit-progress-value {
        background-color: var(--color-dark-red);
    }
    .night-progress-bar {
        color: var(--color-dark-red);
    }
</style>