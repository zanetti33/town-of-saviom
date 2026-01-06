<template>
    <div>
        <div>
            <img src="../assets/img/default.png" alt="Player Icon" />
            <p class="text-blue-700">Welcome, Player</p>
        </div>

        <button class="flex border border-purple-500 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white" @click="logout">
            Logout
        </button>
        <button class="flex border border-purple-500 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white" @click="createRoom">
            Create Room
        </button>
        <button class="flex border border-purple-500 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white" @click="joinRoom">
            Join Room
        </button>
        <button class="flex border border-purple-500 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white" @click="openOptions">
            Options
        </button>
    </div>
</template>

<script>
export default {
    name: 'DashboardContainer',
    methods: {
        login() {
            console.log('Login clicked');
            router.push('/login');
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
        logout() {
            console.log('Logout clicked');
            router.push('/logout');
        },
        register() {
            console.log('Register clicked');
            router.push('/register');
        },
    }
};

import router from '../router';
</script>

<style scoped>
</style>