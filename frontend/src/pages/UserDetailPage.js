// src/pages/UserDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';

import UserService from '../services/UserService';
import AuthService, { roleDisplayNames } from '../services/AuthService';
// Пример: roleDisplayNames = { admin: 'Администратор', manager: 'Менеджер', executor: 'Исполнитель' };

function UserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  const currentUser = AuthService.getCurrentUser();
  const currentUserRole = AuthService.getUserRole();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const isAdmin = (currentUserRole === 'admin');
  const isCurrentUser = currentUser && currentUser.user_id === parseInt(userId, 10);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadUser = () => {
    UserService.getUser(userId)
      .then((res) => {
        setUser(res.data);
        setFullName(res.data.full_name || '');
        setEmail(res.data.email || '');
        setRole(res.data.role?.name || '');
      })
      .catch((err) => {
        console.error('Ошибка при загрузке пользователя:', err);
        showSnackbar('Не удалось загрузить пользователя', 'error');
      });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleUpdateUser = () => {
    const payload = {
      full_name: fullName,
      email: email,
    };
    if (isAdmin) {
      payload.role = role;
    }

    UserService.updateUser(userId, payload)
      .then((res) => {
        setUser(res.data);
        setIsEditing(false);
        showSnackbar('Пользователь успешно обновлён', 'success');
      })
      .catch((err) => {
        console.error('Ошибка при обновлении пользователя:', err);
        showSnackbar('Не удалось обновить пользователя', 'error');
      });
  };

  if (!user) {
    return (
      <Container sx={{ mt:4 }}>
        <Typography>Загрузка пользователя...</Typography>
      </Container>
    );
  }

  // Блок формы редактирования
  const renderEditForm = (
    <Paper sx={{ p:3, mb:3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ mb:1 }}>Имя пользователя:</Typography>
          <Typography>{user.username}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ mb:1 }}>Полное имя:</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" sx={{ mb:1 }}>Email:</Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
        {isAdmin && (
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" sx={{ mb:1 }}>Роль:</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Роль</InputLabel>
              <Select
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
          <Button
            variant="contained"
            sx={{ mr:2 }}
            onClick={handleUpdateUser}
          >
            Сохранить
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsEditing(false)}
          >
            Отмена
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  // Основное отображение профиля
  const renderProfileInfo = (
    <>
      {/* Кнопка "Управление аккаунтом", если это сам пользователь или админ */}
      {(isCurrentUser || isAdmin) && (
        <Button
          variant="outlined"
          onClick={() => setIsEditing(true)}
          sx={{ mb:2 }}
        >
          Управление аккаунтом
        </Button>
      )}

      {/* "Сведения" — как в Jira, в отдельном блоке */}
      <Paper sx={{ p:3, mb:3 }}>
        <Typography variant="h6" gutterBottom>Сведения</Typography>

        {/* Заглушки — вместо ваших данных (в бэке можно завести поля: position, department, organization и т.д.) */}
        <Box sx={{ mb:1 }}>
          <Typography variant="body2" sx={{ color:'text.secondary' }}>Ваша должность</Typography>
          <Typography>—</Typography>
        </Box>
        <Box sx={{ mb:1 }}>
          <Typography variant="body2" sx={{ color:'text.secondary' }}>Ваш отдел</Typography>
          <Typography>—</Typography>
        </Box>
        <Box sx={{ mb:1 }}>
          <Typography variant="body2" sx={{ color:'text.secondary' }}>Ваша организация</Typography>
          <Typography>—</Typography>
        </Box>
        <Box sx={{ mb:1 }}>
          <Typography variant="body2" sx={{ color:'text.secondary' }}>Ваше местоположение</Typography>
          <Typography>—</Typography>
        </Box>

        <Divider sx={{ my:2 }}/>

        <Typography variant="body2" sx={{ color:'text.secondary' }}>Контактные данные</Typography>
        <Typography>{user.email || '(не указан)'}</Typography>

        <Divider sx={{ my:2 }}/>

        <Typography variant="body2" sx={{ color:'text.secondary', mb:1 }}>
          Команды
        </Typography>
        <Button
          variant="text"
          sx={{ pl:0 }}
          startIcon={<span style={{ fontSize:'1.3em' }}>+</span>}
          onClick={() => alert('Создать команду (пример)')}
        >
          Создать команду
        </Button>
      </Paper>
    </>
  );

  // Блок «Назначенные задачи»
  const renderAssignedTasks = (
    <Paper sx={{ p:3, mb:3 }}>
      <Typography variant="h5" gutterBottom>Ближайшие задачи (назначены пользователю)</Typography>
      {user.assigned_tasks && user.assigned_tasks.length > 0 ? (
        user.assigned_tasks.map((t) => (
          <Box key={t.id} sx={{ mb:1 }}>
            <Typography
              component={Link}
              to={`/tasks/${t.id}`}
              sx={{ textDecoration:'none', color:'#1976d2', fontWeight:'bold' }}
            >
              {t.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Статус: {t.status}
            </Typography>
            <Divider sx={{ my:1 }}/>
          </Box>
        ))
      ) : (
        <Typography>Нет назначенных задач.</Typography>
      )}
    </Paper>
  );

  // Блок «Бывшие в работе», «Места, где вы работаете» и т.д. тоже можно организовать аналогично,
  // если у вас есть нужные данные из API. Для примера зафиксируем заглушку:

  const renderOtherBlocks = (
    <>
      <Paper sx={{ p:3, mb:3 }}>
        <Typography variant="h5" gutterBottom>Бывшие в работе</Typography>
        <Typography variant="body2">
          (Здесь может быть список недавно закрытых задач/проектов и т.д.)
        </Typography>
      </Paper>

      <Paper sx={{ p:3, mb:3 }}>
        <Typography variant="h5" gutterBottom>Места, где вы работаете</Typography>
        <Typography variant="body2">
          (Например, привязка к репозиториям, проектам и т.д.)
        </Typography>
      </Paper>
    </>
  );

  return (
    <Container maxWidth="xl" sx={{ mt:4 }}>
      {/* Верхний блок с фоном: */}
      <Paper
        sx={{
          p:4,
          mb:3,
          borderRadius:2,
          background:'linear-gradient(90deg, #F9C642 0%, #F7DF90 100%)'
        }}
      >
        <Box display="flex" alignItems="center" gap={3}>
          {/* Аватар */}
          <Avatar sx={{ width:80, height:80, bgcolor:'#FF9800' }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>

          {/* Имя пользователя */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight:'bold' }}>
              {user.full_name || user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Роль: {roleDisplayNames[user.role?.name] || '—'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {/* Левая колонка (кнопка "Управление аккаунтом", Сведения) */}
        <Grid item xs={12} md={4}>
          {/* Если редактируем – показываем форму, иначе – блоки сведений */}
          {isEditing ? renderEditForm : renderProfileInfo}
        </Grid>

        {/* Правая колонка (блок "Назначенные задачи", "Бывшие в работе" и т.д.) */}
        <Grid item xs={12} md={8}>
          {renderAssignedTasks}
          {renderOtherBlocks}
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width:'100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserDetailPage;
