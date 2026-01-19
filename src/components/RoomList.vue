<template>
    <div class="relative flex justify-center items-center w-full">
        <h2 class="section-title">Join Room</h2>

        <button @click="refreshRoomList" class="form-button bg-secondary! absolute right-0">
            <UpdateIcon class="w-4 h-4"
                                :aria-label="'Icon update'"/>
        </button>
    </div>
    <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search by room name or code..."
        class="form-field"
    />
    <div class="mode-filters justify-center flex items-center gap-4">
        <label class="text-primary">Game Mode:</label>
        <div class="p-1 rounded-lg inline-flex border border-border-background">
            <label for="all" class="cursor-pointer">
                <input id="all" value="all" v-model="selectedMode" type="radio" class="peer sr-only" checked/>
                <span class="item-selector">All</span>
            </label>
            <label for="classic" class="cursor-pointer">
                <input id="classic" value="classic" v-model="selectedMode" type="radio" class="peer sr-only"/>
                <span class="item-selector">Classic</span>
            </label>
            <label for="advanced" class="cursor-pointer">
                <input id="advanced" value="advanced" v-model="selectedMode" type="radio" class="peer sr-only"/>
                <span class="item-selector">Advanced</span>
            </label>
        </div>
    </div>
    <p v-if="filteredRooms.length === 0">No rooms found.</p>
    <div v-else class="max-h-96 overflow-y-auto thin-scrollbar">
        <div v-for="room in filteredRooms" :key="room.id" class="mb-4">
            <RoomCard :room="room" />
        </div>
    </div>
</template>

<script>
import { lobbyApi } from '../services/api';
import RoomCard from './RoomCard.vue';
import { useAuthStore } from '../stores/authStore';
import { defineAsyncComponent } from 'vue'
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });

export default {
    name: 'RoomList',
    components: {
        UpdateIcon: defineAsyncComponent(icons['../assets/img/update.svg']),
        RoomCard
    },
    data() {
        return {
            rooms: [],
            searchQuery: '',
            selectedMode: "all"
        };
    },
    mounted() {
        this.fetchRooms();
    },
    computed: {
        filteredRooms() {
            const query = this.searchQuery.toLowerCase();
            
            return this.rooms.filter(room => {
                const matchesSearch = room.name.toLowerCase().includes(query) || 
                                     (room.code && room.code.toLowerCase().includes(query));
                
                const matchesMode = this.selectedMode === "all" || room.gameMode === this.selectedMode;
                if(!this.isAdmin() ) {                  
                    const status = room.status !== 'playing';
                    return matchesSearch && matchesMode && status;
                }
                return matchesSearch && matchesMode;
            });
        }
    },
   methods: {
        isAdmin() {
            const authStore = useAuthStore();
            return authStore.user.isAdmin;
        },
        async fetchRooms() {
            try {
                const response = await lobbyApi.get('/rooms');
                this.rooms = await response.data;
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        },
        setMode(mode) {
            this.selectedMode = this.selectedMode === mode ? null : mode;
        },
        refreshRoomList(){
            this.fetchRooms();
        }
    }
};
</script>

<style scoped>
</style>