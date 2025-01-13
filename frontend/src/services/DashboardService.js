// src/services/DashboardService.js
import api from './api';

class DashboardService {
  getRecentProjects() {
    return api.get('/dashboard/recent-projects');
  }
  getRecentTasks() {
    return api.get('/dashboard/recent-tasks');
  }
  getViewed() {
    return api.get('/dashboard/viewed');
  }
  getAssignedToMe() {
    return api.get('/dashboard/assigned-to-me');
  }
  getFavorites() {
    return api.get('/dashboard/favorites');
  }
}

export default new DashboardService();
