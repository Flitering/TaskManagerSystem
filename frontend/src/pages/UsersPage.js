import React, { useEffect, useState } from 'react';
import UserService from '../services/UserService';
import { Link } from 'react-router-dom';
import { roleDisplayNames } from '../services/AuthService';
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

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('executor');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

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
    loadUsers();
  }, []);

  const handleCreateUser = () => {
    const userData = {
      username,
      full_name: fullName,
      email,
      password,
      role,
    };
    UserService.createUser(userData)
      .then(() => {
        loadUsers();
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('executor'); // Значение по умолчанию
        showSnackbar('Пользователь успешно создан', 'success');
      })
      .catch((error) => {
        console.error('Ошибка при создании пользователя:', error.response.data);
        showSnackbar(error.response.data.detail || 'Не удалось создать пользователя', 'error');
      });
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите удалить этого пользователя?');
    if (!confirmDelete) return;

    try {
      await UserService.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      showSnackbar('Пользователь успешно удален', 'success');
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      showSnackbar('Не удалось удалить пользователя', 'error');
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
        Пользователи
      </Typography>

      {/* Форма создания нового пользователя */}
      <Paper sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Создать нового пользователя
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Имя пользователя"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Полное имя"
              variant="outlined"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Пароль"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={4} display="flex" alignItems="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateUser}
            >
              Создать
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица пользователей */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Имя пользователя</TableCell>
              <TableCell>Полное имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>{roleDisplayNames[user.role.name]}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/users/${user.id}`}
                    sx={{ marginRight: 1 }}
                  >
                    Подробнее
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Пользователи не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default UsersPage;