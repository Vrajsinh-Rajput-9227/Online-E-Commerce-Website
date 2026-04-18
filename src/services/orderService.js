import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Order service functions
export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's orders with pagination
  getUserOrders: async (page = 1, limit = 10, status = '') => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel an order
  cancelOrder: async (orderId, cancellationReason) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { cancellationReason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's order statistics
  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Track order by order number (public endpoint)
  trackOrderByNumber: async (orderNumber) => {
    try {
      const response = await api.get(`/orders/track/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export { api };
export default orderService;
