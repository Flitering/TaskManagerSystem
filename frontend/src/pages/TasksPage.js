import React, { useEffect, useState, useContext } from 'react';
import TaskService from '../services/TaskService';
import { AuthContext } from '../context/AuthContext';

function TasksPage() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

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

  const handleCreateTask = () => {
    const taskData = {
      description,
      assigned_user_id: parseInt(assignedUserId),
    };
    TaskService.createTask(taskData)
      .then(() => {
        loadTasks();
        setDescription('');
        setAssignedUserId('');
      })
      .catch((error) => {
        console.error('Ошибка при создании задачи:', error);
      });
  };

  return (
    <div>
      <h2>Задачи</h2>
      {user && user.role === 'Администратор' && (
        <div>
          <h3>Создать новую задачу</h3>
          <input
            type="text"
            placeholder="Описание задачи"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="ID назначенного пользователя"
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          />
          <button onClick={handleCreateTask}>Создать</button>
        </div>
      )}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.description} - Статус: {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksPage;