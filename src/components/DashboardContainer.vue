<template>
    <div class="bg-container">
        <div class="mobile-only main-container">
            <div class="flex justify-between">
                <div style="align-items: center;">
                    <h1 class="section-title text-4xl!">
                        Dashboard
                    </h1>
                </div>
                
                <div class="username-info-top-right">
                    <span class="text-white font-bold text-sm tracking-wide">{{ username }}</span>
                    <img 
                        :src="imageUrl" 
                        alt="Profile" 
                        class="w-12 h-12 rounded-full border-2 border-purple-500 object-cover" 
                    />
                </div>
            </div>

            <StatsTable />

            <button @click="createRoom" class="submit-button w-full flex items-center justify-center gap-3 py-4 text-base m-0!" >
                <component :is="loadIcon('potion')" class="w-8 h-8 text-3xl"/>
                Create Room
            </button>

            <button  @click="joinRoom" class="w-full bg-[#1E293B] hover:bg-[#2D3F59] border border-slate-600 text-slate-200 font-bold rounded-lg px-5 py-4 flex items-center justify-center gap-3 transition-all shadow-lg">
                <component :is="loadIcon('battle')" class="w-8 h-8"/>
                Join Room
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button @click="showRules = true" class="transparent-button">
                    <component :is="loadIcon('rules')" class="w-8 h-8"/>
                    Rules
                </button>
                <button @click="openOptions" class="transparent-button">
                    <component :is="loadIcon('options')" class="w-8 h-8"/>
                    Options
                </button>
            </div>

            <div class="text-center pb-2">
                <button @click="logout" class="link-button">
                    Log Out
                </button>
            </div>

            <div v-if="showRules" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                <div class="bg-gray-800 border-2 border-purple-600 p-6 rounded-lg max-w-3xl w-full shadow-2xl">
                    <h2 class="text-2xl font-bold mb-4 text-purple-400 underline">Game Rules</h2>
                    
                    <div class="max-h-96 overflow-y-auto mb-4 text-sm leading-relaxed">
                        <div v-html="rulesContent"></div>
                    </div>
                    <button class="no-button" @click="showRules = false">X</button>
                </div>
            </div>
        </div>
        <div class="desktop-only wide-container">
            <div class="flex justify-between">
                <div style="align-items: center;">
                    <h1 class="section-title text-4xl!">
                        Dashboard
                    </h1>
                </div>
                
                <div class="username-info-top-right">
                    <span class="text-white font-bold text-sm tracking-wide">{{ username }}</span>
                    <img 
                        :src="imageUrl" 
                        alt="Profile" 
                        class="w-12 h-12 rounded-full border-2 border-purple-500 object-cover" 
                    />
                </div>
            </div>
            <div class="flex justify-between">
                <div class="invisible-main-container">
                    <StatsTable />

                    <button @click="createRoom" class="submit-button w-full flex items-center justify-center text-base" >
                        <component :is="loadIcon('potion')" class="w-8 h-8 text-3xl"/>
                        Create Room
                    </button>

                    <div class="grid grid-cols-2 gap-4">
                        <button @click="showRules = true" class="transparent-button">
                            <component :is="loadIcon('rules')" class="w-8 h-8"/>
                            Rules
                        </button>
                        <button @click="openOptions" class="transparent-button">
                            <component :is="loadIcon('options')" class="w-8 h-8"/>
                            Options
                        </button>
                    </div>

                    <div class="text-center pb-2">
                        <button @click="logout" class="link-button">
                            Log Out
                        </button>
                    </div>

                    <div v-if="showRules" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                        <div class="bg-gray-800 border-2 border-purple-600 p-6 rounded-lg max-w-3xl w-full shadow-2xl">
                            <h2 class="text-2xl font-bold mb-4 text-purple-400 underline">Game Rules</h2>
                            
                            <div class="max-h-96 overflow-y-auto mb-4 text-sm leading-relaxed">
                                <div v-html="rulesContent"></div>
                            </div>
                            <button class="no-button" @click="showRules = false">X</button>
                        </div>
                    </div>

                </div>
                <div class="main-container">
                    <RoomList />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import router from '../router';
import rules from '../assets/rules/rules.html?raw';
import RoomList from './RoomList.vue';
import { loginApi } from '../services/api';
import { defineAsyncComponent } from 'vue'
import StatsTable from './StatsTable.vue';
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });

export default {
    name: 'DashboardContainer',
    components: {
        RoomList,
        StatsTable
    },
    data() {
        return {
            username: 'Player',
            imageUrl: new URL(`../assets/img/profile/default.png`, import.meta.url).href,
            showRules: false,
            rulesContent: rules,
            isMobileDevice: false
        }
    },
    mounted() {
        this.isMobileDevice = this.isMobile();
        this.loadUserData();
    },
    methods: {
        isMobile() {
            console.log(screen.width);
            if (screen.width <= 760) {
                return true
            } else {
                return false
            }
        },
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
        loadIcon(name) {
            const key = '../assets/img/' + name + '.svg';
            return defineAsyncComponent(icons[key]);
        }
    }
};
</script>

<style scoped>
</style>