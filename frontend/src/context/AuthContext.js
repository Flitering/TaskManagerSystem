import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const currentUser = AuthService.getCurrentUser();
    const role = AuthService.getUserRole();
    return currentUser ? { ...currentUser, role } : null;
  });

  useEffect(() => {
    // Здесь можно добавить проверку истечения токена или обновление токена
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};