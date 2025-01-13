// src/pages/BoardPage.js
import React, { useEffect, useState } from 'react';
import TaskService from '../services/TaskService';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';

function BoardPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    TaskService.getTasks()
      .then((res) => setTasks(res.data))
      .catch((err) => console.error('Ошибка при загрузке задач:', err));
  }, []);

  // Группируем задачи по статусу
  const tasksTodo = tasks.filter(t => t.status === 'Новая');
  const tasksInProgress = tasks.filter(t => t.status === 'В процессе');
  const tasksDone = tasks.filter(t => t.status === 'Завершена');

  const renderTaskCard = (task) => (
    <Card key={task.id} variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {task.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Исполнитель: {task.assigned_user?.username || '—'}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Моя Канбан‑доска
      </Typography>

      <Grid container spacing={2}>
        {/* Колонка "Новые" */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '75vh', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              К выполнению
            </Typography>
            {tasksTodo.map(renderTaskCard)}
          </Paper>
        </Grid>

        {/* Колонка "В процессе" */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '75vh', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              В процессе
            </Typography>
            {tasksInProgress.map(renderTaskCard)}
          </Paper>
        </Grid>

        {/* Колонка "Завершена" */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '75vh', overflowY: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Готово
            </Typography>
            {tasksDone.map(renderTaskCard)}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BoardPage;