import React, { useEffect, useState } from 'react';
import UserService from '../services/UserService';

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  }, []);

  return (
    <div>
      <h2>Пользователи</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username} - {user.role}</li>
        ))}
      </ul>
      {/* Добавьте форму для создания пользователя и редактирования ролей */}
    </div>
  );
}

export default UsersPage;