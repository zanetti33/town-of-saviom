<template>
    <div class="bg-container">
        <div class="mobile-only main-container max-w-2xl">
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
                        class="w-12 h-12 rounded-full border-2 border-primary"/>
                </div>
            </div>

            <StatsTable />
            
            <button @click="createRoom" class="submit-button" >
                <CreateIcon class="w-8 h-8"
                                :aria-label="'Icon create'"/>
                <p>Create Room</p>
            </button>

            <button  @click="joinRoom" class="submit-button">
                <JoinIcon class="w-8 h-8"
                                :aria-label="'Icon join room'"/>
                Join Room
            </button>

            <div class="grid grid-cols-2 gap-4">
                <button @click="showRules = true" class="secondary-button">
                    <RulesIcon class="w-8 h-8"
                                :aria-label="'Icon rules'"/>
                    Rules
                </button>
                <button @click="openOptions" class="secondary-button">
                    <OptionsIcon class="w-8 h-8"
                                :aria-label="'Icon options'"/>
                    Options
                </button>
            </div>

            <div v-if="showRules" class="fixed inset-0 bg-background bg-opacity-70 rounded-2xl flex justify-center items-center z-50">
                <div class="main-container max-w-2xl md:max-w-4xl">  
                    <h1 class="section-title">Town of Saviom Rules</h1>                          
                    <div class="max-h-96 overflow-y-auto mt-4 text-sm leading-relaxed thin-scrollbar">
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
                        class="w-12 h-12 rounded-full border-2 border-primary"/>
                </div>
            </div>
            <div class="flex justify-between">
                <div class="invisible-main-container">
                    <StatsTable />

                    <button @click="createRoom" class="submit-button" >
                        <CreateIcon class="w-8 h-8"
                                :aria-label="'Icon create'"/>
                        Create Room
                    </button>

                    <div class="grid grid-cols-2 gap-4">
                        <button @click="showRules = true" class="secondary-button">
                            <RulesIcon class="w-8 h-8"
                                :aria-label="'Icon rules'"/>
                            Rules
                        </button>
                        <button @click="openOptions" class="secondary-button">
                            <OptionsIcon class="w-8 h-8"
                                :aria-label="'Icon options'"/>
                            Options
                        </button>
                    </div>

                    <div v-if="showRules" class="fixed inset-0 bg-background bg-opacity-70 rounded-2xl flex justify-center items-center z-50">
                        <div class="main-container max-w-2xl">  
                            <h1 class="section-title">Town of Saviom Rules</h1>                          
                            <div class="max-h-96 overflow-y-auto mt-4 text-sm leading-relaxed thin-scrollbar">
                                <div v-html="rulesContent"></div>
                            </div>
                            <div class="text-center">
                                <button @click="showRules = false" class="link-button">
                                    Close Rules
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="invisible-main-container-with-border max-w-2xl">
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
const avatars = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarsCache = new Map();

export default {
    name: 'DashboardContainer',
    components: {
        RoomList,
        StatsTable,
        CreateIcon: defineAsyncComponent(icons['../assets/img/potion.svg']),
        JoinIcon: defineAsyncComponent(icons['../assets/img/battle.svg']),
        RulesIcon: defineAsyncComponent(icons['../assets/img/rules.svg']),
        OptionsIcon: defineAsyncComponent(icons['../assets/img/options.svg'])
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
            return screen.width <= 760;            
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