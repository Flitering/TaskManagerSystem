import api from './api';

class ReportService {
  getTaskStatistics(projectId) {
    const params = {};
    if (projectId) {
      params.project_id = projectId;
    }
    return api.get('/reports/task-stats', { params });
  }
}

export default new ReportService();
