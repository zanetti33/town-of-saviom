<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Join Room</h2>
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by room name or code..."
                class="form-field m-4"
            />
            <div class="mode-filters">
                <button 
                    :class="['filter-btn main-button', { active: this.selectedMode === 'classic' }]" 
                    @click="setMode('classic')"
                >
                    Classic
                </button>
                <button 
                    :class="['filter-btn main-button', { active: this.selectedMode === 'advanced' }]" 
                    @click="setMode('advanced')"
                >
                    Advanced
                </button>
                <button v-bind:disabled="!this.selectedMode" class="main-button" @click="this.selectedMode = null">
                    All
                </button>
            </div>
            
            <div v-for="room in filteredRooms" :key="room.id">
                <div v-if="room.status !== 'playing'" class="border border-gray-700 rounded-md p-8">
                    <h3>{{ room.name }}</h3>
                    <p>{{ room.code }}</p>
                    <p>{{ room.gameMode }}</p>
                    <button class="main-button" @click="joinRoom(room)">Join</button>
                </div>
            </div>
            <div v-if="filteredRooms.length === 0">
                No rooms found.
            </div>
            <button @click="$router.push('/dashboard')" class="link-button">Return to dashboard</button>
        </div>
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
            selectedMode: null
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
                
                const matchesMode = this.selectedMode === null || room.gameMode === this.selectedMode;

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
            this.selectedMode = this.selectedMode === mode ? null : mode;
        },
        joinRoom(room) {
            router.push(`/rooms/${room._id}`);
        }
    }
};
</script>

<style scoped>
</style>