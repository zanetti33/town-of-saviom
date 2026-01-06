import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';
import { LOGIN_API_URL } from './api';

// --- SHARED STATE ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Both Axios and Socket will call this when they hit a 401/Auth Error
export function refreshAccessToken() {
    if (isRefreshing) {
        // If already refreshing, return a promise that waits for the result
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    return new Promise(async (resolve, reject) => {
        try {
            // 1. Call the refresh endpoint
            // We use raw 'axios' here to avoid circular interceptor loops
            const response = await axios.post(`${LOGIN_API_URL}/auth/refresh`, {}, {
                withCredentials: true
            });
            
            const { accessToken } = response.data;
            const authStore = useAuthStore();
            
            // 2. Update Store
            authStore.setToken(accessToken);
            
            // 3. Optional: Refetch User if needed
            if (!authStore.user) {
                const userRes = await axios.get(`${LOGIN_API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                authStore.setUser(userRes.data);
            }

            // 4. Resolve everyone waiting
            processQueue(null, accessToken);
            resolve(accessToken);

        } catch (err) {
            // 5. Handle Failure (Logout)
            processQueue(err, null);
            const authStore = useAuthStore();
            authStore.clearAuth();
            router.push('/login');
            reject(err);
        } finally {
            isRefreshing = false;
        }
    });
}

export function setupAuthInterceptors(axiosInstance) {
    // Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            const authStore = useAuthStore();
            if (authStore.accessToken) {
                config.headers.Authorization = `Bearer ${authStore.accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (!error.response) return Promise.reject(error);

            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // CALL THE SHARED FUNCTION
                    const newToken = await refreshAccessToken();
                    
                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }
            return Promise.reject(error);
        }
    );
}