// src/components/Header.js
import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import AuthService from '../services/AuthService';

function Header({ drawerOpen, onDrawerToggle, showSideMenu }) {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);

  const userRole = AuthService.getUserRole();
  const isAdmin = (userRole === 'admin');

  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/');
  };

  // Отображаем либо full_name, либо username, либо "NoName"
  const displayName = user ? (user.full_name || user.username || 'NoName') : '';

  return (
    <AppBar
      position="fixed"
      sx={{
        // Если SideMenu отображается И оно открыто => ширина=calc(100% - 240px)
        // Иначе => 100%
        width: showSideMenu && drawerOpen ? `calc(100% - 240px)` : '100%',
        ml: showSideMenu && drawerOpen ? '240px' : 0,
        transition: 'all 0.3s ease',
        backgroundColor: '#f4f5f7',
        color: 'black',
        boxShadow: 'none',
        borderBottom: '1px solid #dcdcdc',
      }}
    >
      <Toolbar>
        {/* Кнопку Menu показываем только если пользователь залогинен И showSideMenu === true */}
        {user && showSideMenu && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          noWrap
          onClick={() => navigate('/')}
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
        >
          Task Manager (Jira-like)
        </Typography>

        {user ? (
          <>
            {/* Кнопки навигации */}
            <Button onClick={() => navigate('/projects')} color="inherit">
              Проекты
            </Button>
            <Button onClick={() => navigate('/tasks')} color="inherit">
              Задачи
            </Button>
            <Button onClick={() => navigate('/board')} color="inherit">
              Доска
            </Button>
            <Button onClick={() => navigate('/reports')} color="inherit">
              Отчёты
            </Button>
            <Button onClick={() => navigate('/search')} color="inherit">
              Поиск
            </Button>

            {/* Имя + аватар */}
            <Box sx={{ ml: 2, fontWeight: 'bold' }}>{displayName}</Box>

            <IconButton color="inherit" onClick={handleProfileMenuOpen} sx={{ ml:1 }}>
              <Avatar alt={displayName} />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
              transformOrigin={{ horizontal:'right', vertical:'top' }}
            >
              <MenuItem
                onClick={() => {
                  navigate(`/users/${user.user_id || 1}`);
                  handleMenuClose();
                }}
              >
                Мой профиль
              </MenuItem>

              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    navigate('/users');
                    handleMenuClose();
                  }}
                >
                  Управление пользователями
                </MenuItem>
              )}

              <MenuItem
                onClick={() => {
                  navigate('/settings');
                  handleMenuClose();
                }}
              >
                Настройки
              </MenuItem>

              <MenuItem onClick={handleLogout}>
                Выйти
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button onClick={() => navigate('/login')} color="inherit">
              Вход
            </Button>
            <Button onClick={() => navigate('/register')} color="inherit">
              Регистрация
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
