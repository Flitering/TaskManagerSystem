import React, { useEffect, useState } from 'react';
import UserService from '../services/UserService';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Исполнитель');

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
    loadUsers();
  }, []);

  const handleCreateUser = () => {
    const userData = {
      username,
      password,
      role,
    };
    UserService.createUser(userData)
      .then(() => {
        loadUsers();
        setUsername('');
        setPassword('');
        setRole('Исполнитель');
      })
      .catch((error) => {
        console.error('Ошибка при создании пользователя:', error);
      });
  };

  return (
    <div>
      <h2>Пользователи</h2>
      <div>
        <h3>Создать нового пользователя</h3>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Администратор">Администратор</option>
          <option value="Менеджер">Менеджер</option>
          <option value="Исполнитель">Исполнитель</option>
        </select>
        <button onClick={handleCreateUser}>Создать</button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            ID: {user.id} - {user.username} - {user.role.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersPage;