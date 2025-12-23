import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';
import { LOGIN_API_URL } from './api';

// These are shared by ALL api instances
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export function setupAuthInterceptors(axiosInstance) {

    // Request Interceptor (Attaches Token)
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

    // Response Interceptor (Handles 401 and Token Refresh)
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            // Check if response is unathorized
            if (!error.response) return Promise.reject(error);
            if (error.response.status === 401 && !originalRequest._retry) {
                // If already refreshing, queue the request
                if (isRefreshing) {
                    return new Promise(function(resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return axiosInstance(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }
                // Otherwise, start refreshing
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    // We call auth/refresh endpoint to get a new token
                    const response = await axios.post(LOGIN_API_URL + '/auth/refresh', {}, {
                        withCredentials: true
                    });
                    const { accessToken } = response.data;

                    // Update Store
                    const authStore = useAuthStore();
                    authStore.setToken(accessToken);
                    
                    // Optionally, fetch user info if not already present
                    if (authStore.user == null) {
                        const userInfoResponse = await axios.post(LOGIN_API_URL + '/users/me', {}, {
                            withCredentials: true
                        });
                        authStore.setUser(userInfoResponse.data);
                    }
                    // Process the queue
                    processQueue(null, accessToken);

                    // Retry original request
                    originalRequest.headers.Authorization = 'Bearer ' + accessToken;
                    return axiosInstance(originalRequest);

                } catch (refreshError) {
                    processQueue(refreshError, null);
                    
                    const authStore = useAuthStore();
                    authStore.clearAuth(); // Clear store
                    router.push('/login');
                    
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
}