import api from './api';

class ProjectService {
  getProjects() {
    return api.get('/projects');
  }

  createProject(projectData) {
    return api.post('/projects', projectData);
  }

  searchProjects(query) {
    return api.get(`/projects/search/?query=${encodeURIComponent(query)}`);
  }
  
  deleteProject(projectId) {
    return api.delete(`/projects/${projectId}`);
  }
}

export default new ProjectService();