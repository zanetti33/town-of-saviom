<template>
    <div class="bg-container">
        <div class="main-container">
            <div>
                <img src="../assets/img/default.png" alt="Player Icon" />
                <h1 class="main-title">Welcome, Player</h1>
            </div>

            <button class="main-button" @click="logout">
                Logout
            </button>
            <button class="main-button" @click="createRoom">
                Create Room
            </button>
            <button class="main-button" @click="joinRoom">
                Join Room
            </button>
            <button class="main-button" @click="openOptions">
                Options
            </button>
        </div>
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