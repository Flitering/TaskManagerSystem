import api from './api';

class ReportService {
  getTaskStatistics() {
    return api.get('/reports/task-stats');
  }

  // Добавьте другие методы по необходимости
}

export default new ReportService();