import React, { useEffect, useState, useContext } from 'react';
import TaskService from '../services/TaskService';
import { AuthContext } from '../context/AuthContext';

function TasksPage() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  const loadTasks = () => {
    TaskService.getTasks()
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке задач:', error);
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Функции для создания, обновления, удаления задач
  const handleCreateTask = (taskData) => {
    TaskService.createTask(taskData)
      .then(() => {
        loadTasks();
      })
      .catch((error) => {
        console.error('Ошибка при создании задачи:', error);
      });
  };

  return (
    <div>
      <h2>Задачи</h2>
      {user.role === 'Администратор' && (
        <button>Создать новую задачу</button>
      )}
      {/* Отображение задач */}
    </div>
  );
}

export default TasksPage;