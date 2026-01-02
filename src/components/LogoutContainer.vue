<template>
    <div class="logout-container">
        <div class="logout-box">
            <h1>Logout</h1>
            <p>Are you sure you want to logout?</p>
            <button @click="handleLogout">Yes, log me out</button>
            <button @click="$router.push('/dashboard')">Return to dashboard</button>
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