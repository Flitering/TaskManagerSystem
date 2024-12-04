import React, { useState } from 'react';
import TaskService from '../services/TaskService';
import ProjectService from '../services/ProjectService';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [taskResults, setTaskResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSearch = () => {
    if (query.trim() === '') {
      showSnackbar('Введите поисковый запрос', 'warning');
      return;
    }

    TaskService.searchTasks(query)
      .then((response) => setTaskResults(response.data))
      .catch((error) => {
        console.error(error);
        showSnackbar('Не удалось выполнить поиск по задачам', 'error');
      });

    ProjectService.searchProjects(query)
      .then((response) => setProjectResults(response.data))
      .catch((error) => {
        console.error(error);
        showSnackbar('Не удалось выполнить поиск по проектам', 'error');
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Поиск
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              variant="outlined"
              label="Введите поисковый запрос"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Искать
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Результаты по задачам */}
      <Typography variant="h5" gutterBottom>
        Результаты по задачам
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {taskResults && taskResults.length > 0 ? (
          <List>
            {taskResults.map((task) => (
              <ListItem key={task.id}>
                <ListItemText
                  primary={
                    <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
                      {task.description}
                    </Link>
                  }
                  secondary={`Статус: ${task.status}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет результатов по задачам.</Typography>
        )}
      </Paper>

      {/* Результаты по проектам */}
      <Typography variant="h5" gutterBottom>
        Результаты по проектам
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {projectResults && projectResults.length > 0 ? (
          <List>
            {projectResults.map((project) => (
              <ListItem key={project.id}>
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
          <Typography>Нет результатов по проектам.</Typography>
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

export default SearchPage;