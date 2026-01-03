<template>
    <div class="room-list">
        <div v-for="room in rooms" :key="room.id" class="room-card">
            <h3>{{ room.name }}</h3>
            <button class="join-btn" @click="joinRoom(room)" v-if="room.status !== 'playing'">Join</button>
            <button class="join-btn" disabled="true" v-else>Join</button>
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
            rooms: []
        };
    },
    mounted() {
        this.fetchRooms();
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
        joinRoom(room) {
            router.push(`/rooms/${room._id}`);
        }
    }
};
</script>

<style scoped>
</style>