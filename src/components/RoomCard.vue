<template>
    <div v-if="room.status !== 'playing'" class="relative bg-background-3 border border-background-4 rounded-md p-4 mb-4">
        <h3 class="font-bold">{{ room.name }}</h3>
        <p>#{{ room.code }}</p>
        <p class="text-background-5">{{ room.gameMode }}</p>
        <button class="submit-button" @click="joinRoom(room)">Join</button>
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
        }
    }
};
</script>