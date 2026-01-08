<template>
    <div class="bg-container">
        <div class="main-container">
            <div>
                <img :src="imageUrl" alt="Player Icon" class="profile-preview" />
                <h1 class="main-title">Welcome, {{ username }}</h1>
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
                <div class="bg-gray-800 border-2 border-yellow-600 p-6 rounded-lg max-w-lg w-full text-white shadow-2xl">
                    <h2 class="text-2xl font-bold mb-4 text-yellow-500 underline">Game Rules</h2>
                    
                    <div class="max-h-96 overflow-y-auto mb-4 text-sm leading-relaxed">
                        <pre class="font-sans whitespace-pre-wrap text-gray-200">{{ rulesContent }}</pre>
                    </div>
                    <button 
                        class="mt-4 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition"
                        @click="showRules = false">
                        X
                    </button>
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
            rulesContent: rulesText
        }
    },
    async mounted() {
        await this.loadUserData();
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
        login() {
            console.log('Login clicked');
            router.push('/login');
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
import { loginApi } from '../services/api';
</script>

<style scoped>
</style>