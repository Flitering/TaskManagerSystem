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
}

export default new ProjectService();