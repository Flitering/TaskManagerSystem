import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [priority, setPriority] = useState('Средний');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const currentUserRole = AuthService.getUserRole();

  const loadTasks = () => {
    TaskService.getTasks()
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке задач:', error);
        showSnackbar('Не удалось загрузить задачи', 'error');
      });
  };

  const loadProjects = () => {
    ProjectService.getProjects()
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке проектов:', error);
        showSnackbar('Не удалось загрузить проекты', 'error');
      });
  };

  const loadUsers = () => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
        showSnackbar('Не удалось загрузить пользователей', 'error');
      });
  };

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = () => {
    const taskData = {
      description,
      details,
      assigned_user_id: parseInt(assignedUserId) || null,
      project_id: parseInt(projectId) || null,
      estimated_time: parseFloat(estimatedTime) || 0,
      priority,
    };
    TaskService.createTask(taskData)
      .then(() => {
        loadTasks();
        setDescription('');
        setDetails('');
        setAssignedUserId('');
        setProjectId('');
        setEstimatedTime('');
        setPriority('Средний');
        showSnackbar('Задача успешно создана', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при создании задачи:', error);
        showSnackbar(error.response?.data?.detail || 'Не удалось создать задачу', 'error');
      });
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить эту задачу? Все связанные подзадачи будут также удалены.');
    if (!confirmDelete) return;

    try {
      await TaskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      showSnackbar('Задача успешно удалена', 'success');
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      showSnackbar('Не удалось удалить задачу', 'error');
    }
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const options = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Задачи
      </Typography>

      {currentUserRole !== 'executor' && (
        <Paper sx={{ padding: 4, marginBottom: 5 }}>
          <Typography variant="h6" gutterBottom>
            Создать новую задачу
          </Typography>
          <Grid container spacing={4}>

            {/* Основные поля задачи */}
            <Grid item xs={12}>
              <TextField
                label="Описание задачи"
                variant="outlined"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                size="medium"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" size="medium" sx={{ mb:2 }}>
                <InputLabel id="project-label">Проект</InputLabel>
                <Select
                  labelId="project-label"
                  value={projectId}
                  label="Проект"
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Не указано</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name} (ID: {project.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined" size="medium" sx={{ mb:2 }}>
                <InputLabel id="assigned-user-label">Назначить пользователя</InputLabel>
                <Select
                  labelId="assigned-user-label"
                  value={assignedUserId}
                  label="Назначить пользователя"
                  onChange={(e) => setAssignedUserId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Не назначено</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} (ID: {user.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Дополнительные сведения отдельно */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Дополнительные сведения</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={8}>
                  <TextField
                    label="Подробное описание"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Оценочное время (ч)"
                    variant="outlined"
                    fullWidth
                    type="number"
                    step="0.1"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    size="medium"
                    sx={{ mb:2 }}
                  />
                  <FormControl fullWidth variant="outlined" size="medium">
                    <InputLabel id="priority-label">Приоритет</InputLabel>
                    <Select
                      labelId="priority-label"
                      value={priority}
                      label="Приоритет"
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <MenuItem value="Низкий">Низкий</MenuItem>
                      <MenuItem value="Средний">Средний</MenuItem>
                      <MenuItem value="Высокий">Высокий</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateTask}
                size="large"
              >
                Создать
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Проект</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Назначен</TableCell>
              <TableCell>Назначил</TableCell>
              <TableCell>Дата назначения</TableCell>
              <TableCell>Оценка (ч)</TableCell>
              <TableCell>Потрачено (ч)</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.id}</TableCell>
                <TableCell>
                  <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                    {task.description}
                  </Link>
                </TableCell>
                <TableCell>{task.project ? task.project.name : '-'}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.assigned_user ? task.assigned_user.username : '-'}</TableCell>
                <TableCell>{task.creator ? task.creator.username : '-'}</TableCell>
                <TableCell>{formatDateTime(task.created_at)}</TableCell>
                <TableCell>{task.estimated_time}</TableCell>
                <TableCell>{task.time_spent}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/tasks/${task.id}`}
                    sx={{ marginRight: 1 }}
                    size="small"
                  >
                    Подробнее
                  </Button>
                  {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label="delete"
                      size="small"
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Задачи не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default TasksPage;