import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user data and token in localStorage on component mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        
        // For admin users, we don't need to verify with profile endpoint
        // For regular users, verify token is still valid by fetching profile
        if (!userData.isAdmin) {
          apiService.getProfile()
            .then(response => {
              if (response.success) {
                setUser(response.data.user);
              } else {
                // Token invalid, clear storage
                logout();
              }
            })
            .catch(() => {
              // Token invalid, clear storage
              logout();
            });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        // Registration successful but don't auto-login
        // Just return success, let user login manually
        return { success: true, message: 'Registration successful' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
