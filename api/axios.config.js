import axios from 'axios';
import { API_BASE_URL } from '../src/config/env';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with every request
    timeout: 10000,
});

// Request interceptor — attach access token from localStorage if needed
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);


// Response interceptor — handle 401, auto-refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite retry loop

            try {
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                localStorage.setItem('accessToken', data.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                return api(originalRequest); // Retry original request
            } catch {
                localStorage.removeItem('accessToken');
                window.location.href = '/login'; // Force re-login
            }
        }

        return Promise.reject(error);
    }
);

export default api;
