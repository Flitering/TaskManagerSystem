import axios from 'axios';
import AuthService from './AuthService';

const api = axios.create();

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