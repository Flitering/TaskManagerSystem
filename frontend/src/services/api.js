import axios from 'axios';
import AuthService from './AuthService';

const API_URL = 'http://localhost:8000'; // Замените на ваш URL бэкенда

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;