<template>
  <div class="bg-container">
    <div class="text-center mb-8">
      <div class="flex justify-center mb-4">
        <div class="relative">
          <div class=" absolute inset-0 bg-purple-600 blur-xl opacity-50 rounded-full"></div>
          <component :is="loadIcon('battle')" class="w-30 h-30"/>
        </div>
      </div>
      
      <h1 class="main-title mb-2">
        Town of Saviom
      </h1>
      <p class="text-background-5 text-sm tracking-widest uppercase">Survival is a choice.</p>
    </div>

    <div class="login-container">
      <h2 class="section-title">Login</h2>
        <form @submit.prevent="handleLogin" class="space-y-5 w-full">
          <div>
            <label for="emailOrName" class="sr-only">Email or Username</label>
            <input
              id="emailOrName"
              v-model="emailOrName"
              type="text"
              required
              class="form-field"
              placeholder="Username"
            />
          </div>

          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="form-field"
              placeholder="Password"
            />
          </div>

          <div v-if="error" class="error-message">
          {{ error }}
          </div>

          <button type="submit" class="submit-button mt-2">Enter the Town</button>
        </form>
    </div>

    <div class="mt-8 text-center text-slate-400 text-sm">
      Don't have an account? 
      <button @click="$router.push('/register')" class="link-button">
        Create Account
      </button>
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
    name: 'LoginContainer',
    data() {
        return {
            emailOrName: '',
            password: '',
            error: ''
        };
    },
    methods: {
        async handleLogin() {
            this.error = '';
            console.log('Login attempt:', { emailOrName: this.emailOrName, password: this.password });
            try {
                // Call Login (Browser sets cookie, we get JSON)
                const res = await loginApi.post('/auth/login', { emailOrName: this.emailOrName, password: this.password });
                
                // Save Access Token to Memory
                const authStore = useAuthStore();
                authStore.setToken(res.data.accessToken);

                // Fetch User Info
                const userInfoRes = await loginApi.get('/users/me');
                authStore.setUser(userInfoRes.data); 

                console.log("Login successful:", userInfoRes.data);
                console.log("Push on dashboard");
                router.push('/dashboard');
            } catch(error) {
                console.error("Login failed:", error);
                this.error = 'Wrong username or password.';
            }
        },
        loadIcon(name) {
            const key = '../assets/img/' + name + '.svg';
            return defineAsyncComponent(icons[key]);
        }
    }
};

</script>

<style scoped>
</style>