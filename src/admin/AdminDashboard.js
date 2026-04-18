import { Link } from 'react-router-dom';
import { CiShoppingCart, CiUser, CiBoxList, CiSettings, CiBrightnessUp, CiMoneyBill, CiMail } from "react-icons/ci";
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to TechShop Admin Panel</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">
            <CiBoxList size={32} />
          </div>
          <h3>Products</h3>
          <p>Manage products, inventory, and categories</p>
          <Link to="/admin/products" className="card-link">Manage Products</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <CiShoppingCart size={32} />
          </div>
          <h3>Orders</h3>
          <p>View and manage customer orders</p>
          <Link to="/admin/orders" className="card-link">Manage Orders</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <CiUser size={32} />
          </div>
          <h3>Users</h3>
          <p>Manage customer accounts and permissions</p>
          <Link to="/admin/users" className="card-link">Manage Users</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <CiBrightnessUp size={32} />
          </div>
          <h3>Analytics</h3>
          <p>View sales reports and analytics</p>
          <Link to="/admin/analytics" className="card-link">View Analytics</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <CiMoneyBill size={32} />
          </div>
          <h3>Payments</h3>
          <p>Manage transactions and payment methods</p>
          <Link to="/admin/payments" className="card-link">Manage Payments</Link>
        </div>

        {/* <div className="dashboard-card">
          <div className="card-icon">
            <CiMail size={32} />
          </div>
          <h3>Messages</h3>
          <p>View and respond to customer messages</p>
          <Link to="/admin/messages" className="card-link">Manage Messages</Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">
            <CiSettings size={32} />
          </div>
          <h3>Settings</h3>
          <p>Configure store settings and preferences</p>
          <Link to="/admin/settings" className="card-link">Store Settings</Link>
        </div> */}
      </div>
    </div>
  );
}

export default AdminDashboard;
