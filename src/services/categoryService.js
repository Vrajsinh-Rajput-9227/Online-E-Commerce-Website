const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CategoryService {
  // Get authentication token
  getAuthHeader() {
    const token = localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Handle API errors
  handleError(error) {
    console.error('Category Service Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }

  // Get all categories
  async getCategories(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/categories${queryString ? `?${queryString}` : ''}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Toggle category status
  async toggleStatus(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Toggle category featured status
  async toggleFeatured(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get category statistics
  async getCategoryStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update all product counts
  async updateAllProductCounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/update-counts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default new CategoryService();
