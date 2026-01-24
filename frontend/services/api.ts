import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5167/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para tratamento de erros global (opcional mas recomendado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Aqui você pode logar erros ou tratar 401/403
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
