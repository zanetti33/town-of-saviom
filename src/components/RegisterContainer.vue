<template>
    <div class="bg-container">
        <div class="text-center mb-8">
            <div class="flex justify-center mb-4">
                <div class="relative">
                    <div class="absolute inset-0 bg-purple-600 blur-xl opacity-50 rounded-full"></div>
                    <CastleIcon class="w-25 h-25"/>
                </div>
            </div>
            
            <h1 class="main-title">
                TOWN OF SAVIOM
            </h1>
        <!-- <p class="text-slate-400 text-sm tracking-widest uppercase">Survival is a choice.</p> -->
        </div>
        <div class="login-container">
            <h2 class="section-title">Register</h2>

            <form @submit.prevent="handleRegistration" class="space-y-4 w-full">

                <div class="form-group">
                    <label for="email" class="sr-only">Email:</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        required
                        placeholder="Email"
                        class="form-field"
                    />
                </div>
                <div class="form-group">
                    <label for="username" class="sr-only">Username:</label>
                    <input
                        id="username"
                        v-model="username"
                        type="text"
                        required
                        placeholder="Username"
                        class="form-field"
                    />
                </div>
                <div class="form-group">
                    <label for="password" class="sr-only">Password:</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        required
                        placeholder="Password"
                        class="form-field"
                    />
                </div>
                <div class="form-group">
                    <label for="confirmPassword" class="sr-only">Confirm Password:</label>
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        required
                        placeholder="Confirm password"
                        class="form-field"
                    />
                </div>
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
                <button type="submit" class="submit-button">Register</button>
            </form>
            <div class="mt-8 text-center text-slate-400 text-sm">
                <button @click="$router.push('/login')" class="link-button">
                    Back to login
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { loginApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import router from '../router';
import { defineAsyncComponent } from 'vue'
const icons = import.meta.glob('../assets/img/*.svg', { query: '?component' });

export default {
    name: 'RegisterContainer',
    components: {
        CastleIcon: defineAsyncComponent(icons['../assets/img/castle.svg'])
    },
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
        async handleRegistration() {
            if (this.password === this.confirmPassword) {
                this.error = '';
                console.log('Registration attempt:', { email: this.email, name: this.username, password: this.password, confirmPassword: this.confirmPassword });
                try {
                    // Call Register
                    await loginApi.post('/users', { email: this.email, name: this.username, password: this.password });

                    // Call Login
                    const res = await loginApi.post('/auth/login', { emailOrName: this.username, password: this.password });

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
                    this.error = 'Email or Username already in use.';
                }
            } else {
                this.error = 'Please fill in all fields and ensure passwords match.';
            }
        }
    }
};

</script>

<style scoped>
</style>