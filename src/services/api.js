const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async adminLogin(credentials) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(userData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  // Product endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Cart endpoints
  async getCart() {
    return this.request('/users/cart');
  }

  async addToCart(productId, quantity = 1) {
    return this.request('/users/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCart(productId, quantity) {
    return this.request('/users/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async removeFromCart(productId) {
    return this.request(`/users/cart/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/users/cart/clear', {
      method: 'DELETE',
    });
  }

  // Wishlist endpoints
  async getWishlist() {
    return this.request('/users/wishlist');
  }

  async addToWishlist(productId) {
    return this.request(`/users/wishlist/add/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/users/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  }

  // Address endpoints
  async getAddresses() {
    return this.request('/users/addresses');
  }

  async addAddress(addressData) {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(addressId, addressData) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(addressId) {
    return this.request(`/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();
