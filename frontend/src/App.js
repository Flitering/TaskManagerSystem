import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <Routes>
        {/* Публичный маршрут для страницы входа */}
        <Route path="/" element={<LoginPage />} />

        {/* Защищенные маршруты */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
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
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        {/* Добавьте другие маршруты по необходимости */}
      </Routes>
    </div>
  );
}

export default App;