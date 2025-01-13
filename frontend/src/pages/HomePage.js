import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Box,
  Tab,
  Tabs,
  Divider,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';

import DashboardService from '../services/DashboardService';

function HomePage() {
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  
  const [tabValue, setTabValue] = useState(0);
  const tabs = [
    { label: 'Бывшие в работе' }, 
    { label: 'Просмотренные' },
    { label: 'Назначенные мне' },
    { label: 'Отмеченные' },
  ];

  const [viewedData, setViewedData] = useState({ tasks: [], projects: [] });
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [favorites, setFavorites] = useState({ tasks: [], projects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      DashboardService.getRecentProjects(),
      DashboardService.getRecentTasks(),
      DashboardService.getViewed(),
      DashboardService.getAssignedToMe(),
      DashboardService.getFavorites()
    ])
      .then(([rp, rt, vw, asg, fav]) => {
        setRecentProjects(rp.data);
        setRecentTasks(rt.data);
        setViewedData(vw.data);
        setAssignedTasks(asg.data);
        setFavorites(fav.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Ошибка загрузки HomePage:', err);
        setLoading(false);
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6">Загрузка...</Typography>
      </Container>
    );
  }

  let tabContent;
  switch(tabValue) {
    case 0: // Бывшие в работе
      tabContent = (
        <>
          {recentTasks.length === 0 && <Typography>Нет недавних задач</Typography>}
          <List>
            {recentTasks.map(task => (
              <ListItem key={task.id}>
                <Box sx={{ mr: 1 }}>
                  <input type="checkbox" checked={task.status === 'Завершена'} readOnly />
                </Box>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/tasks/${task.id}`} underline="hover">
                      {task.title || task.description}
                    </MuiLink>
                  }
                  secondary={`Статус: ${task.status}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      );
      break;

    case 1: // Просмотренные
      tabContent = (
        <Box>
          <Typography variant="subtitle1">Просмотренные задачи:</Typography>
          {viewedData.tasks.length === 0 && <Typography>Нет</Typography>}
          <List>
            {viewedData.tasks.map(t => (
              <ListItem key={t.id}>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/tasks/${t.id}`} underline="hover">
                      {t.title || t.description}
                    </MuiLink>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">Просмотренные проекты:</Typography>
          {viewedData.projects.length === 0 && <Typography>Нет</Typography>}
          <List>
            {viewedData.projects.map(p => (
              <ListItem key={p.id}>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/projects/${p.id}`} underline="hover">
                      {p.name}
                    </MuiLink>
                  }
                  secondary={p.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      );
      break;

    case 2: // Назначенные мне
      tabContent = (
        <>
          {assignedTasks.length === 0 && <Typography>Нет задач, назначенных вам</Typography>}
          <List>
            {assignedTasks.map(task => (
              <ListItem key={task.id}>
                <Box sx={{ mr: 1 }}>
                  <input type="checkbox" checked={task.status === 'Завершена'} readOnly />
                </Box>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/tasks/${task.id}`} underline="hover">
                      {task.title || task.description}
                    </MuiLink>
                  }
                  secondary={`Статус: ${task.status}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      );
      break;

    case 3: // Отмеченные (избранное)
      tabContent = (
        <Box>
          <Typography variant="subtitle1">Избранные задачи:</Typography>
          {favorites.tasks.length === 0 && <Typography>Нет</Typography>}
          <List>
            {favorites.tasks.map(t => (
              <ListItem key={t.id}>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/tasks/${t.id}`} underline="hover">
                      {t.title || t.description}
                    </MuiLink>
                  }
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1">Избранные проекты:</Typography>
          {favorites.projects.length === 0 && <Typography>Нет</Typography>}
          <List>
            {favorites.projects.map(p => (
              <ListItem key={p.id}>
                <ListItemText
                  primary={
                    <MuiLink component={Link} to={`/projects/${p.id}`} underline="hover">
                      {p.name}
                    </MuiLink>
                  }
                  secondary={p.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      );
      break;

    default:
      tabContent = <div>Ошибка вкладки</div>;
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ваша работа
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Недавние проекты
            </Typography>
            {recentProjects.length > 0 ? (
              <List>
                {recentProjects.map((proj) => (
                  <ListItem
                    key={proj.id}
                    component={Link}
                    to={`/projects/${proj.id}`}
                    style={{ textDecoration:'none', color:'inherit' }}
                  >
                    <ListItemText
                      primary={proj.name}
                      secondary={proj.description || ''}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>Нет проектов</Typography>
            )}

            <Divider sx={{ my:1 }} />

            <Typography variant="subtitle1">Быстрые ссылки</Typography>
            <List>
              <ListItem
                button
                component={Link}
                to="/tasks?filter=mine"
              >
                <ListItemText primary="Мои открытые задачи" />
              </ListItem>
              <ListItem
                button
                component={Link}
                to="/tasks?filter=done"
              >
                <ListItemText primary="Выполненные задачи" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb:2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              {tabs.map((t, idx) => (
                <Tab key={idx} label={t.label} />
              ))}
            </Tabs>
          </Box>

          {tabContent}
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;