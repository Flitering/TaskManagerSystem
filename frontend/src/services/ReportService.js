import api from './api';

class ReportService {
  getTaskStatistics() {
    return api.get('/reports/task-stats');
  }
}

export default new ReportService();