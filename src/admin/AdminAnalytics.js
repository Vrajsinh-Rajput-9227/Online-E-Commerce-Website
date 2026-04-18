import { useState, useEffect } from 'react';
import { FaShoppingCart, FaUsers, FaBox, FaDollarSign, FaChartLine, FaCalendarAlt, FaDownload, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './AdminAnalytics.css';

// API configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      conversionRate: '0',
      revenueChange: '0',
      ordersChange: '0',
      avgOrderValue: 0
    },
    categoryData: [],
    topProducts: [],
    customerMetrics: [],
    salesData: []
  });

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch all analytics data in parallel
      const [overviewRes, categoryRes, topProductsRes, customerMetricsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE}/admin/analytics/overview?timeRange=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/analytics/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/analytics/top-products?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/analytics/customer-metrics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/analytics/sales?period=monthly`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Check if all responses are ok
      const responses = [overviewRes, categoryRes, topProductsRes, customerMetricsRes, salesRes];
      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // Parse all responses
      const [overviewData, categoryData, topProductsData, customerMetricsData, salesData] = await Promise.all([
        overviewRes.json(),
        categoryRes.json(),
        topProductsRes.json(),
        customerMetricsRes.json(),
        salesRes.json()
      ]);

      // Update state with fetched data
      setAnalyticsData({
        overview: overviewData.data.overview,
        categoryData: categoryData.data.categoryData,
        topProducts: topProductsData.data.topProducts,
        customerMetrics: customerMetricsData.data.customerMetrics,
        salesData: salesData.data.salesData
      });

    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-analytics loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-analytics error">
        <div className="error-message">
          <FaExclamationTriangle />
          <h3>Error loading analytics</h3>
          <p>{error}</p>
          <button onClick={fetchAnalyticsData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button onClick={handleExportReport} className="export-btn">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-icon revenue">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
            <span className={`card-change ${analyticsData.overview.revenueChange >= 0 ? 'positive' : 'negative'}`}>
              {analyticsData.overview.revenueChange >= 0 ? '+' : ''}{analyticsData.overview.revenueChange}%
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon orders">
            <FaShoppingCart />
          </div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{analyticsData.overview.totalOrders}</p>
            <span className={`card-change ${analyticsData.overview.ordersChange >= 0 ? 'positive' : 'negative'}`}>
              {analyticsData.overview.ordersChange >= 0 ? '+' : ''}{analyticsData.overview.ordersChange}%
            </span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon customers">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Total Customers</h3>
            <p className="card-value">{analyticsData.overview.totalCustomers}</p>
            <span className="card-change neutral">Active customers</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon conversion">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Conversion Rate</h3>
            <p className="card-value">{analyticsData.overview.conversionRate}%</p>
            <span className="card-change neutral">Avg order: {formatCurrency(analyticsData.overview.avgOrderValue)}</span>
          </div>
        </div>
      </div>

      <div className="data-tables-grid">
        <div className="table-container">
          <h3>Sales Overview</h3>
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.salesData.slice(0, 6).reverse().map((sale, index) => (
                  <tr key={index}>
                    <td>{new Date(sale._id.year, sale._id.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</td>
                    <td>{formatCurrency(sale.revenue)}</td>
                    <td>{sale.orders}</td>
                    <td>{formatCurrency(sale.avgOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-container">
          <h3>Category Distribution</h3>
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Revenue Share</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.categoryData.map((category, index) => (
                  <tr key={index}>
                    <td>{category.name}</td>
                    <td>{category.value}%</td>
                    <td>{formatCurrency(category.revenue)}</td>
                    <td>{category.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-container">
          <h3>Top Products</h3>
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.sales}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-container">
          <h3>Customer Growth</h3>
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>New Customers</th>
                  <th>Returning Customers</th>
                  <th>Total Growth</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.customerMetrics.slice(0, 6).reverse().map((metric, index) => (
                  <tr key={index}>
                    <td>{metric.month}</td>
                    <td>{metric.newCustomers}</td>
                    <td>{metric.returningCustomers}</td>
                    <td>{metric.newCustomers + metric.returningCustomers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="additional-metrics">
        <div className="metric-card">
          <h3>Average Order Value</h3>
          <p className="metric-value">{formatCurrency(analyticsData.overview.avgOrderValue)}</p>
          <span className="metric-change neutral">Current period</span>
        </div>
        <div className="metric-card">
          <h3>Customer Lifetime Value</h3>
          <p className="metric-value">{formatCurrency(analyticsData.overview.totalCustomers > 0 ? analyticsData.overview.totalRevenue / analyticsData.overview.totalCustomers : 0)}</p>
          <span className="metric-change neutral">Estimated</span>
        </div>
        <div className="metric-card">
          <h3>Revenue per Order</h3>
          <p className="metric-value">{formatCurrency(analyticsData.overview.totalOrders > 0 ? analyticsData.overview.totalRevenue / analyticsData.overview.totalOrders : 0)}</p>
          <span className="metric-change neutral">Current period</span>
        </div>
        <div className="metric-card">
          <h3>Active Categories</h3>
          <p className="metric-value">{analyticsData.categoryData.length}</p>
          <span className="metric-change neutral">With sales</span>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
