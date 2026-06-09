
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const locale = localStorage.getItem('portal_language') || 'uz';
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = locale;
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
