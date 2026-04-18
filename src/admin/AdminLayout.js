import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLayout.css';

function AdminLayout({ children }) {
  const { admin, adminToken, isLoading } = useAdminAuth();

  if (isLoading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!admin || !adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-wrapper">
        <AdminHeader />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
