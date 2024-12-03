import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserService from '../services/UserService';
import AuthService, { roleDisplayNames } from '../services/AuthService';

function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const currentUser = AuthService.getCurrentUser();
  const currentUserRole = AuthService.getUserRole();
  const isCurrentUser = currentUser && currentUser.user_id === parseInt(userId);
  const isAdmin = currentUserRole === 'admin';

  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Добавлено состояние для роли

  useEffect(() => {
    UserService.getUser(userId)
      .then((response) => {
        setUser(response.data);
        setFullName(response.data.full_name || '');
        setEmail(response.data.email || '');
        setRole(response.data.role.name || '');
      })
      .catch((error) => console.error(error));
  }, [userId]);

  const handleUpdateUser = () => {
    const userData = {
      full_name: fullName,
      email: email,
    };
    if (isAdmin) {
      userData.role = role;
    }
    UserService.updateUser(userId, userData)
      .then((response) => {
        setUser(response.data);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error('Ошибка при обновлении пользователя:', error);
      });
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h2>Профиль пользователя</h2>
      {isEditing ? (
        <>
          <p>Имя пользователя: {user.username}</p>
          <p>
            Полное имя:{' '}
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </p>
          <p>
            Email:{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
          {isAdmin && (
            <p>
              Роль:{' '}
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Администратор</option>
                <option value="manager">Менеджер</option>
                <option value="executor">Исполнитель</option>
              </select>
            </p>
          )}
          <button onClick={handleUpdateUser}>Сохранить</button>
          <button onClick={() => setIsEditing(false)}>Отмена</button>
        </>
      ) : (
        <>
          <p>Имя пользователя: {user.username}</p>
          <p>Полное имя: {user.full_name}</p>
          <p>Email: {user.email}</p>
          <p>Роль: {roleDisplayNames[user.role.name]}</p>
          {(isCurrentUser || isAdmin) && (
            <button onClick={() => setIsEditing(true)}>Редактировать</button>
          )}
        </>
      )}

      <h3>Назначенные задачи</h3>
      <ul>
        {user.tasks_assigned && user.tasks_assigned.map((task) => (
          <li key={task.id}>{task.description}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserDetailPage;