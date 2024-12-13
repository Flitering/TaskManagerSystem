import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import AuthService from './services/AuthService';
import UserService from './services/UserService';

import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateSubtaskPage from './pages/CreateSubtaskPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SearchPage from './pages/SearchPage';
import UserDetailPage from './pages/UserDetailPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const { user, setUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.access_token) {
      const currentUserId = AuthService.getCurrentUserId(); 
      if (currentUserId) {
        UserService.getUser(currentUserId)
          .then(() => {
            setIsAuthChecked(true);
            if (location.pathname === '/') {
              navigate('/projects');
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              AuthService.logout();
              setUser(null);
            }
            setIsAuthChecked(true);
          });
      } else {
        // Если получить user_id из токена не удалось, разлогиниваем и остаёмся на логине
        AuthService.logout();
        setUser(null);
        setIsAuthChecked(true);
      }
    } else {
      setIsAuthChecked(true);
    }
  }, [location, navigate, user, setUser]);

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <ProtectedRoute>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:taskId/create-subtask"
          element={
            <ProtectedRoute>
              <CreateSubtaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <UserDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
