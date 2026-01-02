<template>
    <div>
        <div>
            <img src="../assets/img/default.png" alt="Player Icon" />
            <p>Welcome, Player</p>
        </div>

        <button @click="login" v-if="user==null">Login</button>
        <button @click="logout" v-if="user!=null">Logout</button>
        <button @click="createRoom">Create Room</button>
        <button @click="joinRoom">Join Room</button>
        <button @click="openOptions">Options</button>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: null
        };
    },
    mounted() {
        this.user = this.getUser();
    },
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
        },
        logout() {
            console.log('Logout clicked');
            router.push('/logout');
        },
        async getUser() { 
            const user = await loginApi.get('/users/me');
            console.log("Fetched user info:", user.data);
            return user.data;
        }
    }
};

import { loginApi } from '../services/api';
import router from '../router';
</script>

<style scoped>
</style>