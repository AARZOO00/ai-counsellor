import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // App start hone par user load karo
  // Load or refresh user whenever token changes
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      if (token) {
        try {
          const { data } = await authAPI.loadUser();
          setUser(data);
        } catch (error) {
          console.error("Load User Failed:", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Login Function
  const login = async (credentials) => {
    try {
      console.log('🔐 Logging in...');
      const response = await authAPI.login(credentials);
      
      const { token: newToken, ...userData } = response.data;

      // Save Token & User
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      console.log('✅ Login Success!');
      return { success: true };
    } catch (error) {
      console.error('❌ Login Failed:', error.response?.data?.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Server Error' 
      };
    }
  };

  // Register Function
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, ...newUserData } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUserData);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration Failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  // Refresh user data from server (useful after profile updates)
  const refreshUser = async () => {
    if (!token) return null;
    try {
      const { data } = await authAPI.loadUser();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Refresh user failed', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, loading, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;