<template>
    <div class="room-list">
        <div class="search-container">
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by room name or code..."
                class="search-input"
            />
            <div class="mode-filters">
                <button 
                    :class="['filter-btn', { active: this.selectedMode === 'classic' }]" 
                    @click="setMode('classic')"
                >
                    Classic
                </button>
                <button 
                    :class="['filter-btn', { active: this.selectedMode === 'advanced' }]" 
                    @click="setMode('advanced')"
                >
                    Advanced
                </button>
                <button v-if="this.selectedMode" class="reset-btn" @click="this.selectedMode = ''">
                    All
                </button>
            </div>
        </div>
        <div v-for="room in filteredRooms" :key="room.id" class="room-card">
            <div v-if="room.status !== 'playing'">
                <h3>{{ room.name }} <span class="room-code">#{{ room.code }}</span></h3>
                <span class="mode-badge">{{ room.gameMode }}</span>
            <button class="join-btn" @click="joinRoom(room)">Join</button>
            </div>
        </div>
        <div v-if="filteredRooms.length === 0" class="no-results">
            No rooms found.
        </div>
        <button @click="$router.push('/dashboard')">Return to dashboard</button>
    </div>
</template>

<script>
import { lobbyApi } from '../services/api';
import router from '../router';

export default {
    data() {
        return {
            rooms: [],
            searchQuery: '',
            selectedMode: ''
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
                
                const matchesMode = this.selectedMode === '' || room.gameMode === this.selectedMode;

                return matchesSearch && matchesMode;
            });
        }
    },
   methods: {
        async fetchRooms() {
            try {
                const response = await lobbyApi.get('/rooms');
                this.rooms = await response.data;
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        },
        setMode(mode) {
            this.selectedMode = this.selectedMode === mode ? '' : mode;
        },
        joinRoom(room) {
            router.push(`/rooms/${room._id}`);
        }
    }
};
</script>

<style scoped>
</style>