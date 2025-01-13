// src/components/SideMenu.js
import React from 'react';
import {
  Drawer,
  Toolbar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function SideMenu({ open, drawerWidth }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Пытаемся выцепить projectId из URL, если /projects/:projectId
  let projectId = null;
  const match = location.pathname.match(/^\/projects\/(\d+)/);
  if (match) {
    projectId = match[1]; // строка
  }

  const planningItems = [
    { text: 'Сводка', link: 'summary' },
    { text: 'Хронология', link: 'timeline' },
    { text: 'Доска', link: 'board' },
    { text: 'Список', link: 'list' },
    { text: 'Формы', link: 'forms' },
    { text: 'Цели', link: 'goals' },
  ];

  const devItems = [
    { text: 'Код (репозиторий)', link: 'repo' },
    { text: 'Страницы проекта', link: 'pages' },
    { text: 'Настройки проекта', link: 'settings' },
  ];

  const handleItemClick = (subpath) => {
    if (projectId) {
      navigate(`/projects/${projectId}/${subpath}`);
    } else {
      console.warn('No projectId found in URL');
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 0,
          transition: 'width 0.3s',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <Box sx={{ p: 2 }}>
        <List>
          <ListItem>
            <ListItemText
              primary="ПЛАНИРОВАНИЕ"
              primaryTypographyProps={{ fontWeight:'bold' }}
            />
          </ListItem>
          {planningItems.map((item, idx) => (
            <ListItem button key={idx} onClick={() => handleItemClick(item.link)}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my:1 }} />

        <List>
          <ListItem>
            <ListItemText
              primary="РАЗРАБОТКА"
              primaryTypographyProps={{ fontWeight:'bold' }}
            />
          </ListItem>
          {devItems.map((item, idx) => (
            <ListItem button key={idx} onClick={() => handleItemClick(item.link)}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default SideMenu;
