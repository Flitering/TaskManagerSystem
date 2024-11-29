import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8000'; // Замените на ваш URL бэкенда

class AuthService {
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    try {
      const response = await axios.post(`${API_URL}/auth/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserRole() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      const decodedToken = jwtDecode(user.access_token);
      return decodedToken.role;
    }
    return null;
  }

  getCurrentUserId() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      const decodedToken = jwtDecode(user.access_token);
      return parseInt(decodedToken.user_id); // Приводим к числу
    }
    return null;
  }
}

export default new AuthService();