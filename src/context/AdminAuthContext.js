import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/api';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved admin data and token in localStorage on component mount
    const savedToken = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('admin');
    
    if (savedToken && savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        setAdminToken(savedToken);
        setAdmin(adminData);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        adminLogout();
      }
    }
    setIsLoading(false);
  }, []);

  const adminLogin = async (credentials) => {
    try {
      const response = await apiService.adminLogin(credentials);
      
      if (response.success) {
        const { admin: adminData, token: adminTokenData } = response.data;
        setAdmin(adminData);
        setAdminToken(adminTokenData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        localStorage.setItem('adminToken', adminTokenData);
        return { success: true, admin: adminData };
      } else {
        throw new Error(response.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: error.message };
    }
  };

  const adminLogout = () => {
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
  };

  const updateAdminProfile = (updatedData) => {
    setAdmin(prevAdmin => ({
      ...prevAdmin,
      ...updatedData
    }));
    localStorage.setItem('admin', JSON.stringify({
      ...admin,
      ...updatedData
    }));
  };

  const value = {
    admin,
    adminToken,
    adminLogin,
    adminLogout,
    updateAdminProfile,
    isLoading,
    isAdminAuthenticated: !!admin && !!adminToken
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;
