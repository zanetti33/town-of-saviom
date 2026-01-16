<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <h2 class="section-title">Options</h2>
            
            <div class="ok-message" v-if="message">
                <p>{{ message }}</p>
            </div>
            <button 
                v-if="!showImagePicker" 
                @click="showImagePicker = true, showChangePasswordForm=false" 
                class="submit-button w-full py-4"
            >
                Change profile picture
            </button>
            <div v-if="showImagePicker" class="image-picker-container">
                <div class="modal-content relative border border-background-5/50 rounded-2xl shadow-2xl p-4">
                    <h3 class="mb-4 text-center">Select your Avatar</h3>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div v-for="img in availableImages" :key="img" class="relative justify-center items-center flex">
                            <component 
                                :is="getAvatarComponent(img)"
                                @click="selectImage(img)"
                                class="avatar-image w-24 h-24 hover:scale-110 cursor-pointer transition-transform duration-200"
                                :aria-label="'Avatar ' + img"
                            />
                        </div>
                    </div>

                    <button 
                        @click="showImagePicker = false" 
                        class="no-button w-30! mt-6 block mx-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <div class="options-password">
                <button 
                    v-if="!showChangePasswordForm" 
                    @click="showChangePasswordForm = true, showImagePicker=false" 
                    class="submit-button w-full py-4"
                >
                    Change Password
                </button>

                <form v-if="showChangePasswordForm" @submit.prevent="changePassword" class="border border-background-5/50 rounded-2xl shadow-2xl p-4 mt-4">
                    <div class="form-group mb-4">
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
                    <div class="form-group mb-4">
                        <label for="newPassword" class="sr-only">New password: (max 16 characters)</label>
                        <input
                            id="newPassword"
                            v-model="newPassword"
                            type="password"
                            required
                            maxlength="16"
                            placeholder="Enter your new password (max 16 characters)"
                            class="form-field"
                        />
                    </div>
                    <div class="form-group mb-4">
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

                    <div v-if="error" class="error-message mb-4">
                    {{ error }}
                    </div>

                    <div class="flex flex-col gap-2">
                        <button type="submit" class="submit-button w-full py-4">
                            Update Password
                        </button> 
                        
                        <button 
                            type="button" 
                            @click="showChangePasswordForm = false" 
                            class="no-button w-30! mt-6 block mx-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            <div class="options-delete">
                <button @click="deleteAccount" class="no-button w-full py-4">Delete Account</button>
            </div>

            <div class="text-center">
                <button @click="$router.push('/dashboard')" class="link-button">Close Options</button>
            </div>
        </div>
    </div>
</template>

<script>

import { loginApi } from '../services/api';
import router from '../router';
import { defineAsyncComponent} from 'vue';
import Swal from 'sweetalert2';

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
            error: ''
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
            this.error = '';
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
        deleteAccount() {
            Swal.fire({
                title: "Do you want to delete your account?",
                text: "All your data will be lost forever.",
                icon: "warning",
                showCancelButton: true,
                //background: "#000000",
                //confirmButtonColor: "#3085d6",
                //cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await loginApi.delete('/users/me/delete');
                            console.log('Account deleted. Return to login.');
                            Swal.fire({
                            title: "Deleted!",
                            text: "Your account has been deleted.",
                            icon: "success"
                            });
                            router.push('/login');
                        } catch (err){
                            console.error('Error in deleting account:', err);
                        }
                    }
            });
        }
    }
};

</script>

<style scoped>
</style>