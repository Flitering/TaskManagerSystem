import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Link
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

function LoginPage() {
  const { setUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.access_token) {
      navigate('/projects');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await AuthService.login(username, password);
      console.log('Logged in userData:', userData);
      setUser(userData);
      showSnackbar('Успешный вход', 'success');
      navigate('/tasks');
    } catch (error) {
      console.error('Ошибка входа:', error);
      showSnackbar('Неверные учетные данные', 'error');
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
    <Container maxWidth="sm">
      <Paper sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" gutterBottom align="center">
          Вход в систему
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Имя пользователя"
                variant="outlined"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Пароль"
                variant="outlined"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<LockOpenIcon />}
              >
                Войти
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography align="center">
                Нет аккаунта?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>

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

export default LoginPage;