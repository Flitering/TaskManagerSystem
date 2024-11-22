import api from './api';

class ProjectService {
  getProjects() {
    return api.get('/projects');
  }

  createProject(projectData) {
    return api.post('/projects', projectData);
  }
}

export default new ProjectService();