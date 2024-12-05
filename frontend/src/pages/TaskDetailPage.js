import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import TaskService from '../services/TaskService';
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
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';

function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [parentTask, setParentTask] = useState(null); // Состояние для родительской задачи
  const [commentContent, setCommentContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [details, setDetails] = useState('');
  const [description, setDescription] = useState('');

  const currentUserRole = AuthService.getUserRole();

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = () => {
    TaskService.getTask(taskId)
      .then((response) => {
        const data = response.data;
        data.comments = data.comments || [];
        data.attachments = data.attachments || [];
        data.subtasks = data.subtasks || [];
        setTask(data);
        setStatus(data.status);
        setEstimatedTime(data.estimated_time);
        setTimeSpent(data.time_spent);
        setDetails(data.details || '');
        setDescription(data.description);

        // Если есть родительская задача, загрузим её детали
        if (data.parent_task_id) {
          loadParentTask(data.parent_task_id);
        } else {
          setParentTask(null);
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке задачи:', error);
        showSnackbar('Не удалось загрузить задачу', 'error');
      });
  };

  const loadParentTask = (parentTaskId) => {
    TaskService.getTask(parentTaskId)
      .then((response) => {
        setParentTask(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке родительской задачи:', error);
        showSnackbar('Не удалось загрузить родительскую задачу', 'error');
      });
  };

  const handleAddComment = () => {
    if (commentContent.trim() === '') return;
    TaskService.addComment(taskId, { content: commentContent })
      .then(() => {
        setCommentContent('');
        loadTask();
        showSnackbar('Комментарий добавлен', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при добавлении комментария:', error);
        showSnackbar('Не удалось добавить комментарий', 'error');
      });
  };

  const handleUploadAttachment = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    TaskService.uploadAttachment(taskId, formData)
      .then(() => {
        setFile(null);
        loadTask();
        showSnackbar('Файл загружен', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при загрузке файла:', error);
        showSnackbar('Не удалось загрузить файл', 'error');
      });
  };

  const handleUpdateTask = () => {
    const taskData = {
      status,
      estimated_time: parseFloat(estimatedTime),
      time_spent: parseFloat(timeSpent),
      details,
      description,
    };
    TaskService.updateTask(taskId, taskData)
      .then(() => {
        loadTask();
        showSnackbar('Задача успешно обновлена', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при обновлении задачи:', error);
        showSnackbar('Не удалось обновить задачу', 'error');
      });
  };

  const handleDeleteTask = async () => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить эту задачу? Все связанные подзадачи будут также удалены.');
    if (!confirmDelete) return;

    try {
      await TaskService.deleteTask(taskId);
      showSnackbar('Задача успешно удалена', 'success');
      navigate('/tasks'); // Перенаправление на страницу задач после удаления
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

  // Функция для форматирования даты
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const options = { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  if (!task) {
    return (
      <Container>
        <Typography variant="h6">Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Детали задачи
      </Typography>
      <Paper sx={{ padding: 4, marginBottom: 5 }}>
        <Grid container spacing={4}>
          {/* Родительская задача */}
          {task.parent_task_id && parentTask && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Родительская задача:{' '}
                <RouterLink
                  to={`/tasks/${parentTask.id}`}
                  style={{ textDecoration: 'none', color: '#1976d2' }}
                >
                  Перейти к родительской задаче
                </RouterLink>{' '}
                (ID: {parentTask.id}) - {parentTask.description}
              </Typography>
            </Grid>
          )}
          {/* Если родительской задачи нет или её не удалось загрузить */}
          {task.parent_task_id && !parentTask && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Родительская задача:{' '}
                <Typography component="span" color="textSecondary">
                  Не удалось загрузить детали родительской задачи.
                </Typography>
              </Typography>
            </Grid>
          )}
          {/* Описание задачи */}
          <Grid item xs={12}>
            <Typography variant="h6">Описание:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="medium"
            />
          </Grid>
          {/* Статус задачи */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Статус:</Typography>
            {currentUserRole !== 'executor' ? (
              <FormControl fullWidth variant="outlined" size="medium">
                <InputLabel id="status-label">Статус</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Статус"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="Новая">Новая</MenuItem>
                  <MenuItem value="В процессе">В процессе</MenuItem>
                  <MenuItem value="Завершена">Завершена</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography>{task.status}</Typography>
            )}
          </Grid>
          {/* Оценочное время */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Оценочное время (ч):</Typography>
            {currentUserRole !== 'executor' ? (
              <TextField
                type="number"
                fullWidth
                variant="outlined"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                size="medium"
              />
            ) : (
              <Typography>{`${task.estimated_time} ч`}</Typography>
            )}
          </Grid>
          {/* Потраченное время */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Потраченное время (ч):</Typography>
            <TextField
              type="number"
              fullWidth
              variant="outlined"
              value={timeSpent}
              onChange={(e) => setTimeSpent(e.target.value)}
              size="medium"
            />
          </Grid>
          {/* Назначенный пользователь */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Назначен:</Typography>
            <Typography>{task.assigned_user ? task.assigned_user.username : '-'}</Typography>
          </Grid>
          {/* Назначил */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Назначил:</Typography>
            <Typography>{task.creator ? task.creator.username : '-'}</Typography>
          </Grid>
          {/* Дата назначения */}
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="h6">Дата назначения:</Typography>
            <Typography>{formatDateTime(task.created_at)}</Typography>
          </Grid>
          {/* Подробное описание */}
          <Grid item xs={12}>
            <Typography variant="h6">Подробное описание:</Typography>
            {currentUserRole === 'admin' || currentUserRole === 'manager' ? (
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                size="medium"
              />
            ) : (
              <Typography>{task.details || '-'}</Typography>
            )}
          </Grid>
          {/* Кнопки управления задачей */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateTask}
                size="large"
              >
                Сохранить изменения
              </Button>
              {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteTask}
                  size="large"
                >
                  Удалить задачу
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Комментарии */}
      <Typography variant="h5" gutterBottom>
        Комментарии
      </Typography>
      <Paper sx={{ padding: 4, marginBottom: 5 }}>
        {task.comments && task.comments.length > 0 ? (
          <List>
            {task.comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start">
                <ListItemText
                  primary={comment.content}
                  secondary={`Автор: ${comment.user.username}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет комментариев.</Typography>
        )}
        <Box sx={{ mt: 3 }}>
          <TextField
            label="Добавить комментарий"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            size="medium"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddComment}
            sx={{ mt: 2 }}
            startIcon={<AddIcon />}
            size="large"
          >
            Добавить комментарий
          </Button>
        </Box>
      </Paper>

      {/* Вложения */}
      <Typography variant="h5" gutterBottom>
        Вложения
      </Typography>
      <Paper sx={{ padding: 4, marginBottom: 5 }}>
        {task.attachments && task.attachments.length > 0 ? (
          <List>
            {task.attachments.map((attachment) => (
              <ListItem key={attachment.id}>
                <ListItemText
                  primary={
                    <a
                      href={`http://localhost:8000/uploads/${attachment.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none', color: '#1976d2' }}
                    >
                      {attachment.filename}
                    </a>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет вложений.</Typography>
        )}
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            size="large"
          >
            Выбрать файл
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadAttachment}
            disabled={!file}
            startIcon={<UploadFileIcon />}
            size="large"
          >
            Загрузить файл
          </Button>
        </Box>
      </Paper>

      {/* Подзадачи */}
      <Typography variant="h5" gutterBottom>
        Подзадачи
      </Typography>
      <Paper sx={{ padding: 4, marginBottom: 5 }}>
        {task.subtasks && task.subtasks.length > 0 ? (
          <List>
            {task.subtasks.map((subtask) => (
              <ListItem key={subtask.id}>
                <ListItemText
                  primary={
                    <RouterLink
                      to={`/tasks/${subtask.id}`}
                      style={{ textDecoration: 'none', color: '#1976d2' }}
                    >
                      {subtask.description}
                    </RouterLink>
                  }
                  secondary={`Статус: ${subtask.status}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Нет подзадач.</Typography>
        )}
        {(currentUserRole === 'admin' || currentUserRole === 'manager') && (
          <Button
            variant="contained"
            color="secondary"
            component={RouterLink}
            to={`/tasks/${task.id}/create-subtask`}
            sx={{ mt: 3 }}
            startIcon={<AddIcon />}
            size="large"
          >
            Создать подзадачу
          </Button>
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

export default TaskDetailPage;