<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Options</h2>
            <div class="options-image">
                <img src="../assets/img/default.png" alt="Player Icon" />
                <button @click="changeImage" class="main-button">Change profile picture</button>
            </div>

            <div class="options-password">
                <button @click="showChangePasswordForm = !showChangePasswordForm" class="main-button" >
                    {{ showChangePasswordForm ? 'Hide' : 'Change Password' }}
                </button>
                <form v-if="showChangePasswordForm" @submit.prevent="changePassword">
                    <div class="form-group">
                        <label for="oldPassword" class="sr-only">Old password:</label>
                        <input
                            id="oldPassword"
                            v-model="oldPassword"
                            type="password"
                            required
                            placeholder="Enter your old password"
                            class="form-field"
                        />
                    </div>
                    <div class="form-group">
                        <label for="newPassword" class="sr-only">New password:</label>
                        <input
                            id="newPassword"
                            v-model="newPassword"
                            type="password"
                            required
                            placeholder="Enter your new password"
                            class="form-field"
                        />
                    </div>
                    <div class="form-group">
                        <label for="confirmNewPassword" class="sr-only">Confirm new password:</label>
                        <input
                            id="confirmNewPassword"
                            v-model="confirmNewPassword"
                            type="password"
                            required
                            placeholder="Confirm your new password"
                            class="form-field"
                        />
                    </div>
                    <button type="submit" class="submit-button">Change Password</button>
                    <div class="error-message" v-if="newPassword !== confirmNewPassword">
                        <p>{{ error }}</p>
                    </div>
                </form> 
            </div>

            <div class="options-delete">
                <button @click="deleteAccount" class="no-button">Delete Account</button>
            </div>

            <button @click="$router.push('/dashboard')" class="link-button">Back to dashboard</button>
        </div>
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
            showChangePasswordForm: false,
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
            console.log('Change profile picture clicked. Not implemented yet.');
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