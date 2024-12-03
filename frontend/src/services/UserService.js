import api from './api';

class UserService {
  getUsers() {
    return api.get('/users');
  }

  getUser(userId) {
    return api.get(`/users/${userId}`);
  }

  createUser(userData) {
    return api.post('/users', userData);
  }

  updateUser(userId, userData) {
    return api.put(`/users/${userId}`, userData);
  }

  deleteUser(userId) {
    return api.delete(`/users/${userId}`);
  }
}

export default new UserService();