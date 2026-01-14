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
                    <component 
                        :is="getAvatarComponent(imageUrl)"
                        class="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"/>
                </div>
            </div>

            <StatsTable />
            
            <button @click="createRoom" class="submit-button w-full flex items-center justify-center gap-3 py-4 text-base m-0!" >
                <component 
                    :is="getIconComponent('potion.svg')"
                    class="w-8 h-8"
                    :aria-label="'Icon potion'"
                />
                Create Room
            </button>

            <button  @click="joinRoom" class="w-full bg-background-3 hover:bg-[#2D3F59] border border-slate-600 text-slate-200 font-bold rounded-lg px-5 py-4 flex items-center justify-center gap-3 transition-all shadow-lg">
                <component 
                    :is="getIconComponent('battle.svg')"
                    class="w-8 h-8"
                    :aria-label="'Icon battle'"
                />
                Join Room
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button @click="showRules = true" class="transparent-button">
                    <component 
                        :is="getIconComponent('rules.svg')"
                        class="w-8 h-8"
                        :aria-label="'Icon rules'"
                    />
                    Rules
                </button>
                <button @click="openOptions" class="transparent-button">
                    <component 
                        :is="getIconComponent('options.svg')"
                        class="w-8 h-8"
                        :aria-label="'Icon options'"
                    />
                    Options
                </button>
            </div>

            <div class="text-center pb-2">
                <button @click="logout" class="no-link-button">
                    Log Out
                </button>
            </div>

            <div v-if="showRules" class="fixed inset-0 bg-background-1 bg-opacity-70 flex justify-center items-center z-50">
                <div class="main-container">  
                    <h1 class="section-title">Town of Saviom Rules</h1>                          
                    <div class="max-h-96 overflow-y-auto mt-4 text-sm leading-relaxed">
                        <div v-html="rulesContent"></div>
                    </div>
                    <div class="text-center pb-2">
                        <button @click="showRules = false" class="link-button">
                            Close Rules
                        </button>
                    </div>
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
                
                <div class="username-info-top-right mb-6">
                    <span class="text-white font-bold text-sm tracking-wide">{{ username }}</span>
                    <component 
                        :is="getAvatarComponent(imageUrl)"
                        class="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"/>
                </div>
            </div>
            <div class="flex justify-between">
                <div class="invisible-main-container">
                    <StatsTable />

                    <button @click="createRoom" class="submit-button w-full flex items-center justify-center text-base py-4" >
                        <component 
                            :is="getIconComponent('potion.svg')"
                            class="w-8 h-8"
                            :aria-label="'Icon potion'"
                        />
                        Create Room
                    </button>

                    <div class="grid grid-cols-2 gap-4">
                        <button @click="showRules = true" class="transparent-button">
                            <component 
                                :is="getIconComponent('rules.svg')"
                                class="w-8 h-8"
                                :aria-label="'Icon rules'"
                            />
                            Rules
                        </button>
                        <button @click="openOptions" class="transparent-button">
                            <component 
                                :is="getIconComponent('options.svg')"
                                class="w-8 h-8"
                                :aria-label="'Icon options'"
                            />
                            Options
                        </button>
                    </div>

                    <div class="text-center pb-2">
                        <button @click="logout" class="no-link-button">
                            Log Out
                        </button>
                    </div>
                    <div v-if="showRules" class="fixed inset-0 bg-background-1 bg-opacity-70 flex justify-center items-center z-50">
                        <div class="main-container">  
                            <h1 class="section-title">Town of Saviom Rules</h1>                          
                            <div class="max-h-96 overflow-y-auto mt-4 text-sm leading-relaxed">
                                <div v-html="rulesContent"></div>
                            </div>
                            <div class="text-center pb-2">
                                <button @click="showRules = false" class="link-button">
                                    Close Rules
                                </button>
                            </div>
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
const iconsCache = new Map();
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarsCache = new Map();

export default {
    name: 'DashboardContainer',
    components: {
        RoomList,
        StatsTable
    },
    data() {
        return {
            username: 'Player',
            imageUrl: 'default.svg',
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
                        this.imageUrl = userData.imageUrl;
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
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
        getAvatarComponent(imgName) {
            const path = `../assets/img/profile/${imgName}`;
            
            if (avatarsCache.has(path)) {
                return avatarsCache.get(path);
            }
            if (!avatars[path]) {
                console.warn(`Avatar not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(avatars[path]);
            avatarsCache.set(path, comp);
            return comp;
        }
    }
};
</script>

<style scoped>
</style>