<template>
    <div class="bg-container">
        <div class="main-container max-w-2xl">
            <h2 class="section-title">{{ username }}</h2>
            <div class="flex items-center justify-center">
                <component 
                        :is="getAvatarComponent(imageUrl)"
                        class="w-35 h-35 rounded-full border-2 border-primary object-cover"/>
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
                            pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+"
                            title="Must contain 1 capital letter, 1 number and 1 symbol"
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
                            pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+"
                            title="Must contain 1 capital letter, 1 number and 1 symbol"
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
                            pattern="(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+"
                            title="Must contain 1 capital letter, 1 number and 1 symbol"
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

            <div class="options-logout">
                <button @click="logout" class="secondary-button w-full py-4">LogOut</button>
            </div>

            <div class="options-delete">
                <button @click="deleteAccount" class="no-button w-full py-4">Delete Account</button>
            </div>

            <div class="text-center">
                <button @click="$router.push('/dashboard')" class="link-button">Back to Dashboard</button>
            </div>
        </div>
    </div>
</template>

<script>

import { loginApi } from '../services/api';
import router from '../router';
import { defineAsyncComponent} from 'vue';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/authStore';

const avatarModules = import.meta.glob('../assets/img/profile/*.svg', { query: '?component' });
const avatarCache = new Map();

export default {
    name: 'OptionsContainer',
    data() {
        return {
            username: 'Player',
            imageUrl: 'default.svg',
            showImagePicker: false,
            availableImages: ['default.svg', 'jocker.svg', 'king.svg', 'princess.svg', 'soldier.svg'],
            showChangePasswordForm: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            message: '',
            error: ''
        };
    },
    mounted() {
        this.loadUserData();
    },
    methods: {
        async loadUserData() {
            try {
                const response = await loginApi.get(`/users/me`);
                const userData = response.data; 

                if (userData) {
                    this.username = userData.name || 'Player';
                    if (userData.imageUrl) {
                        this.imageUrl = userData.imageUrl;
                    }
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        },
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
            this.imageUrl = imgName;
            this.showImagePicker = false;
            try {
                    const res = await loginApi.put('/users/me/imageUrl', { imageUrl: imgName });
                    if (res.status === 200){
                        console.log('Profile picture updated successfully');
                        const authStore = useAuthStore();
                        authStore.clearAuth();
                        Swal.fire({
                            title: "Good job!",
                            text: "Profile picture updated successfully!",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                            color: "var(--color-primary)",
                            iconColor: "var(--color-secondary)",
                            background: "var(--color-section-background)",
                            });
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
                        Swal.fire({
                            title: "Good job!",
                            text: "Password updated successfully!",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false,
                            color: "var(--color-primary)",
                            iconColor: "var(--color-secondary)",
                            background: "var(--color-section-background)",
                            });
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
        logout() {
            Swal.fire({
                title: "Do you want to Logout?",
                text: "You will need to login again to access your account.",
                icon: "warning",
                showCancelButton: true,
                color: "var(--color-primary)",
                iconColor: "var(--color-highlight)",
                background: "var(--color-section-background)",
                confirmButtonColor: "var(--color-primary)",
                cancelButtonColor: "var(--color-bad)",
                confirmButtonText: "Yes, log me out!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await loginApi.post('/auth/logout');
                            console.log('Logout clicked');
                            router.push('/login');
                        } catch (err){
                            console.error('Error in logout:', err);
                        }
                    }
            });
            
        },
        deleteAccount() {
            Swal.fire({
                title: "Do you want to delete your account?",
                text: "All your data will be lost forever.",
                icon: "warning",
                showCancelButton: true,
                color: "var(--color-primary)",
                iconColor: "var(--color-highlight)",
                background: "var(--color-section-background)",
                confirmButtonColor: "var(--color-primary)",
                cancelButtonColor: "var(--color-bad)",
                confirmButtonText: "Yes, delete it!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await loginApi.delete('/users/me/delete');
                            console.log('Account deleted. Return to login.');
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