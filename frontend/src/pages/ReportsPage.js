import React, { useEffect, useState } from 'react';
import ReportService from '../services/ReportService';
import {
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Состояния для уведомлений
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    ReportService.getTaskStatistics()
      .then((response) => {
        setStats(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке отчётов:', error);
        showSnackbar('Не удалось загрузить отчёты', 'error');
        setLoading(false);
      });
  }, []);

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Цвета для статусов задач
  const COLORS = {
    new: '#8884d8',          // Фиолетовый для новых задач
    in_progress: '#82ca9d',  // Зеленый для задач в процессе
    completed: '#ffc658',    // Желтый для завершённых задач
  };

  // Подготовка данных для PieChart
  const prepareChartData = () => {
    if (!stats) return [];

    return [
      { name: 'Новые задачи', value: stats.new_tasks, status: 'new' },
      { name: 'Задачи в процессе', value: stats.in_progress_tasks, status: 'in_progress' },
      { name: 'Завершенные задачи', value: stats.completed_tasks, status: 'completed' },
    ];
  };

  const chartData = prepareChartData();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Отчёты
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 4 }}>
        {loading ? (
          <CircularProgress />
        ) : stats ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ padding: 2, backgroundColor: '#e3f2fd' }}>
                <Typography variant="h6">Всего задач</Typography>
                <Typography variant="h4">{stats.total_tasks}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ padding: 2, backgroundColor: '#ffebee' }}>
                <Typography variant="h6">Новые задачи</Typography>
                <Typography variant="h4">{stats.new_tasks}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ padding: 2, backgroundColor: '#e8f5e9' }}>
                <Typography variant="h6">Задачи в процессе</Typography>
                <Typography variant="h4">{stats.in_progress_tasks}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ padding: 2, backgroundColor: '#fce4ec' }}>
                <Typography variant="h6">Завершенные задачи</Typography>
                <Typography variant="h4">{stats.completed_tasks}</Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography>Нет данных для отображения.</Typography>
        )}
      </Paper>

      {/* Донат График */}
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Статус Задач
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : stats ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Typography>Нет данных для отображения графика.</Typography>
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

export default ReportsPage;