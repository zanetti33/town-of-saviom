<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { loginApi } from './services/api';
import { useAuthStore } from './stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 1. Loading state to prevent the app from rendering before we know who the user is
const isInitializing = ref(true);

onMounted(async () => {
  try {
    // Attempt to restore session via Cookie
    const res = await loginApi.post('/auth/refresh');
    
    // Success: Update Store
    authStore.setToken(res.data.accessToken);
    const userInfoRes = await loginApi.get('/users/me');
    authStore.setUser(userInfoRes.data); 
    
    console.log("Session restored!");

    if (route.path === '/login' || route.path === '/') {
        router.push('/dashboard');
    }
  } catch (e) {
    console.log("No session found");
    if (route.path !== '/login') {
        router.push('/login');
    }
  } finally {
    isInitializing.value = false;
  }
});
</script>

<template>
  <div v-if="isInitializing" class="app-loader">
    <div class="spinner"></div>
    <p>Loading application...</p>
  </div>

  <RouterView v-else />
</template>

<style>
/* Simple centered loader */
.app-loader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ccc;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

body {
  margin: 0;
  font-family: sans-serif;
}
</style>