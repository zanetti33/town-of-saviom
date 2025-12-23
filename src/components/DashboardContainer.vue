<template>
    <div>
        <div>
            <img src="../assets/img/default.png" alt="Player Icon" />
            <p>Welcome, Player</p>
        </div>

        <button @click="createRoom">Create Room</button>
        <button @click="joinRoom">Join Room</button>
        <button @click="openOptions">Options</button>
        <button @click="logout">Logout</button>
    </div>
</template>

<script>
export default {
    name: 'DashboardContainer',
    methods: {
        createRoom() {
            console.log('Create room clicked');
        },
        joinRoom() {
            console.log('Join room clicked');
            this.$router.push('/rooms');
        },
        openOptions() {
            console.log('Options clicked');
        },
        logout() {
            console.log('Logout clicked');
        }
    }
};
</script>

<style scoped>
</style>