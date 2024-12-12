import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Синий цвет
    },
    secondary: {
      main: '#dc004e', // Розовый цвет
    },
    background: {
      default: '#f4f6f8', // Светлый фон
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
