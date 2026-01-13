<template>
    <div v-if="room.status !== 'playing'" class="border border-gray-700 rounded-md p-8">
        <h3>{{ room.name }}</h3>
        <p>{{ room.code }}</p>
        <p>{{ room.gameMode }}</p>
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