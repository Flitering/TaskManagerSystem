import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Добавлено
import UserService from '../services/UserService';
import AuthService, { roleDisplayNames } from '../services/AuthService';
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
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';

function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const currentUser = AuthService.getCurrentUser();
  const currentUserRole = AuthService.getUserRole();
  const isCurrentUser = currentUser && currentUser.user_id === parseInt(userId);
  const isAdmin = currentUserRole === 'admin';

  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(''); // Добавлено состояние для роли

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    UserService.getUser(userId)
      .then((response) => {
        setUser(response.data);
        setFullName(response.data.full_name || '');
        setEmail(response.data.email || '');
        setRole(response.data.role.name || '');
      })
      .catch((error) => {
        console.error(error);
        showSnackbar('Не удалось загрузить пользователя', 'error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleUpdateUser = () => {
    const userData = {
      full_name: fullName,
      email: email,
    };
    if (isAdmin) {
      userData.role = role;
    }
    UserService.updateUser(userId, userData)
      .then((response) => {
        setUser(response.data);
        setIsEditing(false);
        showSnackbar('Пользователь успешно обновлён', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при обновлении пользователя:', error);
        showSnackbar('Не удалось обновить пользователя', 'error');
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

  if (!user) {
    return (
      <Container>
        <Typography variant="h6">Загрузка...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {isEditing ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Имя пользователя:</Typography>
              <Typography>{user.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Полное имя:</Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Email:</Typography>
              <TextField
                fullWidth
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            {isAdmin && (
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Роль:</Typography>
                <FormControl fullWidth>
                  <InputLabel id="role-label">Роль</InputLabel>
                  <Select
                    labelId="role-label"
                    value={role}
                    label="Роль"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <MenuItem value="admin">Администратор</MenuItem>
                    <MenuItem value="manager">Менеджер</MenuItem>
                    <MenuItem value="executor">Исполнитель</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleUpdateUser} sx={{ mr: 2 }}>
                Сохранить
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Отмена
              </Button>
            </Grid>
          </Grid>
        ) : (
          <>
            <Typography variant="h6">Имя пользователя:</Typography>
            <Typography gutterBottom>{user.username}</Typography>

            <Typography variant="h6">Полное имя:</Typography>
            <Typography gutterBottom>{user.full_name || '-'}</Typography>

            <Typography variant="h6">Email:</Typography>
            <Typography gutterBottom>{user.email || '-'}</Typography>

            <Typography variant="h6">Роль:</Typography>
            <Typography gutterBottom>{roleDisplayNames[user.role.name]}</Typography>

            {(isCurrentUser || isAdmin) && (
              <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom>
        Назначенные задачи
      </Typography>
      <Paper sx={{ padding: 2 }}>
        {user.assigned_tasks && user.assigned_tasks.length > 0 ? (
          <List>
            {user.assigned_tasks.map((task) => (
              <ListItem key={task.id} disablePadding>
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
          <Typography>Нет назначенных задач.</Typography>
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

export default UserDetailPage;