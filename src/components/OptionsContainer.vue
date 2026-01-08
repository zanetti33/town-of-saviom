<template>
    <div class="options-container">
        <div class="options-image">
            <button @click="showImagePicker = true">Change profile picture</button>
        </div>

        <div v-if="showImagePicker" class="modal-overlay" @click.self="showImagePicker = false">
            <div class="modal-content">
                <h3>Select your Avatar</h3>
                <div class="image-grid">
                    <img 
                        v-for="img in availableImages" 
                        :src="getAvatarUrl(img)" 
                        @click="selectImage(img)"
                        class="selectable-image"
                    />
                </div>
                <button @click="showImagePicker = false">Cancel</button>
            </div>
        </div>

        <div class="options-password">
            <button @click="showChangePasswordForm = !showChangePasswordForm" >
                {{ showChangePasswordForm ? 'Hide' : 'Change Password' }}
            </button>
            <form v-if="showChangePasswordForm" @submit.prevent="changePassword">
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
            showImagePicker: false,
            availableImages: ['default.png', 'jocker.png', 'king.png', 'princess.png', 'soldier.png'],
            selectedImageName: 'default.png',
            showChangePasswordForm: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            error: 'Please fill in all fields. New password and confirm new password must be the same.'
        };
    },
    computed: {
        currentProfilePic() {
            return this.getAvatarUrl(this.selectedImageName);
        }
    },
    methods: {
        getAvatarUrl(name) {
            return new URL(`../assets/img/profile/${name}`, import.meta.url).href;
        },
        async selectImage(imgName) {
            this.selectedImageName = imgName;
            this.showImagePicker = false;
            try {
                    const res = await loginApi.put('/users/me/imageUrl', { imageUrl: imgName });
                    if (res.status === 200){
                        console.log('Profile picture updated successfully');
                        alert('Profile picture updated successfully');
                    }
                } catch (err) {
                    console.error('Error updating profile picture:', err);
                    alert('Failed to update profile picture. Please try again.');
                }
        },
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