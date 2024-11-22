import api from './api';

class TaskService {
  getTasks() {
    return api.get('/tasks');
  }

  createTask(taskData) {
    return api.post('/tasks', taskData);
  }

  updateTask(taskId, taskData) {
    return api.put(`/tasks/${taskId}`, taskData);
  }

  deleteTask(taskId) {
    return api.delete(`/tasks/${taskId}`);
  }
}

export default new TaskService();