<template>
    <div class="bg-background p-0 lg:p-4 min-h-screen h-screen w-full flex flex-col lg:flex-row overflow-hidden text-primary font-sans relative">
        
        <div class="flex-1 flex flex-col relative p-2 lg:p-6 h-1/2 lg:h-auto">

            <button @click="onQuit" class="absolute top-4 left-4 lg:top-6 lg:left-6 no-button w-auto! h-10 px-4 lg:px-8 py-5 text-white! z-20">
                <span class="text-sm font-bold tracking-wider transition-opacity">
                    QUIT
                </span>
            </button>
            
            <div class="flex flex-col items-center mt-12 lg:mt-8 mb-4 lg:mb-8 transition-all duration-500">
                <div class="mb-2 lg:mb-4">
                    <DayIcon v-if="isDay" class="w-12 h-12 lg:w-16 lg:h-16 text-highlight" />
                    <NightIcon v-if="isNight" class="w-12 h-12 lg:w-16 lg:h-16 text-bad" />
                    <DefenseIcon v-if="this.isDefence" class="w-12 h-12 lg:w-16 lg:h-16 text-secondary" />
                </div>
                <h1 class="text-2xl lg:text-3xl font-bold tracking-wide text-center">{{ phaseTitle }}</h1>
                <p class="text-xs lg:text-sm mt-1">{{ phaseSubtitle }}</p>
            </div>

            <div v-if="this.isDefence" class="flex flex-col items-center justify-center w-full mt-4 lg:mt-8">
                <h2 class="text-xl lg:text-4xl font-bold text-primary mb-4 lg:mb-8 text-center px-4">
                    Do you find <span class="text-secondary">{{ getPlayerName(accusedPlayerId) }}</span> guilty?
                </h2>
                <div class="flex flex-row gap-4 lg:gap-8 w-full justify-center">
                    <button 
                        @click="voteInnocent"
                        class="submit-button text-sm lg:text-base px-6 py-3">
                        Innocent
                    </button>
                    <button 
                        @click="voteGuilty"
                        class="no-button text-sm lg:text-base px-6 py-3">
                        Guilty
                    </button>
                </div>
            </div>

            <div v-else class="flex-1 flex flex-col justify-center items-center overflow-hidden w-full">
                <div class="hidden lg:flex w-full h-full justify-center items-center overflow-y-auto">
                    <!-- DESKTOP VOTE -->
                    <PlayerCardList 
                        :players="players"
                        @player-clicked="onVotePlayer"/>
                </div>

                <div class="lg:hidden flex flex-col items-center justify-center w-80">
                    <button 
                        @click="showVoteModal = true" class="submit-button">
                        <span class="font-bold text-md tracking-wider">
                            {{votedPlayerId ? 'VOTED FOR: ' + getPlayerName(votedPlayerId) : 'VOTE'}}
                        </span>
                    </button>
                </div>
            </div>

            <!-- MOBILE VOTE-->
            <div v-if="showVoteModal" class="fixed inset-0 z-50 bg-background backdrop-blur-sm flex flex-col p-6 animate-fade-in lg:hidden">
                <div class="flex justify-center items-center mb-6">
                    <h2 class="text-2xl font-bold text-white">VOTE PLAYER</h2>
                </div>
            
                <div class="flex overflow-y-auto gap-4 content-start cursor-pointer thin-scrollbar">
                    <div class="p-4 rounded-xl border-2 flex flex-col w-full items-center gap-2 transition-all active:scale-95">
                        <PlayerCardList 
                            :players="players"
                            @player-clicked="onMobileVote"/>
                        
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-section-background">
                    <button @click="showVoteModal = false" class="submit-button uppercase">
                        Confirm Selection
                    </button>
                </div>
            </div>

            <div class="mt-auto pt-4 flex items-end justify-between relative shrink-0">
                <div class="flex-1 pr-4 lg:pr-12">
                    <div class="flex justify-between text-[10px] lg:text-xs font-bold tracking-widest mb-2">
                        <span class="uppercase">{{ phase }} Phase</span>
                        <span>{{ Math.max(0, ((duration - elapsed) / 1000)).toFixed(0) }}s</span>
                    </div>
                    <progress :value="progressRate" label="Phase Progress" :class="progressBarClass"></progress>
                </div>

                <div class="bg-section-background backdrop-blur-md rounded-xl p-2 lg:p-4 border-2 border-border-background flex items-center gap-2 lg:gap-4 shadow-xl">
                    <div class="p-1.5 lg:p-2 bg-card-background rounded-lg">
                        <WerewolfIcon v-if="myRole === 'WEREWOLF'" class="w-6 h-6 lg:w-10 lg:h-10 text-bad"/>
                        <DoctorIcon v-if="myRole === 'DOCTOR'" class="w-6 h-6 lg:w-10 lg:h-10 text-primary"/>
                        <SeerIcon v-if="myRole === 'SEER'" class="w-6 h-6 lg:w-10 lg:h-10 text-primary"/>
                        <VillagerIcon v-if="myRole === 'VILLAGER'" class="w-6 h-6 lg:w-10 lg:h-10 text-primary"/>
                    </div>
                    <div>
                        <div class="hidden lg:block text-xs uppercase text-secondary">Your Role</div>
                        <div class="font-bold text-lg leading-none"
                            :class="myRole === 'WEREWOLF' ? 'text-bad' : 'text-primary'">
                            {{ myRole || 'Loading...' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full lg:w-96 bg-section-background border-2 border-border-background flex flex-col h-1/2 lg:h-auto rounded-2xl z-10">
            <div class="h-8 lg:h-16 bg-card-background border-b flex items-center p-6 gap-3 rounded-t-xl backdrop-blur justify-start lg:justify-center">
                <span class="font-bold tracking-widest text-xs lg:text-sm text-white">TOWN LOG</span>
            </div>

            <div class="flex-1 overflow-y-auto p-4 thin-scrollbar flex flex-col-reverse">
                <div v-for="(msg, idx) in reversedMessages" :key="idx">
                    <span class="text-xs lg:text-sm" :class="messageType(msg)">{{ msg.text }}</span>
                </div>
            </div>

            <div class="p-2 bg-card-background border-t rounded-b-xl">
                <form @submit.prevent="onSend" class="flex gap-2 items-center">
                    <input 
                        v-model="newMessage" 
                        id="chat-message"
                        placeholder="Discuss..." 
                        class="form-field bg-background! text-xs! lg:text-sm! flex-1">
                    
                    <button type="submit" class="form-button p-1.5 flex items-center justify-center">
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
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarsCache = new Map();

export default {
    name: 'GameContainer',
    components: {
        DayIcon: defineAsyncComponent(icons['../assets/img/sun.svg']),
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
            votedPlayerId: null,
            accusedPlayerId: null,
            myRole: null,
            handle: null,
            lastTime: 0,
            result: null,
            showVoteModal: false
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
        isDefence() {
            return this.phase === 'DEFENCE';
        },
        isNight() {
            return this.phase === 'NIGHT';
        },
        progressRate() {
            if (!this.duration) return 1;
            return this.elapsed / this.duration;
        },
        progressBarClass() {
            return {
                'day-progress-bar': this.isDay,
                'night-progress-bar': this.isNight,
                'defence-progress-bar': this.isDefence
            }
        },
        phaseTitle() {
            if (this.isNight) {
                if (this.myRole === 'WEREWOLF') {
                    return "Who to eliminate?";
                } else {
                    return "Sleep well.";
                }
            }  
            if (this.isDefence) return "Judgement Time";
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
            if (this.isDefence) return "Listen to the defence.";
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
            
            this.socket.on('PLAYER_ELIMINATED', async (data) => {
                if (data.cause === 'WEREWOLF_KILL') {
                    this.messages.push({
                        text: `Werewolves eliminated ${this.getPlayerName(data.userId)} during the night.`,
                        type: 'WEREWOLF_KILL'
                    });
                } else if (data.cause === 'VILLAGER_KILL') {
                    this.messages.push({
                        text: `The Town has chosen to eliminate ${this.getPlayerName(data.userId)}.`,
                        type: 'VILLAGER_KILL'
                    });
                } else {
                    this.messages.push({
                        text: `Player ${this.getPlayerName(data.userId)} surrendered.`,
                        type: 'QUIT'
                    });
                }
                try {
                    const response = await gameplayApi.get(`/games/${this.gameId}`);
                    if (response.status === 200 || response.status === 201) {
                        this.players = response.data.players;
                    }
                } catch (error) {
                    console.log("Error eliminating player", error);
                }
                
            });

            this.socket.on('MESSAGE_SENT', (message) => {
                this.messages.push({
                    text: message,
                    type: "MESSAGE"           
                });
            });

            this.socket.on('PHASE_CHANGE', (data) => {
                this.phase = data.phase;
                this.duration = data.timeRemaining * 1000;
                this.accusedPlayerId = data.accused || null;
                
                let sysMsg = `Phase changed to: ${data.phase}`;
                if (data.accused) sysMsg += ` | Accusing: ${this.getPlayerName(data.accused)}`;

                this.players.forEach(p => p.isSelected = false);

                this.messages.push({
                    text: sysMsg,
                    type: 'PHASE_CHANGE'
                });
                
                this.votedPlayerId = null; // Reset vote on phase change
                this.resetTimer();
            });

            this.socket.on('SYNC_TIME', (data) => {
                const remainingMs = data.time * 1000;
                const serverElapsedMs = this.duration - remainingMs;
                this.lastTime = performance.now() - serverElapsedMs;
                this.elapsed = serverElapsedMs;
            });

            this.socket.on('GAMEOVER', (data) => {
                data.find(p => {
                    if (String(p.userId) === String(authStore.user.id)) {
                        this.result = p.result;
                    }
                });

                this.socket.emit('MESSAGE', ` was a ${this.myRole}`);

                Swal.fire({
                    title: this.result === 'WON' ? 'YOU WON!' : 'You Lost...',
                    text: "Game will be added to your history.",
                    icon: this.result === 'WON' ? "success" : "error",
                    showCancelButton: false,
                    color: "var(--color-primary)",
                    iconColor: this.result === 'WON' ? "var(--color-secondary)" : "var(--color-highlight)",
                    background: "var(--color-section-background)",
                    confirmButtonColor: "var(--color-primary)",
                    confirmButtonText: "Ok"
                    }).then((res) => {
                        if (res.isConfirmed) {
                            this.$router.push('/dashboard');
                        }
                });
            });
        },
        onSend() {
            if (!this.newMessage || this.newMessage.trim() === "") return;
            this.socket.emit("MESSAGE", this.newMessage);
            this.newMessage = null;
        },
        onMobileVote(playerId) {
            // Non chiudiamo il modale subito per far vedere la selezione
            this.onVotePlayer(playerId);
        },
        onVotePlayer(playerId) {
            this.players.find(p => {
                if (String(p.userId) === String(this.votedPlayerId)) {
                    p.isSelected = false;
                }
            });

            if (String(this.votedPlayerId) === String(playerId)) {
                this.votedPlayerId = null;
                this.socket.emit("CANCEL_VOTE");
            } else {
                this.votedPlayerId = playerId;
                this.players.find(p => {
                    if (String(p.userId) === String(this.votedPlayerId)) {
                        p.isSelected = true;
                    }
                });
                this.socket.emit("VOTE", this.votedPlayerId);
            }
        },
        voteGuilty() {
            this.socket.emit("GUILTY");
        },
        voteInnocent() {
            this.socket.emit("INNOCENT");
        },
        messageType(msg) {
             if (msg.type == 'WEREWOLF_KILL' || msg.type == 'QUIT') return 'text-bad';
             if (msg.type == 'VILLAGER_KILL' || msg.type == 'PHASE_CHANGE') return 'text-highlight';
             if (msg.type == 'VOTE') return 'text-secondary';
             return 'text-primary';
        },
        getPlayerName(playerId) {
            const p = this.players.find(p => String(p.userId) === String(playerId));
            return p ? p.name : "Unknown";
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
        getAvatarComponent(imgName) {
            const path = `../assets/img/profile/${imgName}`;
            
            if (avatarsCache.has(path)) {
                return avatarsCache.get(path);
            }
            
            const loader = avatars[path] || avatars['../assets/img/profile/default.svg'];

            if (!loader) {
                console.warn(`Avatar not found and default missing: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(loader);
            avatarsCache.set(path, comp);
            return comp;
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
    /* Chrome e simili */
    progress::-webkit-progress-value {
        background-color: var(--color-background);
    }
    .day-progress-bar::-webkit-progress-bar {
        background-color: var(--color-highlight);
    }
    .night-progress-bar::-webkit-progress-bar {
        background-color: var(--color-bad);
    }
    .defence-progress-bar::-webkit-progress-bar {
        background-color: var(--color-secondary);
    }

    /* Altri browser */
    .progress {
        color: var(--color-background);
    }
    .night-progress-bar {
        background: var(--color-bad);
    }
    .day-progress-bar {
        background: var(--color-highlight);
    }
    .defence-progress-bar {
        background: var(--color-secondary);
    }

    /* Firefox */
    .day-progress-bar::-moz-progress-bar {
        background-color: var(--color-highlight);
    }
    .night-progress-bar::-moz-progress-bar {
        background-color: var(--color-bad);
    }
    .defence-progress-bar::-moz-progress-bar {
        background-color: var(--color-secondary);
    }
</style>