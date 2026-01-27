import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    try {
      // Replace with your actual API endpoint
      const response = await api.post('/auth/login', credentials);
      let data = response.data;
      setToken(data.data.token);
      localStorage.setItem('token', data.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      // Replace with your actual API endpoint
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      token,
      isAuthenticated: !!token,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};