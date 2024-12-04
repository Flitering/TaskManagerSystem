import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';

function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate(); // Инициализируем navigate
  const [task, setTask] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [details, setDetails] = useState('');

  const currentUserRole = AuthService.getUserRole();

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = () => {
    TaskService.getTask(taskId)
      .then((response) => {
        const data = response.data;
        data.comments = data.comments || [];
        data.attachments = data.attachments || [];
        data.subtasks = data.subtasks || [];
        setTask(data);
        setStatus(data.status);
        setEstimatedTime(data.estimated_time);
        setTimeSpent(data.time_spent);
        setDetails(data.details || '');
      })
      .catch((error) => {
        console.error('Ошибка при загрузке задачи:', error);
        alert('Не удалось загрузить задачу');
      });
  };

  const handleAddComment = () => {
    if (commentContent.trim() === '') return;
    TaskService.addComment(taskId, { content: commentContent })
      .then(() => {
        setCommentContent('');
        loadTask();
      })
      .catch((error) => {
        console.error('Ошибка при добавлении комментария:', error);
        alert('Не удалось добавить комментарий');
      });
  };

  const handleUploadAttachment = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    TaskService.uploadAttachment(taskId, formData)
      .then(() => {
        setFile(null);
        loadTask();
      })
      .catch((error) => {
        console.error('Ошибка при загрузке файла:', error);
        alert('Не удалось загрузить файл');
      });
  };

  const handleUpdateTask = () => {
    const taskData = {
      status,
      estimated_time: parseFloat(estimatedTime),
      time_spent: parseFloat(timeSpent),
      details,
    };
    TaskService.updateTask(taskId, taskData)
      .then(() => {
        loadTask();
        alert('Задача успешно обновлена');
      })
      .catch((error) => {
        console.error('Ошибка при обновлении задачи:', error);
        alert('Не удалось обновить задачу');
      });
  };

  const handleDeleteTask = async () => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить эту задачу? Все связанные подзадачи будут также удалены.');
    if (!confirmDelete) return;

    try {
      await TaskService.deleteTask(taskId);
      alert('Задача успешно удалена');
      navigate('/tasks'); // Перенаправление на страницу задач после удаления
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      alert('Не удалось удалить задачу');
    }
  };

  if (!task) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Детали задачи</h2>
      {task.parent_task_id && (
        <p>
          Родительская задача:{' '}
          <Link to={`/tasks/${task.parent_task_id}`}>Перейти к родительской задаче</Link>
        </p>
      )}
      <p>
        <strong>Описание:</strong> {task.description}
      </p>
      <p>
        <strong>Подробное описание:</strong>{' '}
        {(currentUserRole === 'admin' || currentUserRole === 'manager') ? (
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows="4"
            cols="50"
          />
        ) : (
          <p>{details}</p>
        )}
      </p>
      <p>
        <strong>Статус:</strong>{' '}
        {currentUserRole !== 'executor' ? (
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Новая">Новая</option>
            <option value="В процессе">В процессе</option>
            <option value="Завершена">Завершена</option>
          </select>
        ) : (
          task.status
        )}
      </p>
      <p>
        <strong>Оценочное время:</strong>{' '}
        {currentUserRole !== 'executor' ? (
          <input
            type="number"
            step="0.1"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        ) : (
          `${task.estimated_time} ч`
        )}{' '}
        часов
      </p>
      <p>
        <strong>Потраченное время:</strong>{' '}
        <input
          type="number"
          step="0.1"
          value={timeSpent}
          onChange={(e) => setTimeSpent(e.target.value)}
        />{' '}
        часов
      </p>
      <button onClick={handleUpdateTask}>Сохранить изменения</button>

      {/* Кнопка удаления задачи */}
      {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
        <button
          onClick={handleDeleteTask}
          style={{ marginLeft: '10px', color: 'red' }}
        >
          Удалить задачу
        </button>
      )}

      <h3>Комментарии</h3>
      <ul>
        {task.comments && task.comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.content}</p>
            <p>
              <em>Автор: {comment.user.username}</em>
            </p>
          </li>
        ))}
      </ul>
      <textarea
        placeholder="Добавить комментарий"
        value={commentContent}
        onChange={(e) => setCommentContent(e.target.value)}
        rows="3"
        cols="50"
      />
      <button onClick={handleAddComment}>Добавить комментарий</button>

      <h3>Вложения</h3>
      <ul>
        {task.attachments && task.attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={`http://localhost:8000/uploads/${attachment.filename}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {attachment.filename}
            </a>
          </li>
        ))}
      </ul>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUploadAttachment}>Загрузить файл</button>

      <h3>Подзадачи</h3>
      <ul>
        {task.subtasks && task.subtasks.map((subtask) => (
          <li key={subtask.id}>
            <p>{subtask.description}</p>
            <p>Статус: {subtask.status}</p>
            <Link to={`/tasks/${subtask.id}`}>Перейти к подзадаче</Link>
          </li>
        ))}
      </ul>
      {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
        <Link to={`/tasks/${task.id}/create-subtask`}>Создать подзадачу</Link>
      )}
    </div>
  );
}

export default TaskDetailPage;