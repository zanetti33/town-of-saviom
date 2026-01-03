<template>
    <div class="options-container">
        <div class="options-image">
            <img src="../assets/img/default.png" alt="Player Icon" />
            <button @click="changeImage">Change profile picture</button>
        </div>

        <div class="options-password">
            <h2>Change password</h2>
            <form @submit.prevent="changePassword">
                <div class="form-group">
                    <label for="oldPassword">Old password:</label>
                    <input
                        id="oldPassword"
                        v-model="oldPassword"
                        type="password"
                        required
                        placeholder="Enter your old password"
                    />
                </div>
                <div class="form-group">
                    <label for="newPassword">New password:</label>
                    <input
                        id="newPassword"
                        v-model="newPassword"
                        type="password"
                        required
                        placeholder="Enter your new password"
                    />
                </div>
                <div class="form-group">
                    <label for="confirmNewPassword">Confirm new password:</label>
                    <input
                        id="confirmNewPassword"
                        v-model="confirmNewPassword"
                        type="password"
                        required
                        placeholder="Confirm your new password"
                    />
                </div>
                <button type="submit">Change Password</button>
            </form>
            <p v-if="newPassword !== confirmNewPassword">{{ error }}</p>
        </div>

        <div class="options-delete">
            <button @click="deleteAccount" style="background-color: red;">Delete Account</button>
        </div>

        <button @click="$router.push('/dashboard')">Back to dashboard</button>
    </div>
</template>

<script>

import { loginApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

export default {
    name: 'OptionsContainer',
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            error: 'Please fill in all fields. New password and confirm new password must be the same.'
        };
    },
    methods: {
        async changePassword() {
            if (this.oldPassword && this.newPassword && this.confirmNewPassword && 
                this.newPassword === this.confirmNewPassword) {
                console.log('Change Password attempt:', { oldPassword: this.oldPassword, newPassword: this.newPassword });
                try {
                    const res = await loginApi.put('/users/me/password', 
                        { oldPassword: this.oldPassword, newPassword: this.newPassword });
                    if (res.status === 200){
                        console.log('Password updated successfully');
                        alert('Password updated successfully');
                    }
                } catch (err) {
                    alert('Old password incorrect');
                    console.error('Error changing password:', err)
                }
            } else {
                this.error = 'Please fill in all fields. New password and confirm new password must be the same.';
            }
        },
        changeImage() {

        },
        async deleteAccount() {
            if(confirm('All your data will be lost forever. Do you want to delete your account?')){
                try {
                    await loginApi.delete('/users/me/delete');
                    console.log('Account deleted. Return to login.');
                    router.push('/login');
                } catch (err){
                    console.error('Error in deleting account:', err);
                }
            }
        }
    }
};

</script>

<style scoped>
</style>