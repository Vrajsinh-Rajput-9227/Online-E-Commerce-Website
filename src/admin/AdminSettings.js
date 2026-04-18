import React, { useState, useEffect } from 'react';
import { FiSave, FiSettings, FiBell, FiLock, FiDatabase, FiMail, FiGlobe, FiCreditCard, FiPackage, FiUsers, FiShield, FiInfo } from 'react-icons/fi';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    storeName: 'TechShop',
    storeEmail: 'admin@techshop.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Tech Street, Silicon Valley, CA 94000',
    currency: 'USD',
    timezone: 'America/New_York',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    customerNotifications: true,
    inventoryAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordMinLength: '8',
    requireStrongPassword: true,
    
    // Payment Settings
    enableStripe: true,
    enablePayPal: true,
    enableCOD: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalClientId: '',
    paypalSecret: '',
    
    // Shipping Settings
    freeShippingThreshold: '0',
    standardShippingCost: '0',
    expressShippingCost: '0',
    internationalShipping: true,
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    emailFrom: 'noreply@techshop.com',
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30',
    
    // API Settings
    enableApi: false,
    apiKey: '',
    apiRateLimit: '1000'
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'payment', label: 'Payment', icon: FiCreditCard },
    { id: 'shipping', label: 'Shipping', icon: FiPackage },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'advanced', label: 'Advanced', icon: FiShield }
  ];

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo purposes
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      window.location.reload();
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>Store Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Store Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Store Email</label>
          <input
            type="email"
            value={settings.storeEmail}
            onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Store Phone</label>
          <input
            type="tel"
            value={settings.storePhone}
            onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Store Address</label>
          <input
            type="text"
            value={settings.storeAddress}
            onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Kolkata">India</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
          />
          <span>Email Notifications</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
          />
          <span>SMS Notifications</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.orderNotifications}
            onChange={(e) => handleInputChange('notifications', 'orderNotifications', e.target.checked)}
          />
          <span>Order Notifications</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.customerNotifications}
            onChange={(e) => handleInputChange('notifications', 'customerNotifications', e.target.checked)}
          />
          <span>Customer Notifications</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.inventoryAlerts}
            onChange={(e) => handleInputChange('notifications', 'inventoryAlerts', e.target.checked)}
          />
          <span>Inventory Alerts</span>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security Configuration</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Minimum Password Length</label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => handleInputChange('security', 'passwordMinLength', e.target.value)}
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.twoFactorAuth}
            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
          />
          <span>Two-Factor Authentication</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.requireStrongPassword}
            onChange={(e) => handleInputChange('security', 'requireStrongPassword', e.target.checked)}
          />
          <span>Require Strong Passwords</span>
        </label>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="settings-section">
      <h3>Payment Methods</h3>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableStripe}
            onChange={(e) => handleInputChange('payment', 'enableStripe', e.target.checked)}
          />
          <span>Enable Stripe</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enablePayPal}
            onChange={(e) => handleInputChange('payment', 'enablePayPal', e.target.checked)}
          />
          <span>Enable PayPal</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableCOD}
            onChange={(e) => handleInputChange('payment', 'enableCOD', e.target.checked)}
          />
          <span>Enable Cash on Delivery</span>
        </label>
      </div>
      
      {settings.enableStripe && (
        <div className="form-grid">
          <div className="form-group">
            <label>Stripe Public Key</label>
            <input
              type="text"
              value={settings.stripePublicKey}
              onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)}
              placeholder="pk_test_..."
            />
          </div>
          <div className="form-group">
            <label>Stripe Secret Key</label>
            <input
              type="password"
              value={settings.stripeSecretKey}
              onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderShippingSettings = () => (
    <div className="settings-section">
      <h3>Shipping Configuration</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Free Shipping Threshold ($)</label>
          <input
            type="number"
            value={settings.freeShippingThreshold}
            onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Standard Shipping Cost ($)</label>
          <input
            type="number"
            value={settings.standardShippingCost}
            onChange={(e) => handleInputChange('shipping', 'standardShippingCost', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Express Shipping Cost ($)</label>
          <input
            type="number"
            value={settings.expressShippingCost}
            onChange={(e) => handleInputChange('shipping', 'expressShippingCost', e.target.value)}
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.internationalShipping}
            onChange={(e) => handleInputChange('shipping', 'internationalShipping', e.target.checked)}
          />
          <span>Enable International Shipping</span>
        </label>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="settings-section">
      <h3>SMTP Configuration</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>SMTP Host</label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>SMTP Port</label>
          <input
            type="text"
            value={settings.smtpPort}
            onChange={(e) => handleInputChange('email', 'smtpPort', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>SMTP Username</label>
          <input
            type="text"
            value={settings.smtpUsername}
            onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>SMTP Password</label>
          <input
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>From Email</label>
          <input
            type="email"
            value={settings.emailFrom}
            onChange={(e) => handleInputChange('email', 'emailFrom', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="settings-section">
      <h3>Backup Settings</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleInputChange('advanced', 'backupFrequency', e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Backup Retention (days)</label>
          <input
            type="number"
            value={settings.backupRetention}
            onChange={(e) => handleInputChange('advanced', 'backupRetention', e.target.value)}
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.autoBackup}
            onChange={(e) => handleInputChange('advanced', 'autoBackup', e.target.checked)}
          />
          <span>Enable Automatic Backup</span>
        </label>
      </div>
      
      <h3>API Settings</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>API Rate Limit (requests/hour)</label>
          <input
            type="number"
            value={settings.apiRateLimit}
            onChange={(e) => handleInputChange('advanced', 'apiRateLimit', e.target.value)}
          />
        </div>
      </div>
      <div className="checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.enableApi}
            onChange={(e) => handleInputChange('advanced', 'enableApi', e.target.checked)}
          />
          <span>Enable API Access</span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'payment':
        return renderPaymentSettings();
      case 'shipping':
        return renderShippingSettings();
      case 'email':
        return renderEmailSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h1>Admin Settings</h1>
        <p>Configure your store settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-content">
          {renderTabContent()}
          
          <div className="settings-actions">
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              <FiSave size={16} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              className="reset-btn"
              onClick={handleReset}
            >
              Reset to Default
            </button>
          </div>

          {saveStatus && (
            <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
