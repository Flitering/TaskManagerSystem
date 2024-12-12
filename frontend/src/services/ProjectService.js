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

  searchProjects(query) {
    return api.get(`/projects/search/?query=${encodeURIComponent(query)}`);
  },

  assignLeader(projectId, userId) {
    return api.post(`/projects/${projectId}/leader`, { user_id: userId });
  },
  
  removeParticipant(projectId, userId) {
    return api.delete(`/projects/${projectId}/participants/${userId}`);
  }
};

export default ProjectService;