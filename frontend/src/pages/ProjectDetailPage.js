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
  IconButton
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

  // Состояния загрузки проекта и самого проекта
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Состояние для редактирования проекта
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Состояние для уведомлений
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

  // Создание задачи
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [newTaskEstimatedTime, setNewTaskEstimatedTime] = useState('');
  const [newTaskAssignedUserId, setNewTaskAssignedUserId] = useState('');
  const [taskUsers, setTaskUsers] = useState([]);

  useEffect(() => {
    loadProjectDetail();
    loadUsers();
  }, [projectId]);

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
        setTaskUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
      });
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const handleEditProject = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || '');
    setIsEditingProject(true);
  };

  const handleSaveProject = () => {
    const projectData = {
      name: editName,
      description: editDescription
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

  const filteredTasks = useMemo(() => {
    if (!project || !project.tasks) return [];
    return project.tasks.filter((task) => {
      if (taskStatusFilter && task.status !== taskStatusFilter) return false;
      if (taskAssigneeFilter && task.assigned_user && task.assigned_user.id.toString() !== taskAssigneeFilter) return false;
      if (taskPriorityFilter && task.priority !== taskPriorityFilter) return false;
      if (taskSearchQuery && !task.description.toLowerCase().includes(taskSearchQuery.toLowerCase())) return false;
      if (taskDueDateFilter) {
        const filterDate = new Date(taskDueDateFilter);
        const taskDue = task.due_date ? new Date(task.due_date) : null;
        if (taskDue && taskDue < filterDate) return false;
      }
      return true;
    });
  }, [project, taskStatusFilter, taskAssigneeFilter, taskPriorityFilter, taskSearchQuery, taskDueDateFilter]);

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

  const handleCreateTaskOpen = () => {
    setNewTaskDescription('');
    setNewTaskDetails('');
    setNewTaskEstimatedTime('');
    setNewTaskAssignedUserId('');
    setIsCreateTaskOpen(true);
  };

  const handleCreateTaskClose = () => {
    setIsCreateTaskOpen(false);
  };

  const handleCreateTask = () => {
    if (newTaskDescription.trim() === '') {
      showSnackbar('Описание задачи не может быть пустым', 'warning');
      return;
    }
    const taskData = {
      description: newTaskDescription,
      details: newTaskDetails,
      assigned_user_id: newTaskAssignedUserId ? parseInt(newTaskAssignedUserId) : null,
      project_id: parseInt(projectId),
      estimated_time: parseFloat(newTaskEstimatedTime) || 0,
    };
    TaskService.createTask(taskData)
      .then(() => {
        showSnackbar('Задача успешно создана', 'success');
        handleCreateTaskClose();
        loadProjectDetail();
      })
      .catch((error) => {
        console.error('Ошибка при создании задачи:', error);
        showSnackbar('Не удалось создать задачу', 'error');
      });
  };

  // Функция для удаления задачи
  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation(); // Чтобы не сработал переход к задаче
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

  // Функция для удаления участника
  const handleRemoveParticipant = (userId, e) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить этого участника из проекта?')) {
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

  // Подсчёт задач по статусам
  const totalTasks = project && project.tasks ? project.tasks.length : 0;
  const newTasksCount = project && project.tasks ? project.tasks.filter(t => t.status === 'Новая').length : 0;
  const inProgressCount = project && project.tasks ? project.tasks.filter(t => t.status === 'В процессе').length : 0;
  const completedCount = project && project.tasks ? project.tasks.filter(t => t.status === 'Завершена').length : 0;

  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Новые', value: newTasksCount, color: '#8884d8' },
    { name: 'В процессе', value: inProgressCount, color: '#82ca9d' },
    { name: 'Завершены', value: completedCount, color: '#ffc658' }
  ].filter(item => item.value > 0);

  // Прогресс выполнения
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Время по исполнителям
  const timeByUser = useMemo(() => {
    if (!project || !project.tasks) return [];
    const map = new Map();
    for (const task of project.tasks) {
      if (task.assigned_user) {
        const uid = task.assigned_user.id;
        const current = map.get(uid) || { user: task.assigned_user, total: 0 };
        current.total += task.time_spent;
        map.set(uid, current);
      }
    }
    return Array.from(map.values());
  }, [project]);

  let content;

  if (loading) {
    content = <Typography>Загрузка...</Typography>;
  } else if (!project) {
    content = <Typography>Проект не найден</Typography>;
  } else {
    const canEdit = currentUserRole === 'admin' || currentUserRole === 'manager';

    content = (
      <>
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
                <Button variant="contained" color="primary" onClick={handleSaveProject} sx={{mr:2}}>
                  Сохранить
                </Button>
                <Button variant="outlined" onClick={() => setIsEditingProject(false)}>
                  Отмена
                </Button>
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>{project.name}</Typography>
              <Typography gutterBottom>{project.description || 'Нет описания.'}</Typography>
              {project.created_at && (
                <Typography gutterBottom>Дата создания: {new Date(project.created_at).toLocaleString()}</Typography>
              )}
              {project.leader && (
                <Typography gutterBottom>
                  Руководитель проекта: {project.leader.full_name || project.leader.username}
                </Typography>
              )}

              {canEdit && (
                <>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditProject} sx={{mr:2}}>
                    Редактировать проект
                  </Button>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTaskOpen}>
                    Создать задачу
                  </Button>
                </>
              )}
            </>
          )}
        </Paper>

        <Box sx={{ marginBottom: 4 }}>
          <Button variant="contained" color="secondary" onClick={() => navigate('/reports')}>
            Отчёты / Аналитика
          </Button>
        </Box>

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
              <Box sx={{ mt:2 }}>
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

        <Typography variant="h5" gutterBottom>
          Задачи проекта
        </Typography>
        <Paper sx={{ padding: 3, marginBottom: 4 }}>
          <Box display="flex" alignItems="center" gap={2} marginBottom={2} flexWrap="wrap">
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
                {users.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
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
                endAdornment: <SearchIcon />
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
                  {filteredTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      hover
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <TableCell>{task.id}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.assigned_user ? task.assigned_user.username : '-'}</TableCell>
                      <TableCell>{task.time_spent}</TableCell>
                      <TableCell>{task.estimated_time}</TableCell>
                      {canEdit && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton color="error" onClick={(e) => handleDeleteTask(task.id, e)}>
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
                  {project.participants.map((user) => (
                    <TableRow key={user.id} hover onClick={() => navigate(`/users/${user.id}`)} style={{cursor:'pointer'}}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.role.name}</TableCell>
                      {canEdit && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <IconButton color="error" onClick={(e) => handleRemoveParticipant(user.id, e)}>
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
            <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={handleAddParticipantOpen} sx={{mt:2}}>
              Добавить участника
            </Button>
          )}
        </Paper>

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
                  {timeByUser.map(item => (
                    <TableRow key={item.user.id} hover onClick={() => navigate(`/users/${item.user.id}`)} style={{cursor:'pointer'}}>
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
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} (ID: {u.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddParticipantClose}>Отмена</Button>
            <Button onClick={handleAddParticipant} variant="contained" color="primary">
              Добавить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Диалоговое окно для создания задачи */}
        <Dialog open={isCreateTaskOpen} onClose={handleCreateTaskClose}>
          <DialogTitle>Создать задачу</DialogTitle>
          <DialogContent>
            <TextField
              label="Описание задачи"
              variant="outlined"
              fullWidth
              required
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              sx={{ mb:2, mt:1 }}
            />
            <TextField
              label="Подробное описание"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={newTaskDetails}
              onChange={(e) => setNewTaskDetails(e.target.value)}
              sx={{ mb:2 }}
            />
            <TextField
              label="Оценочное время (ч)"
              variant="outlined"
              type="number"
              fullWidth
              value={newTaskEstimatedTime}
              onChange={(e) => setNewTaskEstimatedTime(e.target.value)}
              sx={{ mb:2 }}
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel id="assign-user-label">Назначить пользователя</InputLabel>
              <Select
                labelId="assign-user-label"
                value={newTaskAssignedUserId}
                label="Назначить пользователя"
                onChange={(e) => setNewTaskAssignedUserId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Не назначено</em>
                </MenuItem>
                {taskUsers.map((usr) => (
                  <MenuItem key={usr.id} value={usr.id}>{usr.username} (ID: {usr.id})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateTaskClose}>Отмена</Button>
            <Button variant="contained" color="primary" onClick={handleCreateTask}>
              Создать
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return (
    <Container>
      {content}

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProjectDetailPage;