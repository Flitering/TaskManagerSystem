// src/components/Layout.js
import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import SideMenu from './SideMenu';

const drawerWidth = 240;

function Layout({ children }) {
  const location = useLocation();

  // Если URL начинается с "/projects/", значит мы на странице проекта
  const isProjectPage = location.pathname.startsWith('/projects/');

  // Состояние «открыто ли меню»
  // При желании: можно по умолчанию открыть, если isProjectPage === true
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f5f7' }}>
      {/* Header */}
      <Header
        drawerOpen={drawerOpen}
        onDrawerToggle={handleDrawerToggle}
        showSideMenu={isProjectPage} // <— передадим проп, чтобы Header знал, скрывать ли гамбургер
      />

      {/* Рендерим SideMenu, только если isProjectPage === true */}
      {isProjectPage && (
        <SideMenu
          open={drawerOpen}
          drawerWidth={drawerWidth}
        />
      )}

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px', // отступ под высоту AppBar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
