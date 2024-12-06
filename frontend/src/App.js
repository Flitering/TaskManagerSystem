import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
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

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
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