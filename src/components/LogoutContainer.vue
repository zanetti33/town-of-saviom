<template>
    <div class="logout-container">
        <div class="logout-box">
            <h1>Logout</h1>
            <p>Are you sure you want to logout?</p>
            <button @click="handleLogout">Yes, log me out</button>
            <button @click="$router.push('/dashboard')">Cancel</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LogoutContainer',
    methods: {
        handleLogout() {
            console.log('Logging out user');
            useAuthStore().clearAuth();
            router.push('/login');
        }
    }
};

import { useAuthStore } from '../stores/authStore';
import router from '../router';
</script>

<style scoped>
</style>