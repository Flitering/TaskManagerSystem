import React, { useState, useContext } from 'react';
import AuthService from '../services/AuthService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await AuthService.login(username, password);
      setUser(userData);
      navigate('/tasks');
    } catch (error) {
      console.error('Ошибка входа:', error);
      // Обработка ошибки, например, отображение уведомления
    }
  };

  return (
    <div>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default LoginPage;