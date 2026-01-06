<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white p-4 font-sans">
    
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4">
        <div class="relative">
          <div class="absolute inset-0 bg-purple-600 blur-xl opacity-50 rounded-full"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="relative w-16 h-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
      
      <h1 class="text-4xl md:text-5xl font-bold tracking-wider mb-2 font-serif text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
        TOWN OF SAVIOM
      </h1>
      <p class="text-slate-400 text-sm tracking-widest uppercase">Survival is a choice.</p>
    </div>

    <div class="w-full max-w-md bg-[#131B2E] border border-slate-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
      <h2 class="text-2xl font-bold text-center text-white mb-6">Welcome Back</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <div class="form-group">
          <label for="emailOrName" class="sr-only">Email or Username</label>
          <input
            id="emailOrName"
            v-model="emailOrName"
            type="text"
            required
            class="w-full bg-[#1E293B] border border-slate-600 text-slate-200 placeholder-slate-500 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block p-3.5 transition-all outline-none"
            placeholder="Username"
          />
        </div>

        <div class="form-group">
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full bg-[#1E293B] border border-slate-600 text-slate-200 placeholder-slate-500 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block p-3.5 transition-all outline-none"
            placeholder="Password"
          />
        </div>

        <button 
          type="submit"
          class="w-full text-white bg-linear-to-r from-[#6366f1] to-[#a855f7] hover:from-[#5b5ee0] hover:to-[#9333ea] focus:ring-4 focus:outline-none focus:ring-purple-800 font-bold rounded-lg text-sm px-5 py-3.5 text-center transition-all shadow-lg shadow-purple-900/30 mt-2"
        >
          Enter the Town
        </button>
      </form>

      <div v-if="error" class="mt-4 p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm text-center">
        {{ error }}
      </div>
    </div>

    <div class="mt-8 text-center text-slate-400 text-sm">
      Don't have an account? 
      <button 
        @click="$router.push('/register')" 
        class="text-purple-400 hover:text-purple-300 font-bold hover:underline ml-1 transition-colors"
      >
        Create Account
      </button>
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