import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/auth';

class AuthService {
  async login(username, password) {
    const response = await axios.post(`${API_URL}/token`, {
      username,
      password,
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
}

export default new AuthService();