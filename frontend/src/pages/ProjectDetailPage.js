// src/pages/ProjectDetailPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProjectService from '../services/ProjectService';
import TaskService from '../services/TaskService';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';

import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const currentUserRole = AuthService.getUserRole();

  // ==============================
  // Состояния
  // ==============================
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Фильтры задач
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskAssigneeFilter, setTaskAssigneeFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskDueDateFilter, setTaskDueDateFilter] = useState('');

  // Добавление участника
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // ==============================
  // Эффекты
  // ==============================
  useEffect(() => {
    loadProjectDetail();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ==============================
  // Функции для загрузки
  // ==============================
  const loadProjectDetail = () => {
    setLoading(true);
    ProjectService.getProjectDetail(projectId)
      .then((response) => {
        setProject(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке проекта:', error);
        showSnackbar('Не удалось загрузить проект', 'error');
        setLoading(false);
      });
  };

  const loadUsers = () => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  };

  // ==============================
  // Уведомления
  // ==============================
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // ==============================
  // Редактирование проекта
  // ==============================
  const handleEditProject = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || '');
    setIsEditingProject(true);
  };

  const handleSaveProject = () => {
    const projectData = {
      name: editName,
      description: editDescription,
    };
    ProjectService.updateProject(projectId, projectData)
      .then((response) => {
        setProject(response.data);
        setIsEditingProject(false);
        showSnackbar('Проект успешно обновлён', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при обновлении проекта:', error);
        showSnackbar('Не удалось обновить проект', 'error');
      });
  };

  // ==============================
  // useMemo для фильтрации задач
  // ==============================
  const filteredTasks = useMemo(() => {
    if (!project || !project.tasks) return [];
    return project.tasks.filter((task) => {
      if (taskStatusFilter && task.status !== taskStatusFilter) return false;
      if (
        taskAssigneeFilter &&
        task.assigned_user &&
        task.assigned_user.id.toString() !== taskAssigneeFilter
      ) {
        return false;
      }
      if (taskPriorityFilter && task.priority !== taskPriorityFilter) return false;
      if (
        taskSearchQuery &&
        !task.description.toLowerCase().includes(taskSearchQuery.toLowerCase())
      ) {
        return false;
      }
      if (taskDueDateFilter) {
        const filterDate = new Date(taskDueDateFilter);
        const taskDue = task.due_date ? new Date(task.due_date) : null;
        if (taskDue && taskDue < filterDate) return false;
      }
      return true;
    });
  }, [
    project,
    taskStatusFilter,
    taskAssigneeFilter,
    taskPriorityFilter,
    taskSearchQuery,
    taskDueDateFilter,
  ]);

  // ==============================
  // useMemo для подсчёта времени
  // ==============================
  const timeByUser = useMemo(() => {
    if (!project || !project.tasks) return [];
    const map = new Map();
    for (const task of project.tasks) {
      if (task.assigned_user) {
        const uid = task.assigned_user.id;
        const current = map.get(uid) || { user: task.assigned_user, total: 0 };
        current.total += task.time_spent || 0;
        map.set(uid, current);
      }
    }
    return Array.from(map.values());
  }, [project]);

  // ==============================
  // Ранние проверки
  // ==============================
  if (loading) {
    return (
      <Container>
        <Typography>Загрузка...</Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <Typography>Проект не найден</Typography>
      </Container>
    );
  }

  // ==============================
  // Переменные для вычислений
  // ==============================
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'manager';

  // Подсчёт задач
  const totalTasks = project.tasks.length;
  const newTasksCount = project.tasks.filter((t) => t.status === 'Новая').length;
  const inProgressCount = project.tasks.filter((t) => t.status === 'В процессе').length;
  const completedCount = project.tasks.filter((t) => t.status === 'Завершена').length;

  const pieData = [
    { name: 'Новые', value: newTasksCount, color: '#8884d8' },
    { name: 'В процессе', value: inProgressCount, color: '#82ca9d' },
    { name: 'Завершены', value: completedCount, color: '#ffc658' },
  ].filter((item) => item.value > 0);

  const completionRate =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // ==============================
  // Функции для участников
  // ==============================
  const handleAddParticipantOpen = () => {
    setIsAddParticipantOpen(true);
  };

  const handleAddParticipantClose = () => {
    setSelectedUserId('');
    setIsAddParticipantOpen(false);
  };

  const handleAddParticipant = () => {
    if (!selectedUserId) {
      showSnackbar('Выберите пользователя', 'warning');
      return;
    }
    ProjectService.addParticipant(projectId, parseInt(selectedUserId, 10))
      .then(() => {
        showSnackbar('Участник успешно добавлен', 'success');
        handleAddParticipantClose();
        loadProjectDetail();
      })
      .catch((error) => {
        console.error('Ошибка при добавлении участника:', error);
        showSnackbar('Не удалось добавить участника', 'error');
      });
  };

  const handleRemoveParticipant = (userId, e) => {
    e.stopPropagation();
    if (
      window.confirm('Вы уверены, что хотите удалить этого участника из проекта?')
    ) {
      ProjectService.removeParticipant(projectId, userId)
        .then(() => {
          showSnackbar('Участник удален из проекта', 'success');
          loadProjectDetail();
        })
        .catch((error) => {
          console.error('Ошибка при удалении участника:', error);
          showSnackbar('Не удалось удалить участника', 'error');
        });
    }
  };

  // ==============================
  // Функции для задач
  // ==============================
  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      TaskService.deleteTask(taskId)
        .then(() => {
          showSnackbar('Задача успешно удалена', 'success');
          loadProjectDetail();
        })
        .catch((error) => {
          console.error('Ошибка при удалении задачи:', error);
          showSnackbar('Не удалось удалить задачу', 'error');
        });
    }
  };

  // Вместо диалога — сразу переходим на TasksPage
  const handleCreateTaskOpen = () => {
    navigate('/tasks');
  };

  // ==============================
  // Рендер
  // ==============================
  return (
    <Container>
      {/* Карточка проекта */}
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {isEditingProject ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Название проекта"
                variant="outlined"
                fullWidth
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Описание проекта"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveProject}
                sx={{ mr: 2 }}
              >
                Сохранить
              </Button>
              <Button variant="outlined" onClick={() => setIsEditingProject(false)}>
                Отмена
              </Button>
            </Grid>
          </Grid>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              {project.name}
            </Typography>
            <Typography gutterBottom>
              {project.description || 'Нет описания.'}
            </Typography>
            {project.created_at && (
              <Typography gutterBottom>
                Дата создания: {new Date(project.created_at).toLocaleString()}
              </Typography>
            )}
            {project.leader && (
              <Typography gutterBottom>
                Руководитель проекта:{' '}
                {project.leader.full_name || project.leader.username}
              </Typography>
            )}

            {canEdit && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditProject}
                  sx={{ mr: 2 }}
                >
                  Редактировать проект
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateTaskOpen}
                >
                  Создать задачу
                </Button>
              </>
            )}
          </>
        )}
      </Paper>

      {/* Пример кнопки для перехода к отчётам */}
      <Box sx={{ marginBottom: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/reports')}
        >
          Отчёты / Аналитика
        </Button>
      </Box>

      {/* Статистика по задачам */}
      <Typography variant="h5" gutterBottom>
        Статистика по задачам
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography>Всего задач: {totalTasks}</Typography>
            <Typography>Новые: {newTasksCount}</Typography>
            <Typography>В процессе: {inProgressCount}</Typography>
            <Typography>Завершено: {completedCount}</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Прогресс выполнения: {completionRate}%</Typography>
              <LinearProgress variant="determinate" value={completionRate} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} style={{ height: 300 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography>Нет данных для диаграммы.</Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Задачи проекта (фильтрация + таблица) */}
      <Typography variant="h5" gutterBottom>
        Задачи проекта
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          marginBottom={2}
          flexWrap="wrap"
        >
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="task-status-label">Статус</InputLabel>
            <Select
              labelId="task-status-label"
              value={taskStatusFilter}
              label="Статус"
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="Новая">Новая</MenuItem>
              <MenuItem value="В процессе">В процессе</MenuItem>
              <MenuItem value="Завершена">Завершена</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="task-assignee-label">Исполнитель</InputLabel>
            <Select
              labelId="task-assignee-label"
              value={taskAssigneeFilter}
              label="Исполнитель"
              onChange={(e) => setTaskAssigneeFilter(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="task-priority-label">Приоритет</InputLabel>
            <Select
              labelId="task-priority-label"
              value={taskPriorityFilter}
              label="Приоритет"
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="Низкий">Низкий</MenuItem>
              <MenuItem value="Средний">Средний</MenuItem>
              <MenuItem value="Высокий">Высокий</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Поиск по описанию"
            variant="outlined"
            size="small"
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
          />

          <TextField
            label="Срок (позже этой даты)"
            type="date"
            variant="outlined"
            size="small"
            value={taskDueDateFilter}
            onChange={(e) => setTaskDueDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {filteredTasks.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Назначено</TableCell>
                  <TableCell>Потрачено (ч)</TableCell>
                  <TableCell>Оценка (ч)</TableCell>
                  {canEdit && <TableCell>Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((t) => (
                  <TableRow
                    key={t.id}
                    hover
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${t.id}`)}
                  >
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>{t.status}</TableCell>
                    <TableCell>
                      {t.assigned_user ? t.assigned_user.username : '-'}
                    </TableCell>
                    <TableCell>{t.time_spent}</TableCell>
                    <TableCell>{t.estimated_time}</TableCell>
                    {canEdit && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          color="error"
                          onClick={(e) => handleDeleteTask(t.id, e)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>Задачи не найдены.</Typography>
        )}
      </Paper>

      {/* Участники */}
      <Typography variant="h5" gutterBottom>
        Участники проекта
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {project.participants && project.participants.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Имя пользователя</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Роль</TableCell>
                  {canEdit && <TableCell>Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {project.participants.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    onClick={() => navigate(`/users/${u.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email || '-'}</TableCell>
                    <TableCell>{u.role.name}</TableCell>
                    {canEdit && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          color="error"
                          onClick={(ev) => handleRemoveParticipant(u.id, ev)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>Нет участников.</Typography>
        )}
        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={handleAddParticipantOpen}
            sx={{ mt: 2 }}
          >
            Добавить участника
          </Button>
        )}
      </Paper>

      {/* Время по исполнителям */}
      <Typography variant="h5" gutterBottom>
        Время, потраченное на задачи по исполнителям
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {timeByUser.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Исполнитель</TableCell>
                  <TableCell>Суммарное время (ч)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeByUser.map((item) => (
                  <TableRow
                    key={item.user.id}
                    hover
                    onClick={() => navigate(`/users/${item.user.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{item.user.username}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography>Нет данных о затраченном времени.</Typography>
        )}
      </Paper>

      {/* Диалоговое окно для добавления участника */}
      <Dialog open={isAddParticipantOpen} onClose={handleAddParticipantClose}>
        <DialogTitle>Добавить участника</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="user-select-label">Пользователь</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUserId}
              label="Пользователь"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {users.map((usr) => (
                <MenuItem key={usr.id} value={usr.id}>
                  {usr.username} (ID: {usr.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddParticipantClose}>Отмена</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddParticipant}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProjectDetailPage;
