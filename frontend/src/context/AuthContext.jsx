import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hostel_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('hostel_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hostel_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
          localStorage.setItem('hostel_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: userData } = res.data;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('hostel_token', newToken);
    localStorage.setItem('hostel_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { token: newToken, user: userData } = res.data;

    setToken(newToken);
    setUser(userData);

    localStorage.setItem('hostel_token', newToken);
    localStorage.setItem('hostel_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hostel_token');
    localStorage.removeItem('hostel_user');
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    const updated = { ...user, ...res.data.user };
    setUser(updated);
    localStorage.setItem('hostel_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
