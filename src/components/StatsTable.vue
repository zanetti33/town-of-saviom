<template>
    <div class="bg-section-background border border-border-background rounded-xl p-5 relative group">

        <div class="flex items-center justify-between mb-4 border-b border-border-background pb-2">
            <div class="flex items-center gap-2">
                <RecordIcon class="w-8 h-8 text-highlight" :aria-label="'Icon stats'"/>
                <span class="section-title tracking-wider">Record</span>
            </div>

            <button 
                @click="fetchHistory" 
                class="form-button bg-secondary! flex items-center gap-1 text-sm uppercase font-bold cursor-pointer px-2 py-1 rounded transition-all"
            >
                <HistoryIcon class="w-4 h-4" :aria-label="'Icon history'"/>
                <span>History</span>
            </button>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center divide-x divide-border-background">
            <div>
                <div class="text-xl font-bold text-primary">{{ stats.totalGames }}</div>
                <div class="subtitle mt-1">Played</div>
            </div>
            <div>
                <div class="text-xl font-bold text-secondary">{{ stats.totalWins }}</div>
                <div class="subtitle mt-1">Wins</div>
            </div>
            <div>
                <div class="text-xl font-bold text-bad">{{ stats.totalLosses }}</div>
                <div class="subtitle mt-1">Losses</div>
            </div>
            <div>
                <div class="text-xl font-bold text-primary">{{ stats.winRate }}</div>
                <div class="subtitle mt-1">Winrate</div>
            </div>
        </div>
    </div>

    <div v-if="showHistory" class="fixed inset-0 bg-background bg-opacity-70 rounded-2xl flex justify-center items-center z-50 p-4">
        <div class="bg-section-background border-2 border-dark-primary p-4 md:p-6 rounded-lg max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <h2 class="section-title mb-4">History</h2>
            
            <div class="thin-scrollbar overflow-y-auto pr-2">
                
                <div v-if="historyList.length === 0" class="p-8 text-center text-primary italic border border-border-background rounded-lg bg-section-background">
                    No matches found, go play some games!
                </div>

                <template v-else>
                    
                    <div class="md:hidden flex flex-col gap-3">
                        <div v-for="(game, index) in historyList" :key="'mob-'+index" 
                            class="bg-card-background border border-border-background p-4 rounded-xl shadow-sm">
                            
                            <div class="flex justify-between items-start mb-3 border-b border-border-background pb-2">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-primary">{{ formatDate(game.playedAt).date }}</span>
                                    <span class="text-xs text-primary">{{ formatDate(game.playedAt).time }}</span>
                                </div>
                                <div class="font-black px-2 py-1 rounded text-xs tracking-wider underline"
                                    :class="game.result === 'WON' ? 'text-secondary' : 'text-bad'">
                                    {{ game.result.toUpperCase() }}
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-2 text-center text-sm">
                                <div class="flex flex-col">
                                    <span class="text-[10px] uppercase tracking-widest text-primary mb-1">Role</span>
                                    <span class="font-bold capitalize">{{ game.role }}</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] uppercase tracking-widest text-primary mb-1">Mode</span>
                                    <span class="font-bold capitalize" :class="game.gameMode === 'classic' ? 'text-secondary' : 'text-highlight'">
                                        {{ game.gameMode }}
                                    </span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] uppercase tracking-widest text-primary mb-1">Players</span>
                                    <span class="font-bold text-primary">{{ game.numbOfPlayers }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <table class="hidden md:table w-full table-fixed text-sm mt-4">
                        <thead class="text-primary border-b border-border-background sticky top-0 bg-card-background z-10">
                            <tr>
                                <th class="p-3 w-1/5 text-lg text-center tracking-tighter">Date</th>
                                <th class="p-3 w-1/5 text-lg text-center tracking-tighter">Mode</th>
                                <th class="p-3 w-1/5 text-lg text-center tracking-tighter">Players</th>
                                <th class="p-3 w-1/5 text-lg text-center tracking-tighter">Role</th>
                                <th class="p-3 w-1/5 text-lg text-center tracking-tighter">Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(game, index) in historyList" :key="index" 
                                class="bg-card-background border-b border-border-background hover:bg-section-background transition-colors">
                                <td class="p-3 text-center">
                                    <div class="flex flex-col items-center">
                                        <span class="font-bold text-primary">{{ formatDate(game.playedAt).date }}</span>
                                        <span class="text-xs text-primary">{{ formatDate(game.playedAt).time }}</span>
                                    </div>
                                </td>
                                <td class="p-3 text-center capitalize font-bold"
                                    :class="game.gameMode === 'classic' ? 'text-secondary' : 'text-highlight'">
                                    {{ game.gameMode }}
                                </td>
                                <td class="p-3 text-center font-bold text-primary">{{ game.numbOfPlayers }}</td>
                                <td class="p-3 text-center italic capitalize font-bold">{{ game.role }}</td>
                                <td class="p-3 text-center font-black" 
                                    :class="game.result === 'WON' ? 'text-secondary' : 'text-bad'">
                                    {{ game.result.toUpperCase() }}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </template>
            </div>
            
            <div class="mt-4 md:mt-8 text-center pb-2 shrink-0">
                <button @click="showHistory = false" class="link-button">
                    Close History
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import { statsApi } from '../services/api';
import { defineAsyncComponent } from 'vue'
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });
    
export default {
    components: {
        HistoryIcon: defineAsyncComponent(icons['../assets/img/clock.svg']),
        RecordIcon: defineAsyncComponent(icons['../assets/img/stats.svg'])
    },
    data() {
        return {
            showHistory: false,
            stats: {
                totalGames: 0,
                totalWins: 0,
                totalLosses: 0,
                winRate: "0%"
            },
            historyList: []
        };
    },
    mounted() {
        this.loadStats();
    },
    methods: {
        async loadStats() {
            try{
                const statsRes = await statsApi.get(`/stats`);
                this.stats = statsRes.data;
            } catch (error){
                console.error('Error loading stats:', error);
            }
        },
        async fetchHistory() {
            this.showHistory = true;
            try {
                const response = await statsApi.get(`/history`);
                this.historyList = response.data;
            } catch (error) {
                console.error('Error loading history:', error);
            }
        },
        formatDate(dateString) {
            if (!dateString) return { date: '-', time: '' };
            const date = new Date(dateString);
            return {
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        }
    }
}
</script>