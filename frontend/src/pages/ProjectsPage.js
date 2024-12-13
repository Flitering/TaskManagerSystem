import React, { useState, useEffect, useMemo } from 'react';
import ProjectService from '../services/ProjectService';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [isLeaderDialogOpen, setIsLeaderDialogOpen] = useState(false);
  const [leaderProjectId, setLeaderProjectId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState('');

  // Поиск проектов
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
    const currentUserRole = AuthService.getUserRole();
    if (currentUserRole === 'admin' || currentUserRole === 'manager') {
      loadUsers();
    }
  }, []);

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
      });
  };

  const handleCreateProject = () => {
    if (name.trim() === '') {
      showSnackbar('Название проекта не может быть пустым', 'warning');
      return;
    }

    const projectData = {
      name,
      description,
    };
    ProjectService.createProject(projectData)
      .then(() => {
        loadProjects();
        setName('');
        setDescription('');
        showSnackbar('Проект успешно создан', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при создании проекта:', error);
        showSnackbar(error.response?.data?.detail || 'Не удалось создать проект', 'error');
      });
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить этот проект? Все связанные задачи будут также удалены.');
    if (!confirmDelete) return;

    try {
      await ProjectService.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      showSnackbar('Проект успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      showSnackbar('Не удалось удалить проект', 'error');
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

  const handleOpenLeaderDialog = (projectId) => {
    setLeaderProjectId(projectId);
    setSelectedLeaderId('');
    setIsLeaderDialogOpen(true);
  };

  const handleCloseLeaderDialog = () => {
    setIsLeaderDialogOpen(false);
    setLeaderProjectId(null);
    setSelectedLeaderId('');
  };

  const handleAssignLeader = () => {
    if (!selectedLeaderId) {
      showSnackbar('Выберите пользователя для назначения лидером', 'warning');
      return;
    }
    ProjectService.assignLeader(leaderProjectId, selectedLeaderId)
      .then(() => {
        showSnackbar('Лидер успешно назначен', 'success');
        handleCloseLeaderDialog();
        loadProjects();
      })
      .catch((error) => {
        console.error('Ошибка при назначении лидера:', error);
        showSnackbar('Не удалось назначить лидера', 'error');
      });
  };

  // Фильтрация проектов по поиску
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  // Подсчёт статистики по проектам
  const totalProjects = projects.length;
  const projectsWithLeader = projects.filter(p => p.leader !== null).length;
  const projectsWithoutLeader = totalProjects - projectsWithLeader;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Проекты
      </Typography>

      {/* Статистика по проектам */}
      {totalProjects > 0 && (
        <Paper sx={{ padding: 3, marginBottom: 4 }}>
          <Typography variant="h6" gutterBottom>
            Статистика по проектам
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="subtitle1">Всего проектов</Typography>
                <Typography variant="h5">{totalProjects}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="subtitle1">С лидером</Typography>
                <Typography variant="h5">{projectsWithLeader}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="subtitle1">Без лидера</Typography>
                <Typography variant="h5">{projectsWithoutLeader}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Поиск проектов */}
      {totalProjects > 0 && (
        <Paper sx={{ padding: 3, marginBottom: 4 }}>
          <Typography variant="h6" gutterBottom>
            Поиск по проектам
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              variant="outlined"
              label="Введите название проекта"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
              fullWidth
            />
          </Box>
        </Paper>
      )}

      {/* Форма создания нового проекта */}
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Создать новый проект
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Название проекта"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Описание проекта"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateProject}
              startIcon={<AddIcon />}
            >
              Создать
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Список проектов */}
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          Список проектов
        </Typography>
        {filteredProjects && filteredProjects.length > 0 ? (
          <List>
            {filteredProjects.map((project) => (
              <ListItem
                key={project.id}
                secondaryAction={
                  <>
                    {(AuthService.getUserRole() === 'admin' || AuthService.getUserRole() === 'manager') && (
                      <IconButton edge="end" color="primary" onClick={() => handleOpenLeaderDialog(project.id)}>
                        <PersonIcon />
                      </IconButton>
                    )}
                    {(AuthService.getUserRole() === 'admin' || AuthService.getUserRole() === 'manager') && (
                      <IconButton edge="end" color="error" onClick={() => handleDeleteProject(project.id)}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </>
                }
              >
                <ListItemText
                  primary={
                    <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                      {project.name}
                    </Link>
                  }
                  secondary={project.description}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Проекты не найдены.</Typography>
        )}
      </Paper>

      {/* Диалог для назначения лидера */}
      <Dialog open={isLeaderDialogOpen} onClose={handleCloseLeaderDialog}>
        <DialogTitle>Назначить лидера проекта</DialogTitle>
        <DialogContent>
          {users && users.length > 0 ? (
            <FormControl fullWidth>
              <InputLabel id="leader-select-label">Пользователь</InputLabel>
              <Select
                labelId="leader-select-label"
                value={selectedLeaderId}
                label="Пользователь"
                onChange={(e) => setSelectedLeaderId(e.target.value)}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username} (ID: {u.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography>Нет пользователей для назначения лидера.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLeaderDialog}>Отмена</Button>
          <Button variant="contained" color="primary" onClick={handleAssignLeader} disabled={!selectedLeaderId}>
            Назначить
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProjectsPage;