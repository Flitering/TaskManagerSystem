import api from './api';

const ProjectService = {
  getProjects() {
    return api.get('/projects');
  },

  createProject(projectData) {
    return api.post('/projects', projectData);
  },

  getProjectDetail(projectId) {
    return api.get(`/projects/${projectId}/detail`);
  },

  addParticipant(projectId, userId) {
    return api.post(`/projects/${projectId}/participants`, { user_id: userId });
  },

  updateProject(projectId, projectData) {
    return api.put(`/projects/${projectId}`, projectData);
  },

  assignLeader(projectId, userId) {
    return api.post(`/projects/${projectId}/leader`, { user_id: userId });
  }
};

export default ProjectService;