<template>
    <div class="login-container">
        <div class="login-box">
            <h1>Login</h1>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label for="emailOrUsername">Email or Username:</label>
                    <input
                        id="emailOrUsername"
                        v-model="emailOrUsername"
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
                <button type="submit" class="login-btn">Login</button>
            </form>
            <p v-if="error" class="error-message">{{ error }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginContainer',
    data() {
        return {
            emailOrUsername: '',
            password: '',
            error: ''
        };
    },
    methods: {
        handleLogin() {
            if (this.emailOrUsername && this.password) {
                // Add your login logic here
                console.log('Login attempt:', { emailOrUsername: this.emailOrUsername, password: this.password });
                this.error = '';
            } else {
                this.error = 'Please fill in all fields';
            }
        }
    }
};
</script>

<style scoped>
</style>