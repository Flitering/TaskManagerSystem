import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState(''); // Новое состояние для подробного описания
  const [assignedUserId, setAssignedUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const loadTasks = () => {
    TaskService.getTasks()
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке задач:', error);
      });
  };

  const loadProjects = () => {
    ProjectService.getProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке проектов:', error);
      });
  };

  const loadUsers = () => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, []);

  const handleCreateTask = () => {
    const taskData = {
      description,
      details,
      assigned_user_id: parseInt(assignedUserId),
      project_id: parseInt(projectId),
      estimated_time: parseFloat(estimatedTime),
    };
    TaskService.createTask(taskData)
      .then(() => {
        loadTasks();
        setDescription('');
        setDetails('');
        setAssignedUserId('');
        setProjectId('');
        setEstimatedTime('');
      })
      .catch((error) => {
        console.error('Ошибка при создании задачи:', error);
      });
  };

  return (
    <div>
      <h2>Задачи</h2>
      {AuthService.getUserRole() !== 'executor' && (
        <div>
          <h3>Создать новую задачу</h3>
          <input
            type="text"
            placeholder="Описание задачи"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <textarea
            placeholder="Подробное описание задачи"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
          >
            <option value="">Выберите пользователя</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} (ID: {user.id})
              </option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">Выберите проект</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} (ID: {project.id})
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            placeholder="Оценочное время (часов)"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
          <button onClick={handleCreateTask}>Создать</button>
        </div>
      )}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <p>
              <strong>{task.description}</strong> (ID: {task.id})
            </p>
            <p>Проект: {task.project ? task.project.name : 'Не указан'}</p>
            <p>Статус: {task.status}</p>
            <p>
              Назначена:{' '}
              {task.assigned_user ? task.assigned_user.username : 'Не назначена'}
            </p>
            <p>Поставил: {task.creator ? task.creator.username : 'Неизвестно'}</p>
            <p>Оценочное время: {task.estimated_time} ч</p>
            <p>Потрачено времени: {task.time_spent} ч</p>
            <p>
              Осталось времени: {task.estimated_time - task.time_spent} ч
            </p>
            <Link to={`/tasks/${task.id}`}>Детали задачи</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksPage;