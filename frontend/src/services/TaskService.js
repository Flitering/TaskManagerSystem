import api from './api';

class TaskService {
  getTasks() {
    return api.get('/tasks/'); // Добавляем слэш в конце
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

  deleteTask(taskId) {
    return api.delete(`/tasks/${taskId}`);
  }

  deleteAttachment(taskId, attachmentId) {
    return api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }
}

export default new TaskService();
