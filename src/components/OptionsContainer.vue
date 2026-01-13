<template>
    <div class="bg-container">
        <div class="main-container">
            <h2 class="section-title">Options</h2>
            
            <div class="ok-message" v-if="message">
                <p>{{ message }}</p>
            </div>

            <button @click="showImagePicker = true" class="main-button">
                {{ showImagePicker ? 'Hide' : 'Change profile picture' }}
            </button>

            <div v-if="showImagePicker" @click.self="showImagePicker = false">
                <div class="modal-content">
                    <h3>Select your Avatar</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="img in availableImages" class="relative">
                            <component 
                                :is="getAvatarComponent(img)"
                                @click="selectImage(img)"
                                class="avatar-image hover:scale-110 cursor-pointer transition-transform duration-200"
                                :aria-label="'Avatar ' + img"
                            />
                        </div>
                    </div>
                    <button @click="showImagePicker = false" class="no-button">Cancel</button>
                </div>
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
                    <div class="error-message" v-if="newPassword !== confirmNewPassword || error">
                        <p>{{ error }}</p>
                    </div>
                </form>
            </div>

            <div class="options-delete">
                <button @click="deleteAccount" class="no-button">Delete Account</button>
            </div>

            <div class="mt-8 text-center">
                <button @click="$router.push('/dashboard')" class="link-button">Back to dashboard</button>
            </div>
        </div>
    </div>
</template>

<script>

import { loginApi } from '../services/api';
import router from '../router';
import { defineAsyncComponent} from 'vue';

const avatarModules = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarCache = new Map();

export default {
    name: 'OptionsContainer',
    data() {
        return {
            showImagePicker: false,
            availableImages: ['default.svg', 'jocker.svg', 'king.svg', 'princess.svg', 'soldier.svg'],
            selectedImageName: 'default.svg',
            showChangePasswordForm: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            message: '',
            error: 'New password and confirm new password must be the same.'
        };
    },
    methods: {
        getAvatarComponent(imgName) {
            const path = `../assets/img/profile/${imgName}`;
            
            if (avatarCache.has(path)) {
                return avatarCache.get(path);
            }
            if (!avatarModules[path]) {
                console.warn(`Avatar not found: ${path}`);
                return null;
            }

            const comp = defineAsyncComponent(avatarModules[path]);
            avatarCache.set(path, comp);
            return comp;
        },
        async selectImage(imgName) {
            this.selectedImageName = imgName;
            this.showImagePicker = false;
            try {
                    const res = await loginApi.put('/users/me/imageUrl', { imageUrl: imgName });
                    if (res.status === 200){
                        console.log('Profile picture updated successfully');
                        this.message = 'Profile picture updated successfully.';
                    }
                } catch (err) {
                    console.error('Error updating profile picture:', err);
                    alert('Failed to update profile picture. Please try again.');
                }
        },
        async changePassword() {
            if (this.newPassword === this.confirmNewPassword) {
                console.log('Change Password attempt:', { oldPassword: this.oldPassword, newPassword: this.newPassword });
                try {
                    const res = await loginApi.put('/users/me/password', 
                        { oldPassword: this.oldPassword, newPassword: this.newPassword });
                    if (res.status === 200){
                        console.log('Password updated successfully');
                        this.message = 'Password updated successfully.';
                        this.showChangePasswordForm = false;
                        this.error = '';
                    }
                } catch (err) {
                    this.error = 'Old password incorrect.';
                    console.error('Error changing password:', err)
                }
            } else {
                this.error = 'New password and confirm new password must be the same.';
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