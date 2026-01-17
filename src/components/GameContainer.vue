<template>
    <div class="bg-background-1 p-4 min-h-screen h-screen w-full flex overflow-hidden text-white font-sans">
        
        <div class="flex-1 flex flex-col relative p-6">
            
            <div class="flex flex-col items-center mt-8 mb-8 transition-all duration-500">
                <div class="icon-wrapper mb-4 drop-shadow-glow">
                    <DayIcon v-if="isDay" class="w-16 h-16 text-yellow-400" />
                    <NightIcon v-if="isNight" class="w-16 h-16 text-purple-400" />
                    <DefenseIcon v-if="phase === 'DEFENSE'" class="w-16 h-16 text-blue-400" />
                </div>
                <h1 class="text-3xl font-bold tracking-wide">{{ phaseTitle }}</h1>
                <p class="text-gray-400 text-sm mt-1">{{ phaseSubtitle }}</p>
            </div>

            <div class="flex-1 flex justify-center items-center overflow-y-auto">
                <PlayerCardList :players="players" />
            </div>

            <div v-if="votedPlayerId" class="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
                <div class="bg-red-700/90 backdrop-blur px-8 py-3 rounded-full shadow-2xl border border-red-500 flex items-center gap-3">
                    <span class="w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                    <span class="font-bold text-lg tracking-wider">TARGET: {{ getPlayerName(votedPlayerId).toUpperCase() }}</span>
                </div>
            </div>

            <div class="mt-auto pt-6 flex items-end justify-between relative">
                <div class="w-2/3 pr-12">
                    <div class="flex justify-between text-xs font-bold tracking-widest uppercase mb-2 text-gray-400">
                        <span>{{ phase }} Phase</span>
                        <span>{{ Math.max(0, ((duration - elapsed) / 1000)).toFixed(0) }}s</span>
                    </div>
                    <div class="h-2 bg-gray-800 rounded-full overflow-hidden w-full">
                        <div class="h-full transition-all duration-1000 linear shadow-[0_0_10px_currentColor]"
                             :class="progressBarClass"
                             :style="{ width: (progressRate * 100) + '%' }">
                        </div>
                    </div>
                </div>

                <div class="role-card bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border-l-4 border-red-500 flex items-center gap-4 shadow-xl min-w-50">
                    <div class="p-2 bg-slate-700 rounded-lg">
                        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <div class="text-[10px] uppercase tracking-wider text-gray-400">Your Role</div>
                        <div class="text-red-400 font-bold text-lg leading-none">{{ myRole || 'Loading...' }}</div>
                    </div>
                    <button class="text-xs text-gray-500 border border-gray-600 rounded px-2 py-1 ml-auto hover:bg-gray-700">Swap</button>
                </div>
            </div>
        </div>

        <div class="sidebar-area w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-10">
            <div class="h-16 border-b border-gray-800 flex items-center px-6 gap-3 bg-gray-900/50 backdrop-blur">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                <span class="font-bold tracking-widest text-sm text-gray-200">TOWN LOG</span>
                
                <div class="ml-auto flex gap-2">
                    <button class="p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar"> <!-- CONTROLLARE STA ROBA -->
                <div v-for="(msg, idx) in messages" :key="idx" 
                     class="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 text-sm">
                     <span class="text-gray-300">{{ msg }}</span>
                </div>
            </div>

            <div class="p-4 bg-gray-900 border-t border-gray-800">
                <form @submit.prevent="onSend" class="relative">
                    <input v-model="newMessage" 
                           placeholder="Discuss..." 
                           class="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 placeholder-gray-500 text-sm transition-all">
                    
                    <button type="submit" class="absolute right-2 top-2 p-1.5 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { gameplayApi, GAMEPLAY_API_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { defineAsyncComponent } from 'vue'

