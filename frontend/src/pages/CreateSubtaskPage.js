import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskService from '../services/TaskService';
import UserService from '../services/UserService';

function CreateSubtaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [users, setUsers] = useState([]);
  const [parentTask, setParentTask] = useState(null);

  useEffect(() => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });

    TaskService.getTask(taskId)
      .then((response) => {
        setParentTask(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке родительской задачи:', error);
      });
  }, [taskId]);

  const handleCreateSubtask = () => {
    const subtaskData = {
      description,
      details,
      assigned_user_id: parseInt(assignedUserId),
      project_id: parentTask.project_id,
      estimated_time: parseFloat(estimatedTime),
    };
    TaskService.createSubtask(taskId, subtaskData)
      .then(() => {
        navigate(`/tasks/${taskId}`);
      })
      .catch((error) => {
        console.error('Ошибка при создании подзадачи:', error.response.data);
      });
  };

  if (!parentTask) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Создать подзадачу для: {parentTask.description}</h2>
      <input
        type="text"
        placeholder="Описание подзадачи"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <textarea
        placeholder="Подробное описание подзадачи"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <select
        value={assignedUserId}
        onChange={(e) => setAssignedUserId(e.target.value)}
      >
        <option value="">Назначить пользователя</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username} (ID: {user.id})
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
      <button onClick={handleCreateSubtask}>Создать подзадачу</button>
    </div>
  );
}

export default CreateSubtaskPage;