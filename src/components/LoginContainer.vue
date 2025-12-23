<template>
    <div class="login-container">
        <div class="login-box">
            <h1>Login</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="emailOrName">Email or Username:</label>
                    <input
                        id="emailOrName"
                        v-model="emailOrName"
                        type="text"
                        required
                        placeholder="Enter your email or username"
                    />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            <p v-if="error">{{ error }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginContainer',
    data() {
        return {
            emailOrName: '',
            password: '',
            error: ''
        };
    },
    methods: {
        handleLogin() {
            if (this.emailOrName && this.password) {
                console.log('Login attempt:', { emailOrName: this.emailOrName, password: this.password });
                login(this.emailOrName, this.password);
                this.error = '';
            } else {
                this.error = 'Please fill in all fields';
            }
        }
    }
};
import { loginApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

const login = async (emailOrName, password) => {
    try {
        // Call Login (Browser sets cookie, we get JSON)
        const res = await loginApi.post('/auth/login', { emailOrName, password });
        
        // Save Access Token to Memory
        const authStore = useAuthStore();
        authStore.setToken(res.data.accessToken);

        // Fetch User Info
        const userInfoRes = await loginApi.get('/users/me');
        authStore.setUser(userInfoRes.data); 

        console.log("Login successful:", userInfoRes.data);
        console.log("Push on dashboard");
        router.push('/dashboard');
    } catch (err) {
        console.error("Login failed:", err);
        alert("Login failed");
    }
};
</script>

<style scoped>
</style>