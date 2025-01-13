import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

import UserService from '../services/UserService';
import AuthService from '../services/AuthService';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // id редактируемого пользователя
  const [editUserId, setEditUserId] = useState(null);

  // Поля формы
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('executor');
  const [password, setPassword] = useState('');

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Список ролей (Enum: admin, manager, executor)
  const roleOptions = [
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'executor', label: 'Исполнитель' },
  ];

  // Проверка роли текущего пользователя, если хотим ограничить доступ
  const currentUserRole = AuthService.getUserRole();
  // если currentUserRole !== 'admin', можно показывать ошибку или убить страницу

  const loadUsers = () => {
    UserService.getUsers()
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Ошибка при загрузке пользователей:', err);
        showSnackbar('Не удалось загрузить пользователей', 'error');
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showSnackbar = (msg, severity='success') => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleOpenForm = (user) => {
    if (user) {
      // Редактируем
      setIsEditMode(true);
      setEditUserId(user.id);
      setUsername(user.username);
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setRole(user.role?.name || 'executor');
      setPassword(''); // при редактировании, если хотим сменить пароль
    } else {
      // Создаём
      setIsEditMode(false);
      setEditUserId(null);
      setUsername('');
      setFullName('');
      setEmail('');
      setRole('executor');
      setPassword('');
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleSaveUser = () => {
    if (!username.trim()) {
      showSnackbar('Имя пользователя не может быть пустым', 'warning');
      return;
    }

    if (isEditMode) {
      // update
      const updateData = {
        username, // хотя в схеме userUpdate у нас нет username, 
                  // если нужно менять, надо править схему
        full_name: fullName,
        email,
        role,
      };
      if (password) {
        updateData.password = password;
      }

      UserService.updateUser(editUserId, updateData)
        .then(() => {
          showSnackbar('Пользователь обновлён', 'success');
          loadUsers();
          setOpenForm(false);
        })
        .catch(err => {
          console.error('Ошибка при обновлении пользователя:', err);
          showSnackbar('Не удалось обновить пользователя', 'error');
        });
    } else {
      // create
      const createData = {
        username,
        full_name: fullName,
        email,
        password,
        role,
      };
      UserService.createUser(createData)
        .then(() => {
          showSnackbar('Пользователь создан', 'success');
          loadUsers();
          setOpenForm(false);
        })
        .catch(err => {
          console.error('Ошибка при создании пользователя:', err);
          showSnackbar('Не удалось создать пользователя', 'error');
        });
    }
  };

  const handleDeleteUser = (userId) => {
    if (!window.confirm('Удалить пользователя?')) return;
    UserService.deleteUser(userId)
      .then(() => {
        showSnackbar('Пользователь удалён', 'success');
        loadUsers();
      })
      .catch(err => {
        console.error('Ошибка удаления пользователя:', err);
        showSnackbar('Не удалось удалить пользователя', 'error');
      });
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Управление пользователями
      </Typography>

      {(currentUserRole === 'admin') && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ mb: 2 }}
          onClick={() => handleOpenForm(null)}
        >
          Создать пользователя
        </Button>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Логин (username)</TableCell>
              <TableCell>Полное имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.full_name || '-'}</TableCell>
                <TableCell>{u.email || '-'}</TableCell>
                <TableCell>{u.role?.name}</TableCell>
                <TableCell>
                  {(currentUserRole === 'admin') && (
                    <>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenForm(u)}
                        sx={{ mr:1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Нет пользователей
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Модалка создания/редактирования */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>
          {isEditMode ? 'Редактировать пользователя' : 'Создать пользователя'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Имя пользователя (username)"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            // disabled={isEditMode} // если не хотим менять username при редактировании
          />
          <TextField
            label="Полное имя"
            fullWidth
            margin="normal"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Роль</InputLabel>
            <Select
              value={role}
              label="Роль"
              onChange={e => setRole(e.target.value)}
            >
              {roleOptions.map(r => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={isEditMode ? 'Новый пароль (необязательно)' : 'Пароль'}
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Отмена</Button>
          {(currentUserRole === 'admin') && (
            <Button variant="contained" onClick={handleSaveUser}>
              {isEditMode ? 'Сохранить' : 'Создать'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UsersPage;
