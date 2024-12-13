import axios from 'axios';
import jwt_decode from 'jwt-decode'; // используем версию 3.x

const API_URL = 'http://localhost:8000';

class AuthService {
  async login(username, password) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const response = await axios.post(`${API_URL}/auth/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response.data.access_token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getUserRole() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      const decodedToken = jwt_decode(user.access_token);
      return decodedToken.role;
    }
    return null;
  }

  getCurrentUserId() {
    const user = this.getCurrentUser();
    if (user && user.access_token) {
      const decodedToken = jwt_decode(user.access_token);
      if (typeof decodedToken.user_id === 'number') {
        return decodedToken.user_id;
      } else {
        return parseInt(decodedToken.user_id, 10) || null;
      }
    }
    return null;
  }
}

export const roleDisplayNames = {
  admin: 'Администратор',
  manager: 'Менеджер',
  executor: 'Исполнитель',
};

export default new AuthService();