// Import icons (ensure path matches your project structure)
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
            phase: 'STARTUP', // Default phase
            elapsed: 0,
            votedPlayerId: null, // Track who we voted for
            myRole: null, // Needs to be populated from API/Socket
            handle: null,
            lastTime: 0
        };
    },
    mounted() {
        this.joinGame();
    },
    unmounted() {
        cancelAnimationFrame(this.handle);
        if(this.socket) this.socket.disconnect();
    },
    computed: {
        isDay() {
            return this.phase === 'DAY' || this.phase === 'STARTUP';
        },
        isNight() {
            return this.phase === 'NIGHT';
        },
        progressRate() {
            if (!this.duration) return 1;
            return Math.min(1 - this.elapsed / this.duration, 1);
        },
        progressBarClass() {
            // Tailwind classes for the progress bar color
            return this.isNight ? 'bg-purple-600' : 'bg-yellow-500';
        },
        phaseTitle() {
            if (this.isNight) return "Who to eliminate?";
            if (this.phase === 'DEFENSE') return "Judgement Time";
            return "Town Discussion";
        },
        phaseSubtitle() {
            if (this.isNight) return "Select a target before sunrise.";
            if (this.phase === 'DEFENSE') return "Listen to the defense.";
            return "Find the wolves among us.";
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
                    
                    // Nota: Assumiamo che il server restituisca il ruolo in response.data.role 
                    // o response.data.clientPlayer.role. Aggiungi il campo se manca.
                    this.myRole = response.data.role || "Citizen"; 

                    this.resetTimer();
                    this.setupSocket();
                }
            } catch (error) {
                console.error('Error joining room:', error);
            }
        },
        setupSocket() {
            const authStore = useAuthStore();
            this.socket = io(GAMEPLAY_API_URL, {
                auth: { token: authStore.accessToken },
                query: { gameId: this.gameId },
                withCredentials: true,
                reconnection: false
            });

            this.socket.on('connect', () => console.log('Socket Connected'));
            
            this.socket.on('PLAYER_ELIMINATED', (data) => {
                this.messages.push(`💀 ${this.getPlayerName(data.userId)} was eliminated (${data.cause})`);
            });

            this.socket.on('MESSAGE_SENT', (message) => {
                this.messages.push(message);
                // Auto-scroll logic could be added here
            });

            this.socket.on('PHASE_CHANGE', (data) => {
                this.phase = data.phase;
                this.duration = data.timeRemaining * 1000;
                
                let sysMsg = `Phase changed to: ${data.phase}`;
                if (data.accused) sysMsg += ` | Accused: ${this.getPlayerName(data.accused)}`;
                this.messages.push(`--- ${sysMsg} ---`);
                
                this.votedPlayerId = null; // Reset vote on phase change
                this.resetTimer();
            });

            this.socket.on('SYNC_TIME', (data) => {
                const remainingMs = data.time * 1000;
                const serverElapsedMs = this.duration - remainingMs;
                this.lastTime = performance.now() - serverElapsedMs;
                this.elapsed = serverElapsedMs;
            });
        },
        onSend() {
            if (!this.newMessage || this.newMessage.trim() === "") return;
            this.socket.emit("MESSAGE", this.newMessage);
            this.newMessage = null;
        },
        onVotePlayer(playerId) {
            // Toggle logic: if clicking same player, could cancel vote if API supports it
            this.players.find(p => p.userId = this.votedPlayerId).forEach(p => p.isSelected = false);
            this.votedPlayerId = playerId;
            this.players.find(p => p.userId = this.votedPlayerId).forEach(p => p.isSelected = true);
            this.socket.emit("VOTE", playerId);
        },
        getPlayerName(playerId) {
            const p = this.players.find(p => p.userId === playerId);
            return p ? p.name : "Unknown";
        },
        getInitial(name) {
            return name ? name.charAt(0).toUpperCase() : '?';
        },
        updateTimer() {
            this.elapsed = performance.now() - this.lastTime;
            if (this.elapsed >= this.duration) {
                cancelAnimationFrame(this.handle);
                this.elapsed = this.duration; // Clamp to max
            } else {
                this.handle = requestAnimationFrame(this.updateTimer);
            }
        },
        resetTimer() {
            this.elapsed = 0;
            this.lastTime = performance.now();
            this.updateTimer();
        }
    }
};
</script>

<style scoped>
.drop-shadow-glow {
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.15));
}

@keyframes fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>