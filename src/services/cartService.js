import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CartService {
  // Get user's cart from database
  static async getCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { cart: [], totalItems: 0, totalPrice: 0 };
      }

      const response = await axios.get(`${API_BASE_URL}/users/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform database cart items to frontend format
        const transformedItems = response.data.data.cart.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images[0] || '',
          quantity: item.quantity,
          stock: item.product.stock
        }));
        
        return {
          cart: transformedItems,
          totalItems: response.data.data.totalItems,
          totalPrice: response.data.data.totalPrice
        };
      }
      return { cart: [], totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { cart: [], totalItems: 0, totalPrice: 0 };
    }
  }

  // Add item to cart
  static async addToCart(productId, quantity = 1) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        this.addToGuestCart(productId, quantity);
        return;
      }

      await axios.post(`${API_BASE_URL}/users/cart/add`, {
        productId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Dispatch event to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to localStorage if API fails
      this.addToGuestCart(productId, quantity);
    }
  }

  // Update cart item quantity
  static async updateQuantity(productId, quantity) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        this.updateGuestCartQuantity(productId, quantity);
        return;
      }

      await axios.put(`${API_BASE_URL}/users/cart/update`, {
        productId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Fallback to localStorage if API fails
      this.updateGuestCartQuantity(productId, quantity);
    }
  }

  // Remove item from cart
  static async removeFromCart(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        this.removeFromGuestCart(productId);
        return;
      }

      await axios.delete(`${API_BASE_URL}/users/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to localStorage if API fails
      this.removeFromGuestCart(productId);
    }
  }

  // Clear entire cart
  static async clearCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        return;
      }

      await axios.delete(`${API_BASE_URL}/users/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to localStorage if API fails
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  // Guest cart fallback methods (localStorage)
  static addToGuestCart(productId, quantity = 1) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      // For guest users, we need basic product info
      cart.push({ 
        id: productId, 
        quantity,
        // These will be populated when cart is viewed
        name: 'Product',
        price: 0,
        image: ''
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  static updateGuestCartQuantity(productId, quantity) {
    if (quantity < 1) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex >= 0) {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  static removeFromGuestCart(productId) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }

  // Get cart count for header
  static getCartCount() {
    const token = localStorage.getItem('token');
    if (token) {
      // For authenticated users, we'll need to fetch from API
      // For now, return 0 and let components fetch actual count
      return 0;
    } else {
      // For guest users, get from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
  }
}

export default CartService;
