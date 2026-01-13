<template>
    <div class="bg-[#0B0F19] border border-slate-700 rounded-xl p-5 shadow-inner relative group">

        <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Stats</span>
            </div>

            <button 
                @click="fetchHistory" 
                class="flex items-center gap-1 text-sm uppercase font-bold cursor-pointer text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded transition-all"
            >
                <span>History</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center divide-x divide-slate-800">
            <div>
                <div class="text-xl font-bold text-white">{{ stats.totalGames }}</div>
                <div class="text-[10px] text-slate-500 uppercase mt-1">Played</div>
            </div>
            <div>
                <div class="text-xl font-bold text-green-400">{{ stats.totalWins }}</div>
                <div class="text-[10px] text-slate-500 uppercase mt-1">Wins</div>
            </div>
            <div>
                <div class="text-xl font-bold text-red-400">{{ stats.totalLosses }}</div>
                <div class="text-[10px] text-slate-500 uppercase mt-1">Losses</div>
            </div>
            <div>
                <div class="text-xl font-bold text-purple-400">{{ stats.winRate }}</div>
                <div class="text-[10px] text-slate-500 uppercase mt-1">Winrate</div>
            </div>
        </div>
    </div>

    <div v-if="showHistory" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div class="bg-gray-800 border-2 border-purple-600 p-6 rounded-lg max-w-4xl w-full shadow-2xl">
            <h2 class="text-2xl font-bold mb-4 text-purple-400 underline">History</h2>
            
            <div class="max-h-96 overflow-y-auto mb-4">
                <table class="w-full text-left text-sm text-gray-200">
                    <thead class="text-purple-400 border-b border-gray-600">
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
                            <td colspan="5" class="p-4 text-center text-gray-400">No matches found, go play some games!</td>
                        </tr>
                        <tr v-for="(game, index) in historyList" :key="index" class="border-b border-gray-700 hover:bg-gray-700">
                            <td class="p-2">{{ formatDate(game.playedAt) }}</td>
                            <td class="p-2 capitalize">{{ game.gameMode }}</td>
                            <td class="p-2 text-center">{{ game.numbOfPlayers }}</td>
                            <td class="p-2 italic">{{ game.role }}</td>
                            <td class="p-2 font-bold text-right" :class="game.result === 'won' ? 'text-green-500' : 'text-red-500'">
                                {{ game.result.toUpperCase() }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button class="no-button" @click="showHistory = false">X</button>
        </div>
    </div>
</template>
<script>
import { statsApi } from '../services/api';
    
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
        }
    }
}
</script>