import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskService from '../services/TaskService';
import UserService from '../services/UserService';
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
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function CreateSubtaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [users, setUsers] = useState([]);
  const [parentTask, setParentTask] = useState(null);

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    UserService.getUsers()
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке пользователей:', error);
        showSnackbar('Не удалось загрузить пользователей', 'error');
      });

    TaskService.getTask(taskId)
      .then((response) => {
        setParentTask(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке родительской задачи:', error);
        showSnackbar('Не удалось загрузить родительскую задачу', 'error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleCreateSubtask = () => {
    if (description.trim() === '') {
      showSnackbar('Описание подзадачи не может быть пустым', 'warning');
      return;
    }

    const subtaskData = {
      description,
      details,
      assigned_user_id: parseInt(assignedUserId) || null,
      project_id: parentTask.project_id || null,
      estimated_time: parseFloat(estimatedTime) || 0,
    };
    TaskService.createSubtask(taskId, subtaskData)
      .then(() => {
        showSnackbar('Подзадача успешно создана', 'success');
        navigate(`/tasks/${taskId}`);
      })
      .catch((error) => {
        console.error('Ошибка при создании подзадачи:', error.response.data);
        showSnackbar(error.response.data.detail || 'Не удалось создать подзадачу', 'error');
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

  if (!parentTask) {
    return (
      <Container>
        <Typography variant="h6">Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Создать подзадачу для: {parentTask.description}
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Описание подзадачи"
              variant="outlined"
              fullWidth
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Подробное описание"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
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
          <Grid item xs={12} sm={6}>
            <TextField
              label="Оценочное время (ч)"
              variant="outlined"
              fullWidth
              type="number"
              step="0.1"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateSubtask}
              startIcon={<AddIcon />}
            >
              Создать подзадачу
            </Button>
            <Button
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={() => navigate(`/tasks/${taskId}`)}
            >
              Отмена
            </Button>
          </Grid>
        </Grid>
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

export default CreateSubtaskPage;