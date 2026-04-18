import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ProductManager {
  constructor() {
    // Constructor no longer clears local data automatically
    console.log('ProductManager initialized');
    
    // Backup authentication data on initialization
    this.backupAuthData();
  }

  // Backup authentication data to prevent loss
  backupAuthData() {
    // Backup admin tokens first
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (adminToken && admin) {
      sessionStorage.setItem('adminToken', adminToken);
      sessionStorage.setItem('admin', admin);
      console.log('🔄 ProductManager: Admin authentication data backed up to sessionStorage');
    }
    
    // Backup regular user tokens
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // Store backup in sessionStorage as well
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('authUser', user);
      console.log('🔄 ProductManager: User authentication data backed up to sessionStorage');
    }
  }

  // Restore authentication from multiple sources
  restoreAuthFromMultipleSources() {
    // Check for admin tokens first
    let adminToken = localStorage.getItem('adminToken');
    let admin = localStorage.getItem('admin');
    
    // If no admin tokens, check for regular user tokens
    let token = adminToken || localStorage.getItem('token');
    let user = admin || localStorage.getItem('user');
    
    // If not in localStorage, try sessionStorage
    if (!token || !user) {
      // Try admin tokens from sessionStorage first
      adminToken = sessionStorage.getItem('adminToken');
      admin = sessionStorage.getItem('admin');
      
      if (adminToken && admin) {
        localStorage.setItem('adminToken', adminToken);
        localStorage.setItem('admin', admin);
        console.log('🔄 ProductManager: Admin authentication restored from sessionStorage');
        return true;
      }
      
      // Then try regular user tokens from sessionStorage
      token = sessionStorage.getItem('authToken');
      user = sessionStorage.getItem('authUser');
      
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);
        console.log('🔄 ProductManager: User authentication restored from sessionStorage');
      }
    }
    
    return !!(token && user);
  }

  // Manually restore authentication from localStorage
  restoreAuth() {
    // Check for admin tokens first
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (adminToken && admin) {
      console.log('🔄 ProductManager: Restoring admin authentication from localStorage');
      return true;
    }
    
    // Check for regular user tokens
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('🔄 ProductManager: Restoring user authentication from localStorage');
      return true;
    } else {
      console.log('❌ ProductManager: No authentication data found in localStorage');
      return false;
    }
  }

  // Force backup authentication data (call this after successful login)
  forceBackupAuth() {
    // Backup admin tokens first
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (adminToken && admin) {
      sessionStorage.setItem('adminToken', adminToken);
      sessionStorage.setItem('admin', admin);
      console.log('🔄 ProductManager: Admin authentication data forcefully backed up to sessionStorage');
      return true;
    }
    
    // Backup regular user tokens
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('authUser', user);
      console.log('🔄 ProductManager: User authentication data forcefully backed up to sessionStorage');
      return true;
    } else {
      console.log('❌ ProductManager: No authentication data to backup');
      return false;
    }
  }

  // Check authentication status
  isAuthenticated() {
    // Check for admin tokens first
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    
    if (adminToken && admin) {
      return true;
    }
    
    // Check for regular user tokens
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Clear only non-authentication data
  clearNonAuthData() {
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('wishlist');
    console.log('Non-authentication data cleared');
  }

  // Clear all local storage data (except authentication)
  clearAllLocalData() {
    // Preserve authentication data (both admin and user)
    const adminToken = localStorage.getItem('adminToken');
    const admin = localStorage.getItem('admin');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    localStorage.removeItem('adminProducts');
    localStorage.removeItem('wishlist');
    
    // Restore authentication data
    if (adminToken) localStorage.setItem('adminToken', adminToken);
    if (admin) localStorage.setItem('admin', admin);
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', user);
    
    console.log('Local data cleared (preserving authentication)');
  }

  // Get authorization header
  getAuthHeader() {
    // Check for admin token first (for admin operations)
    let adminToken = localStorage.getItem('adminToken');
    let admin = localStorage.getItem('admin');
    
    // If no admin token, check for regular user token
    let token = adminToken || localStorage.getItem('token');
    let user = admin || localStorage.getItem('user');
    
    console.log('🔍 ProductManager.getAuthHeader() debug:');
    console.log('  - Admin token exists in localStorage:', !!adminToken);
    console.log('  - Admin exists in localStorage:', !!admin);
    console.log('  - User token exists in localStorage:', !!localStorage.getItem('token'));
    console.log('  - User exists in localStorage:', !!localStorage.getItem('user'));
    console.log('  - Using token type:', adminToken ? 'admin' : 'user');
    
    // If no token in localStorage, try to restore from multiple sources
    if (!token || !user) {
      console.log('⚠️ ProductManager: Missing auth data, attempting restoration...');
      this.restoreAuthFromMultipleSources();
      
      // Try again after restoration
      adminToken = localStorage.getItem('adminToken');
      admin = localStorage.getItem('admin');
      token = adminToken || localStorage.getItem('token');
      user = admin || localStorage.getItem('user');
      
      console.log('🔄 ProductManager: After restoration - Token exists:', !!token, 'User exists:', !!user);
    }
    
    if (token) {
      console.log('🔑 ProductManager: Token found:', token.substring(0, 50) + '...');
      
      if (user) {
        try {
          const userData = JSON.parse(user);
          console.log('👤 ProductManager: User data:', userData);
          console.log('👤 ProductManager: Is admin?', !!userData.isAdmin);
        } catch (e) {
          console.error('❌ ProductManager: Error parsing user data:', e);
        }
      }
      
      // Backup the token for future use
      this.backupAuthData();
      
      return { Authorization: `Bearer ${token}` };
    } else {
      console.log('⚠️ ProductManager: No token found anywhere!');
      console.log('⚠️ ProductManager: Available localStorage keys:', Object.keys(localStorage));
      console.log('⚠️ ProductManager: Available sessionStorage keys:', Object.keys(sessionStorage));
      return {};
    }
  }

  // Transform product data for frontend
  transformProduct(product) {
    // Helper function to get value from specifications (handles plain objects)
    const getSpecValue = (specs, key) => {
      if (!specs || typeof specs !== 'object') return '';
      return specs[key] || '';
    };

    return {
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      originalPrice: product.discount?.percentage ? 
        product.price / (1 - product.discount.percentage / 100) : product.price,
      discount: product.discount?.percentage || 0,
      rating: product.rating?.average || 0,
      reviews: product.rating?.count || 0,
      image: product.images?.[0] || '',
      tags: product.tags || [],
      description: product.description,
      additionalImages: product.images?.slice(1) || [],
      color: getSpecValue(product.specifications, 'Color') ? 
        [getSpecValue(product.specifications, 'Color')] : [],
      brand: product.brand,
      model: getSpecValue(product.specifications, 'Model'),
      material: getSpecValue(product.specifications, 'Material'),
      dimensions: getSpecValue(product.specifications, 'Dimensions'),
      weight: getSpecValue(product.specifications, 'Weight'),
      warranty: getSpecValue(product.specifications, 'Warranty') || '1 Year',
      sku: getSpecValue(product.specifications, 'SKU'),
      releaseDate: getSpecValue(product.specifications, 'Release Date'),
      manufacturer: getSpecValue(product.specifications, 'Manufacturer'),
      origin: getSpecValue(product.specifications, 'Origin'),
      asin: getSpecValue(product.specifications, 'ASIN'),
      stock: product.stock || 0,
      featured: product.featured || false,
      isActive: product.isActive !== false
    };
  }

  // Transform product data for backend
  transformForBackend(product) {
    const specifications = {};
    
    if (product.color) specifications['Color'] = Array.isArray(product.color) ? product.color[0] : product.color;
    if (product.model) specifications['Model'] = product.model;
    if (product.material) specifications['Material'] = product.material;
    if (product.dimensions) specifications['Dimensions'] = product.dimensions;
    if (product.weight) specifications['Weight'] = product.weight;
    if (product.warranty) specifications['Warranty'] = product.warranty;
    if (product.sku) specifications['SKU'] = product.sku;
    if (product.releaseDate) specifications['Release Date'] = product.releaseDate;
    if (product.manufacturer) specifications['Manufacturer'] = product.manufacturer;
    if (product.origin) specifications['Origin'] = product.origin;
    if (product.asin) specifications['ASIN'] = product.asin;

    const allImages = [];
    if (product.image) allImages.push(product.image);
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      allImages.push(...product.additionalImages.filter(img => img !== product.image));
    }

    return {
      name: product.name,
      description: product.description || 'No description available',
      price: parseFloat(product.price),
      category: product.category || undefined,
      brand: product.brand,
      images: allImages.length > 0 ? allImages : ['placeholder.jpg'],
      specifications,
      stock: parseInt(product.stock) || 10, // Default stock if not provided
      featured: product.featured || false,
      tags: product.tags || [],
      discount: product.discount > 0 ? {
        percentage: parseInt(product.discount),
        validUntil: null
      } : undefined
    };
  }

  async getAllProducts() {
    try {
      console.log('🔄 Fetching products from API:', API_BASE_URL + '/products');
      const response = await axios.get(`${API_BASE_URL}/products`, {
        timeout: 5000
      });
      
      console.log('✅ API Response:', response.data);
      
      if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
        const products = response.data.data.products.map(product => this.transformProduct(product));
        console.log('✅ Transformed products:', products.length, 'items');
        return products;
      } else {
        console.warn('⚠️ Invalid products response:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      if (error.code === 'ECONNABORTED') {
        console.warn('⏰ Request timeout, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getAllProducts();
      }
      console.error('❌ API Error details:', error.message);
      return [];
    }
  }

  async getProductById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return this.transformProduct(response.data.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  async addProduct(product) {
    try {
      console.log('🔍 Adding product...');
      
      // Try to restore authentication from multiple sources first
      if (!this.isAuthenticated()) {
        console.log('⚠️ ProductManager: Not authenticated, attempting multi-source restoration...');
        this.restoreAuthFromMultipleSources();
      }
      
      const authHeader = this.getAuthHeader();
      
      // Check if token exists before making request
      if (!authHeader.Authorization) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('🔍 Auth header for product creation:', authHeader.Authorization.substring(0, 50) + '...');
      
      const backendProduct = this.transformForBackend(product);
      console.log('🔍 Product data being sent:', backendProduct);
      
      const response = await axios.post(
        `${API_BASE_URL}/products`,
        backendProduct,
        { headers: authHeader }
      );
      
      console.log('✅ Product creation response:', response.data);
      
      // Backup authentication after successful request
      this.backupAuthData();
      
      return this.transformProduct(response.data.data.product);
    } catch (error) {
      console.error('❌ Error adding product:', error);
      
      if (error.response) {
        console.error('❌ Server response error:', error.response.data);
        console.error('❌ Response status:', error.response.status);
        
        // Handle specific authentication errors
        if (error.response.status === 401) {
          if (error.response.data.message?.includes('No token provided')) {
            // Try to restore authentication and retry once
            console.log('🔄 ProductManager: Auth failed, attempting restoration and retry...');
            if (this.restoreAuthFromMultipleSources()) {
              const authHeader = this.getAuthHeader();
              if (authHeader.Authorization) {
                console.log('🔄 ProductManager: Retrying product creation with restored auth...');
                const backendProduct = this.transformForBackend(product);
                const retryResponse = await axios.post(
                  `${API_BASE_URL}/products`,
                  backendProduct,
                  { headers: authHeader }
                );
                console.log('✅ Product creation successful on retry:', retryResponse.data);
                return this.transformProduct(retryResponse.data.data.product);
              }
            }
            throw new Error('Authentication lost. Please log in again.');
          } else if (error.response.data.message?.includes('Token expired')) {
            throw new Error('Session expired. Please log in again.');
          }
        }
      } else if (error.request) {
        console.error('❌ Network error - no response received');
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  async updateProduct(id, updatedProduct) {
    try {
      console.log('=== UPDATE PRODUCT DEBUG ===');
      console.log('Original product data:', updatedProduct);
      const backendProduct = this.transformForBackend(updatedProduct);
      console.log('Transformed backend product:', backendProduct);
      console.log('Category being sent:', backendProduct.category);
      console.log('============================');
      
      const response = await axios.put(
        `${API_BASE_URL}/products/${id}`,
        backendProduct,
        { headers: this.getAuthHeader() }
      );
      return this.transformProduct(response.data.data.product);
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await axios.delete(
        `${API_BASE_URL}/products/${id}`,
        { headers: this.getAuthHeader() }
      );
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { search: query }
      });
      return response.data.data.products.map(product => this.transformProduct(product));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getFilteredProducts(filters = {}) {
    try {
      const params = {};
      
      if (filters.brand && filters.brand !== 'all') {
        params.brand = filters.brand;
      }
      
      if (filters.minPrice) {
        params.minPrice = filters.minPrice;
      }
      
      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice;
      }
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder || 'desc';
      }

      const response = await axios.get(`${API_BASE_URL}/products`, { params });
      return response.data.data.products.map(product => this.transformProduct(product));
    } catch (error) {
      console.error('Error fetching filtered products:', error);
      return [];
    }
  }

  async getReviewsByProduct(productId, page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`, {
        params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc' }
      });
      
      if (response.data?.success) {
        return {
          reviews: response.data.data.reviews,
          pagination: response.data.data.pagination
        };
      } else {
        console.warn('⚠️ Invalid reviews response:', response.data);
        return { reviews: [], pagination: null };
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return { reviews: [], pagination: null };
    }
  }
}

const productManager = new ProductManager();
export default productManager;
