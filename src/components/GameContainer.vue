<template>
    <div class="bg-background p-4 min-h-screen h-screen w-full flex overflow-hidden text-primary font-sans">
        
        <div class="flex-1 flex flex-col relative p-6">

            <button @click="onQuit" class="absolute top-6 left-6 no-button w-20! h-10 px-8 py-5 text-white!">
                <div class="items-center">
                    <QuitIcon class="w-5 h-5 ml-2"/>
                </div>
                <span class="text-sm font-bold tracking-wider transition-opacity">
                    QUIT
                </span>
            </button>
            
            <div class="flex flex-col items-center mt-8 mb-8 transition-all duration-500">
                <div class="mb-4">
                    <DayIcon v-if="isDay" class="w-16 h-16 text-highlight" />
                    <NightIcon v-if="isNight" class="w-16 h-16 text-bad" />
                    <DefenseIcon v-if="phase === 'DEFENCE'" class="w-16 h-16 text-secondary" />
                </div>
                <h1 class="text-3xl font-bold tracking-wide">{{ phaseTitle }}</h1>
                <p class="text-sm mt-1">{{ phaseSubtitle }}</p>
            </div>

            <div class="flex-1 flex justify-center items-center overflow-y-auto">
                <PlayerCardList :players="players" />
            </div>

            <div v-if="votedPlayerId" class="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
                <div class="bg-bad backdrop-blur px-8 py-3 rounded-full shadow-2xl border border-bad flex items-center gap-3">
                    <span class="font-bold text-lg tracking-wider">TARGET: {{ getPlayerName(votedPlayerId).toUpperCase() }}</span>
                </div>
            </div>

            <div class="mt-auto pt-6 flex items-end justify-between relative">
                <div class="w-2/3 pr-12">
                    <div class="flex justify-between text-xs font-bold tracking-widest uppercase mb-2">
                        <span>{{ phase }} Phase</span>
                        <span>{{ Math.max(0, ((duration - elapsed) / 1000)).toFixed(0) }}s</span>
                    </div>
                    <div class="h-2 bg-section-background rounded-full overflow-hidden w-full">
                        <div class="h-full transition-all duration-1000 linear shadow-[0_0_10px_currentColor]"
                             :class="progressBarClass"
                             :style="{ width: (progressRate * 100) + '%' }">
                        </div>
                    </div>
                </div>

                <div class="bg-section-background backdrop-blur-md rounded-xl p-4 border-2 border-border-background flex items-center gap-4 shadow-xl min-w-50">
                    <div class="p-2 bg-card-background rounded-lg">
                        <WerewolfIcon v-if="myRole === 'WEREWOLF'" class="w-10 h-10 text-bad"/>
                        <DoctorIcon v-if="myRole === 'DOCTOR'" class="w-10 h-10 text-primary"/>
                        <SeerIcon v-if="myRole === 'SEER'" class="w-10 h-10 text-primary"/>
                        <VillagerIcon v-if="myRole === 'VILLAGER'" class="w-10 h-10 text-primary"/>
                    </div>
                    <div>
                        <div class="text-xs uppercase text-secondary">Your Role</div>
                        <div class=" font-bold text-lg leading-none"
                            :class="myRole === 'WEREWOLF' ? 'text-bad' : 'text-primary'">
                            {{ myRole || 'Loading...' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-96 bg-section-background border-2 border-border-background flex flex-col rounded-xl shadow-xl z-10">
            <div class="h-16 bg-card-background border-b flex items-center px-6 gap-3 rounded-t-xl backdrop-blur justify-center">
                <span class="font-bold tracking-widest text-sm text-white">TOWN LOG</span>
            </div>

            <div class="flex-1 overflow-y-auto p-4 thin-scrollbar flex flex-col-reverse">
                <div v-for="(msg, idx) in reversedMessages" :key="idx">
                    <span class="text-primary text-sm">{{ msg }}</span>
                </div>
            </div>

            <div class="p-4 bg-card-background border-t rounded-b-xl">
                <form @submit.prevent="onSend" class="flex gap-2 items-center">
                    <input 
                        v-model="newMessage" 
                        id="chat-message"
                        placeholder="Discuss..." 
                        class="form-field bg-background! flex-1">
                    
                    <button type="submit" class="form-button p-1.5">
                        <svg class="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
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
import PlayerCardList from './PlayerCardList.vue';
import Swal from 'sweetalert2';
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });
const rolesIcons = import.meta.glob('../assets/img/characters/*.svg', { query: '?component' });

export default {
    name: 'GameContainer',
    components: {
        DayIcon: defineAsyncComponent(icons['../assets/img/day.svg']),
        DefenseIcon: defineAsyncComponent(icons['../assets/img/defense.svg']),
        NightIcon: defineAsyncComponent(icons['../assets/img/night.svg']),
        QuitIcon: defineAsyncComponent(icons['../assets/img/surrend.svg']),
        WerewolfIcon: defineAsyncComponent(rolesIcons['../assets/img/characters/wolf.svg']),
        VillagerIcon: defineAsyncComponent(rolesIcons['../assets/img/characters/citizen.svg']),
        DoctorIcon: defineAsyncComponent(rolesIcons['../assets/img/characters/doctor.svg']),
        SeerIcon: defineAsyncComponent(rolesIcons['../assets/img/characters/seer.svg']),
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
            myRole: null,
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
        reversedMessages() {
            return [...this.messages].reverse();
        },
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
            return this.isNight ? 'bg-bad' : 'bg-highlight';
        },
        phaseTitle() {
            if (this.isNight) {
                if (this.myRole === 'WEREWOLF') {
                    return "Who to eliminate?";
                } else {
                    return "Sleep well.";
                }
            }  
            if (this.phase === 'DEFENCE') return "Judgement Time";
            return "Town Discussion";
        },
        phaseSubtitle() {
            if (this.isNight) {
                if (this.myRole === 'WEREWOLF') {
                    return "Select a target before sunrise.";
                } else {
                    return "Hope to stay alive.";
                }
            }       
            if (this.phase === 'DEFENCE') return "Listen to the defense.";
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
                    this.phase = response.data.phase;

                    const authStore = useAuthStore();
                    this.players.find(p => {
                        if(String(p.userId) === String(authStore.user.id)) {
                            this.myRole = p.role;
                        }
                    });

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
                this.messages.push(`${this.getPlayerName(data.userId)} was eliminated (${data.cause})`);
            });

            this.socket.on('MESSAGE_SENT', (message) => {
                this.messages.push(message);
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
        }, 
        onQuit() {
            Swal.fire({
                title: "Are you sure you want to leave the game?",
                text: "You will not be able to rejoin.",
                icon: "warning",
                showCancelButton: true,
                color: "var(--color-primary)",
                iconColor: "var(--color-highlight)",
                background: "var(--color-section-background)",
                confirmButtonColor: "var(--color-primary)",
                cancelButtonColor: "var(--color-bad)",
                confirmButtonText: "Yes, leave the game."
                }).then((result) => {
                    if (result.isConfirmed) {
                        const authStore = useAuthStore();
                        // Forse non c'è bisogno perchè è già fatto nella gameSocket
                        this.players.find(p => {
                                if(String(p.userId) === String(authStore.user.id)) {
                                    p.status = 'LEFT';
                                }
                            });
                        if (this.socket) {
                            this.socket.emit("QUIT");
                        }
                        this.$router.push('/dashboard'); 
                    }
            });
        },
    }
};
</script>

<style scoped>
</style>