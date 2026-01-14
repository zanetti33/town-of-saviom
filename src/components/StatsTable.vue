<template>
    <div class="bg-background-2 border border-background-4 rounded-xl p-5 shadow-inner relative group">

        <div class="flex items-center justify-between mb-4 border-b border-background-4 pb-2">
            <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-background-5 uppercase tracking-wider">Your Stats</span>
            </div>

            <button 
                @click="fetchHistory" 
                class="flex items-center gap-1 text-sm uppercase font-bold cursor-pointer text-light-primary hover:text-white bg-dark-primary/10 hover:bg-dark-primary/20 border border-dark-primary/30 px-2 py-1 rounded transition-all"
            >
                <component 
                    :is="getIconComponent('clock.svg')"
                    class="w-4 h-4"
                    :aria-label="'Icon history'"/>
                <span>History</span>
            </button>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center divide-x divide-background-4">
            <div>
                <div class="text-xl font-bold text-light-primary">{{ stats.totalGames }}</div>
                <div class="subtitle mt-1">Played</div>
            </div>
            <div>
                <div class="text-xl font-bold text-light-blue">{{ stats.totalWins }}</div>
                <div class="subtitle mt-1">Wins</div>
            </div>
            <div>
                <div class="text-xl font-bold text-light-red">{{ stats.totalLosses }}</div>
                <div class="subtitle mt-1">Losses</div>
            </div>
            <div>
                <div class="text-xl font-bold text-light-primary">{{ stats.winRate }}</div>
                <div class="subtitle mt-1">Winrate</div>
            </div>
        </div>
    </div>

    <div v-if="showHistory" class="fixed inset-0 bg-background-1 bg-opacity-70 flex justify-center items-center z-50">
        <div class="bg-gray-800 border-2 border-dark-primary p-6 rounded-lg max-w-4xl w-full shadow-2xl">
            <h2 class="text-2xl font-bold mb-4 text-light-primary underline">History</h2>
            
            <div class="max-h-96 overflow-y-auto mb-4">
                <table class="w-full text-left text-sm text-background-5">
                    <thead class="text-light-primary border-b border-background-4">
                        <tr>
                            <th class="p-2">Date</th>
                            <th class="p-2">Mode</th>
                            <th class="p-2">Players</th>
                            <th class="p-2">Role</th>
                            <th class="p-2 text-right">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="historyList.length === 0">
                            <td colspan="5" class="p-4 text-center text-background-5">No matches found, go play some games!</td>
                        </tr>
                        <tr v-for="(game, index) in historyList" :key="index" class="border-b border-background-4 hover:bg-background-3">
                            <td class="p-2">{{ formatDate(game.playedAt) }}</td>
                            <td class="p-2 capitalize">{{ game.gameMode }}</td>
                            <td class="p-2 text-center">{{ game.numbOfPlayers }}</td>
                            <td class="p-2 italic">{{ game.role }}</td>
                            <td class="p-2 font-bold text-right" :class="game.result === 'won' ? 'text-light-blue' : 'text-light-red'">
                                {{ game.result.toUpperCase() }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-8 text-center pb-2">
                <button @click="showHistory = false" class="link-button">
                    Return to dashboard
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import { statsApi } from '../services/api';
import { defineAsyncComponent } from 'vue'
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });
const iconsCache = new Map();
    
export default {
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
        getIconComponent(imgName) {
            const path = `../assets/img/${imgName}`;
            
            if (iconsCache.has(path)) {
                return iconsCache.get(path);
            }
            if (!icons[path]) {
                console.warn(`Icon not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(icons[path]);
            iconsCache.set(path, comp);
            return comp;
        },
    }
}
</script>