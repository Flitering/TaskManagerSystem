// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthContext } from './context/AuthContext';
import AuthService from './services/AuthService';
import UserService from './services/UserService';

import Layout from './components/Layout';
// Импорт ваших страниц...
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import BoardPage from './pages/BoardPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateSubtaskPage from './pages/CreateSubtaskPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ReportsPage from './pages/ReportsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SearchPage from './pages/SearchPage';

function App() {
  const { user, setUser } = useContext(AuthContext);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.access_token) {
      const currentUserId = AuthService.getCurrentUserId();
      if (currentUserId) {
        UserService.getUser(currentUserId)
          .then(() => {
            setIsAuthChecked(true);
          })
          .catch(() => {
            AuthService.logout();
            setUser(null);
            setIsAuthChecked(true);
          });
      } else {
        AuthService.logout();
        setUser(null);
        setIsAuthChecked(true);
      }
    } else {
      setIsAuthChecked(true);
    }
  }, [setUser]);

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  // ================================
  // Если пользователь авторизован
  // ================================
  if (user) {
    return (
      <Layout>
        <Routes>
          {/* Домашняя страница (для авторизованного) */}
          <Route path="/" element={<HomePage />} />

          {/* ...остальные пути... */}
          <Route path="/board" element={<BoardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="/tasks/:taskId/create-subtask" element={<CreateSubtaskPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:userId" element={<UserDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Если путь не найден — на главную */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    );
  }

  // ================================
  // Если пользователь НЕ авторизован
  // ================================
  return (
    <Routes>
      {/* Вместо HomePage ставим сразу переход на /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Страницы логина/регистрации */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Остальные пути — тоже редирект на /login, либо на / */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
