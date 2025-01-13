import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, IconButton, Snackbar, Alert,
  Avatar, Box
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import TaskService from '../services/TaskService';
import AuthService from '../services/AuthService';
import CreateTaskModal from '../components/CreateTaskModal';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const currentUserRole = AuthService.getUserRole();

  // Загрузка задач
  const loadTasks = () => {
    TaskService.getTasks()
      .then((res) => setTasks(res.data))
      .catch((err) => {
        console.error('Ошибка при загрузке задач:', err);
        showSnackbar('Не удалось загрузить задачи', 'error');
      });
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const showSnackbar = (message, severity='success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Удалить задачу?')) return;
    try {
      await TaskService.deleteTask(taskId);
      showSnackbar('Задача удалена', 'success');
      loadTasks();
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      showSnackbar('Не удалось удалить задачу', 'error');
    }
  };

  const formatDateTime = (dtString) => {
    if (!dtString) return '-';
    return new Date(dtString).toLocaleString();
  };

  // Открытие/закрытие модалки
  const handleOpenModal = () => setOpenCreateModal(true);
  const handleCloseModal = () => setOpenCreateModal(false);

  // Когда задача создана
  const handleTaskCreated = () => {
    showSnackbar('Задача успешно создана!', 'success');
    handleCloseModal();
    loadTasks();
  };

  // =====================================
  // ГРУППИРУЕМ ЗАДАЧИ ПО ПРОЕКТУ
  // =====================================
  const groupedTasks = tasks.reduce((acc, task) => {
    const projectName = task.project?.name || 'Без проекта';
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {});

  // Сортируем названия проектов по алфавиту (или как угодно)
  const sortedProjectNames = Object.keys(groupedTasks).sort();

  // =====================================
  // Рендер
  // =====================================
  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Все задачи
      </Typography>

      {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={handleOpenModal}
        >
          Создать задачу
        </Button>
      )}

      {/* Перебираем каждую группу (проект) */}
      {sortedProjectNames.map((projectName) => {
        const tasksOfProject = groupedTasks[projectName];

        return (
          <Box key={projectName} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb:1, fontWeight:'bold' }}>
              {projectName}
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Приоритет</TableCell>
                    <TableCell>Создатель</TableCell>
                    <TableCell>Исполнитель</TableCell>
                    <TableCell>Обновлено</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasksOfProject.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.issue_type}</TableCell>
                      <TableCell>
                        <Link
                          to={`/tasks/${t.id}`}
                          style={{ textDecoration:'none', color:'#1976d2' }}
                        >
                          {t.description}
                        </Link>
                      </TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{t.priority}</TableCell>

                      {/* Создатель (аватар + имя) */}
                      <TableCell>
                        {t.creator ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width:24, height:24 }}>
                              {t.creator.username?.[0].toUpperCase()}
                            </Avatar>
                            <span>{t.creator.username}</span>
                          </Box>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Исполнитель (аватар + имя) */}
                      <TableCell>
                        {t.assigned_user ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width:24, height:24 }}>
                              {t.assigned_user.username?.[0].toUpperCase()}
                            </Avatar>
                            <span>{t.assigned_user.username}</span>
                          </Box>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Обновлено: updated_at + last_updated_by ? */}
                      <TableCell>
                        {t.updated_at
                          ? formatDateTime(t.updated_at)
                          : formatDateTime(t.created_at)
                        }
                        {t.last_updated_by && (
                          <>
                            <br />
                            <small style={{ color:'#666' }}>
                              Изменил: {t.last_updated_by.username}
                            </small>
                          </>
                        )}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`/tasks/${t.id}`}
                          sx={{ mr:1 }}
                        >
                          Детали
                        </Button>
                        {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(t.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {tasksOfProject.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Нет задач
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      {/* Если вообще нет задач, можно вывести заглушку */}
      {tasks.length === 0 && (
        <Typography sx={{ mt:4 }}>Нет задач</Typography>
      )}

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} sx={{ width:'100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

      {/* Модалка создания задачи */}
      {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
        <CreateTaskModal
          open={openCreateModal}
          onClose={handleCloseModal}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </Container>
  );
}

export default TasksPage;
