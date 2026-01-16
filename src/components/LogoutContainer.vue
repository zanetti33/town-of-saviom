<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <h2 class="section-title">Are you sure you want to logout?</h2>
            <div class="flex gap-4 mt-6">
                <button class="no-button px-3 py-5 flex-1" @click="handleLogout">Yes, log me out</button>
                <button class="submit-button px-3 py-5 flex-1" @click="$router.push('/dashboard')">No, return to dashboard</button>
            </div>
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