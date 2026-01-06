<template>
    <div class="register-container">
        <div class="register-box">
            <h1>Register</h1>
            <form @submit.prevent="handleRegistration">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        placeholder="Enter your email"
                    />
                </div>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input
                        id="username"
                        v-model="username"
                        type="text"
                        required
                        placeholder="Enter your username"
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
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password:</label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        required
                        placeholder="Confirm your password"
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            <p v-if="error">{{ error }}</p>
            <button @click="$router.push('/login')">Back to login</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegisterContainer',
    data() {
        return {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            error: ''
        };
    },
    methods: {
        handleRegistration() {
            if (this.email && this.username && this.password && this.confirmPassword && 
                this.password === this.confirmPassword) {
                console.log('Registration attempt:', { email: this.email, name: this.username, password: this.password, confirmPassword: this.confirmPassword });
                register(this.email, this.username, this.password);
                this.error = '';
            } else {
                this.error = 'Please fill in all fields and ensure passwords match';
            }
        }
    }
};
import { loginApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

const register = async (email, name, password) => {
    try {
        // Call Register
        await loginApi.post('/users', { email, name, password });
        
        // Call Login
        const res = await loginApi.post('/auth/login', { emailOrName: name, password });

        // Save Access Token to Memory
        const authStore = useAuthStore();
        authStore.setToken(res.data.accessToken);

        // Fetch User Info
        const userInfoRes = await loginApi.get('/users/me');
        authStore.setUser(userInfoRes.data); 

        console.log("Registration successful:", userInfoRes.data);
        console.log("Push on dashboard");
        router.push('/dashboard');
    } catch (err) {
        console.error("Registration failed:", err);
        alert("Registration failed");
    }
};
</script>

<style scoped>
</style>