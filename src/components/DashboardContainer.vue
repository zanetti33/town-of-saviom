<template>
    <div class="bg-container">
        <div class="main-container">
            <div>
                <img :src="imageUrl" alt="Player Icon" class="profile-preview" />
                <h1 class="main-title">Welcome, {{ username }}</h1>
            </div>
            <div class="flex items-center justify-center gap-4 mb-4">
                <h2 class="text-xl font-bold text-purple-400">
                    games: {{ stats.totalGames }} | win: {{ stats.totalWins }} | 
                    loss: {{ stats.totalLosses }} | win percentage: {{ stats.winRate }}
                </h2>
                <button class="main-button m-0! py-1! px-3! text-sm" @click="fetchHistory">
                    History
                </button>
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
            <button class="main-button" @click="logout">
                Logout
            </button>
            <button class="main-button" @click="createRoom">
                Create Room
            </button>
            <button class="main-button" @click="joinRoom">
                Join Room
            </button>
            <button class="main-button"  @click="openOptions">
                Options
            </button>
            <button class="main-button"  @click="showRules = true">
                Rules
            </button>
            <div v-if="showRules" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                <div class="bg-gray-800 border-2 border-purple-600 p-6 rounded-lg max-w-3xl w-full shadow-2xl">
                    <h2 class="text-2xl font-bold mb-4 text-purple-400 underline">Game Rules</h2>
                    
                    <div class="max-h-96 overflow-y-auto mb-4 text-sm leading-relaxed">
                        <pre class="font-sans whitespace-pre-wrap text-gray-200">{{ rulesContent }}</pre>
                    </div>
                    <button class="no-button" @click="showRules = false">X</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DashboardContainer',
    data() {
        return {
            username: 'Player',
            imageUrl: new URL(`../assets/img/profile/default.png`, import.meta.url).href,
            showRules: false,
            showHistory: false,
            rulesContent: rulesText,
            stats: {
                totalGames: 0,
                totalWins: 0,
                totalLosses: 0,
                winRate: "0%"
            },
            historyList: []
        }
    },
    mounted() {
        this.loadUserData();
        this.loadStats();
    },
    methods: {
        async loadUserData() {
            try {
                const response = await loginApi.get(`/users/me`);
                const userData = response.data; 

                if (userData) {
                    this.username = userData.name || 'Player';
                    if (userData.imageUrl) {
                        this.imageUrl = new URL(`../assets/img/profile/${userData.imageUrl}`, import.meta.url).href;
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        },
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
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        createRoom() {
            console.log('Create room clicked');
            router.push('/rooms/create');
        },
        joinRoom() {
            console.log('Join room clicked');
            router.push('/rooms');
        },
        openOptions() {
            console.log('Options clicked');
            router.push('/options');
        },
        logout() {
            console.log('Logout clicked');
            router.push('/logout');
        },
        register() {
            console.log('Register clicked');
            router.push('/register');
        },
    }
};

import router from '../router';
import rulesText from '../assets/rules/rules.txt?raw';
import { loginApi, statsApi } from '../services/api';
</script>

<style scoped>
</style>