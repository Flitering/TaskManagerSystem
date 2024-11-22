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
}

export default new TaskService();