import { useAdminAuth } from '../context/AdminAuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  CiGrid2H,
  CiBoxList,
  CiShoppingCart,
  CiUser,
  CiFileOn,
  CiMail,
  CiBellOn,
  CiCreditCard1,
  CiSettings,
  CiFolderOn,
  CiViewList
} from "react-icons/ci";
import './AdminSidebar.css';

function AdminSidebar() {
  const { admin } = useAdminAuth();
  const location = useLocation();

  // Get admin name for display
  const getAdminDisplayName = () => {
    if (admin?.firstName && admin?.lastName) {
      return `${admin.firstName} ${admin.lastName}`;
    }
    return admin?.name || admin?.username || 'Admin';
  };

  // Get profile image URL
  const getProfileImage = () => {
    if (admin?.profileImage) {
      return admin.profileImage;
    }
    // Generate avatar URL with name
    const name = getAdminDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d47a1&color=fff&size=60`;
  };

  const menuItems = [
    {
      path: '/admin',
      icon: CiGrid2H,
      label: 'Dashboard'
    },
    {
      path: '/admin/products',
      icon: CiBoxList,
      label: 'Products'
    },
    // {
    //   path: '/admin/categories',
    //   icon: CiFolderOn,
    //   label: 'Categories'
    // },
    {
      path: '/admin/orders',
      icon: CiShoppingCart,
      label: 'Orders'
    },
    {
      path: '/admin/payments',
      icon: CiCreditCard1,
      label: 'Payments'
    },
    {
      path: '/admin/customers',
      icon: CiUser,
      label: 'Customers'
    },
    {
      path: '/admin/analytics',
      icon: CiViewList,
      label: 'Analytics'
    }
    // {
    //   path: '/admin/inventory',
    //   icon: CiFileOn,
    //   label: 'Inventory'
    // },
    // {
    //   path: '/admin/messages',
    //   icon: CiMail,
    //   label: 'Messages'
    // },
    // {
    //   path: '/admin/notifications',
    //   icon: CiBellOn,
    //   label: 'Notifications'
    // }
    // {
    //   path: '/admin/settings',
    //   icon: CiSettings,
    //   label: 'Settings'
    // }
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  return (
    <div className="admin-sidebar">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="profile-avatar">
          <img 
            src={getProfileImage()} 
            alt={getAdminDisplayName()} 
            className="profile-image"
          />
        </div>
        <h3 className="profile-name">
          {getAdminDisplayName()}
        </h3>
        <p className="profile-title">E-Commerce Admin</p>
      </div>

      {/* Dashboard Navigation */}
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={index} className="n-nav-item">
                  <Link 
                    to={item.path}
                    className={`nav-link ${active ? 'active' : ''}`}
                  >
                    <div className="nav-icon">
                      <Icon size={20} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default AdminSidebar;
