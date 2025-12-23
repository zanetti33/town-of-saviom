// stores/authStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const user = ref(null);

    function setToken(token) {
        accessToken.value = token;
    }

    function setUser(userData) {
        user.value = userData;
    }

    function clearAuth() {
        accessToken.value = null;
        user.value = null;
    }

    return { accessToken, user, setToken, setUser, clearAuth };
});