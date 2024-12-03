import React, { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import { Link } from 'react-router-dom';
import { roleDisplayNames } from '../services/AuthService';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('executor');

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
      full_name: fullName,
      email,
      password,
      role,
    };
    console.log('Данные пользователя:', userData);
    UserService.createUser(userData)
      .then(() => {
        loadUsers();
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('executor'); // Значение по умолчанию
      })
      .catch((error) => {
        console.error('Ошибка при создании пользователя:', error.response.data);
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
          type="text"
          placeholder="Полное имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Администратор</option>
          <option value="manager">Менеджер</option>
          <option value="executor">Исполнитель</option>
        </select>
        <button onClick={handleCreateUser}>Создать</button>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            ID: {user.id} - {user.username} - {roleDisplayNames[user.role.name]}
            <Link to={`/users/${user.id}`}> Подробнее</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsersPage;