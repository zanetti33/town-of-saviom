<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Join Room</h2>
            <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search by room name or code..."
                class="form-field"
            />
            <div class="mode-filters m-6 justify-center flex items-center gap-4">
                <label class="text-background-5">Game Mode:</label>
                <div class="p-1 rounded-lg inline-flex border border-background-4">
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
            
            <div v-for="room in filteredRooms" :key="room.id">
                <div v-if="room.status !== 'playing'" class="relative bg-background-3 border border-background-4 rounded-md p-4 mb-4">
                    <h3 class="font-bold">{{ room.name }}</h3>
                    <p>#{{ room.code }}</p>
                    <p class="text-background-5">{{ room.gameMode }}</p>
                    <button class="main-button absolute bottom-4 right-4 bg-dark-primary rounded-md py-1 px-3" @click="joinRoom(room)">Join</button>
                </div>
            </div>
            <div v-if="filteredRooms.length === 0">
                No rooms found.
            </div>
            <div class="mt-8 text-center pb-2">
                <button @click="$router.push('/dashboard')" class="link-button">
                    Return to dashboard
                </button>
            </div>
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