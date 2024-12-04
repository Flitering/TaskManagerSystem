import React, { useState, useEffect } from 'react';
import ProjectService from '../services/ProjectService';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom'; // Добавлено

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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

  useEffect(() => {
    loadProjects();
  }, []);

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
        showSnackbar(error.response.data.detail || 'Не удалось создать проект', 'error');
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Проекты
      </Typography>

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
        {projects && projects.length > 0 ? (
          <List>
            {projects.map((project) => (
              <ListItem key={project.id} secondaryAction={
                <IconButton edge="end" color="error" onClick={() => handleDeleteProject(project.id)}>
                  <DeleteIcon />
                </IconButton>
              }>
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
          <Typography>Нет проектов для отображения.</Typography>
        )}
      </Paper>

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