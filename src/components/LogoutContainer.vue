<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Logout</h2>
            <div class="center">
                <p>Are you sure you want to logout?</p>
            </div>
            <button class="no-button" @click="handleLogout">Yes, log me out</button>
            <button class="main-button" @click="$router.push('/dashboard')">Return to dashboard</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LogoutContainer',
    methods: {
        handleLogout() {
            console.log('Logging out user');
            logout();
            router.push('/dashboard');
        }
    }
};

const logout = async () => {
    try {
        await loginApi.post('/auth/logout');
        const authStore = useAuthStore();
        authStore.clearAuth();
        console.log("Logout successful");
        router.push('/login');
    } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed");
    }
};

import { useAuthStore } from '../stores/authStore';
import { loginApi } from '../services/api';
import router from '../router';
</script>

<style scoped>
</style>