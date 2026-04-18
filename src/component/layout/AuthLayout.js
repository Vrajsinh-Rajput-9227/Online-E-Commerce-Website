import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../pages/Auth/Auth.css'; // Updated import path

const AuthLayout = () => {
  return (
    <div className="auth-layout min-vh-100 d-flex align-items-center">
      <div className="w-100">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;