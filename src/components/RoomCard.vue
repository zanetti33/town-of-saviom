<template>
    <div class="relative bg-card-background border border-border-background rounded-md p-4">
        <h3 class="font-bold">{{ room.name }}</h3>
        <p>#{{ room.code }}</p>
        <p class="text-primary">{{ room.gameMode }}</p>    
        <button v-if="room.status !== 'playing'" class="form-button absolute bottom-4 right-4" @click="joinRoom(room)">Join</button>
        <button v-else class="form-button bg-secondary! absolute bottom-4 right-4" @click="spectateRoom(room)">Spectate</button> 
    </div>
</template>

<script>
export default {
    name: 'RoomCard',
    props: {
        room: {
            type: Object,
            required: true
        }
    },
    methods: {
        joinRoom(room) {
            this.$router.push(`/rooms/${room._id}`);
        },
        spectateRoom(room) {
            this.$router.push(`/games/${room._id}`);
        }
    }
};
</script>