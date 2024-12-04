import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthService, { roleDisplayNames } from '../services/AuthService';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TaskIcon from '@mui/icons-material/Assignment';
import UsersIcon from '@mui/icons-material/People';
import ProjectIcon from '@mui/icons-material/Business';
import ReportsIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const drawerWidth = 240;

function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const currentUserRole = AuthService.getUserRole();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние для временного Drawer (мобильное меню)
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/');
  };

  // Определение пунктов меню на основе роли пользователя
  const menuItems = user
    ? [
        {
          text: 'Задачи',
          icon: <TaskIcon />,
          link: '/tasks',
        },
        ...(currentUserRole === 'admin'
          ? [
              {
                text: 'Пользователи',
                icon: <UsersIcon />,
                link: '/users',
              },
            ]
          : []),
        ...(currentUserRole === 'admin' || currentUserRole === 'manager'
          ? [
              {
                text: 'Проекты',
                icon: <ProjectIcon />,
                link: '/projects',
              },
              {
                text: 'Отчёты',
                icon: <ReportsIcon />,
                link: '/reports',
              },
              {
                text: 'Поиск',
                icon: <SearchIcon />,
                link: '/search',
              },
            ]
          : []),
        {
          text: 'Выйти',
          icon: <LogoutIcon />,
          action: handleLogout,
        },
      ]
    : [
        {
          text: 'Вход',
          icon: <LoginIcon />,
          link: '/',
        },
      ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Task Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            component={item.link ? Link : 'button'}
            to={item.link || '#'}
            onClick={item.action ? item.action : () => {}}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar для мобильных устройств */}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="открыть меню"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Task Manager
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Permanent Drawer для больших экранов */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Temporary Drawer для мобильных устройств */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Улучшение производительности на мобильных устройствах
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            [`& .MuiDrawer-paper`]: { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: isMobile ? '64px' : 0, // Высота AppBar на мобильных устройствах
        }}
      >
        {/* Здесь будет рендериться ваш основной контент через маршруты */}
      </Box>
    </Box>
  );
}

export default Navbar;