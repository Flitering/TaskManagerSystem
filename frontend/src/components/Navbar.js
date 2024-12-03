import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthService, { roleDisplayNames } from '../services/AuthService';

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <nav>
      <ul>
        {user ? (
          <>
            <li>
              <Link to="/tasks">Задачи</Link>
            </li>
            {AuthService.getUserRole() === 'admin' && (
              <li>
                <Link to="/users">Пользователи</Link>
              </li>
            )}
            {(AuthService.getUserRole() === 'admin' ||
              AuthService.getUserRole() === 'manager') && (
              <>
                <li>
                  <Link to="/projects">Проекты</Link>
                </li>
                <li>
                  <Link to="/reports">Отчёты</Link>
                </li>
                <li>
                  <Link to="/search">Поиск</Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout}>Выйти</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/">Вход</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;