import api from './api';

class TaskService {
  getTasks() {
    return api.get('/tasks');
  }

  getTask(taskId) {
    return api.get(`/tasks/${taskId}`);
  }

  createTask(taskData) {
    return api.post('/tasks', taskData);
  }

  updateTask(taskId, taskData) {
    return api.put(`/tasks/${taskId}`, taskData);
  }

  addComment(taskId, commentData) {
    return api.post(`/tasks/${taskId}/comments`, commentData);
  }

  uploadAttachment(taskId, formData) {
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  createSubtask(taskId, subtaskData) {
    return api.post(`/tasks/${taskId}/subtasks`, subtaskData);
  }

  searchTasks(query) {
    return api.get(`/tasks/search/?query=${encodeURIComponent(query)}`);
  }
}

export default new TaskService();