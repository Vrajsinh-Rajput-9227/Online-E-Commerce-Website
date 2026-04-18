import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class WishlistService {
  // Get user's wishlist from database
  static async getWishlist() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { wishlist: [] };
      }

      const response = await axios.get(`${API_BASE_URL}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Transform database wishlist items to frontend format
        const transformedItems = response.data.data.wishlist.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          image: item.images[0] || '',
          category: item.category,
          stock: item.stock,
          isActive: item.isActive
        }));
        
        return { wishlist: transformedItems };
      }
      return { wishlist: [] };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return { wishlist: [] };
    }
  }

  // Add item to wishlist
  static async addToWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        this.addToGuestWishlist(productId);
        return;
      }

      await axios.post(`${API_BASE_URL}/users/wishlist/add/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Dispatch event to update wishlist count
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to localStorage if API fails
      this.addToGuestWishlist(productId);
    }
  }

  // Remove item from wishlist
  static async removeFromWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Fallback to localStorage for guest users
        this.removeFromGuestWishlist(productId);
        return;
      }

      await axios.delete(`${API_BASE_URL}/users/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to localStorage if API fails
      this.removeFromGuestWishlist(productId);
    }
  }

  // Check if product is in wishlist
  static async isInWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // For guest users, check localStorage
        return this.isInGuestWishlist(productId);
      }

      const wishlistData = await this.getWishlist();
      return wishlistData.wishlist.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      // Fallback to localStorage
      return this.isInGuestWishlist(productId);
    }
  }

  // Toggle wishlist status
  static async toggleWishlist(productId) {
    try {
      const inWishlist = await this.isInWishlist(productId);
      
      if (inWishlist) {
        await this.removeFromWishlist(productId);
        return false;
      } else {
        await this.addToWishlist(productId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  }

  // Guest wishlist fallback methods (localStorage)
  static addToGuestWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!wishlist.some(item => item.id === productId)) {
      // For guest users, we need basic product info
      wishlist.push({ 
        id: productId,
        // These will be populated when wishlist is viewed
        name: 'Product',
        price: 0,
        image: '',
        category: '',
        stock: 0,
        isActive: true
      });
      
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }

  static removeFromGuestWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
  }

  static isInGuestWishlist(productId) {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some(item => item.id === productId);
  }

  // Get wishlist count for header
  static getWishlistCount() {
    const token = localStorage.getItem('token');
    if (token) {
      // For authenticated users, we'll need to fetch from API
      // For now, return 0 and let components fetch actual count
      return 0;
    } else {
      // For guest users, get from localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.length;
    }
  }

  // Clear entire wishlist (for guest users)
  static clearGuestWishlist() {
    localStorage.removeItem('wishlist');
    window.dispatchEvent(new Event('wishlistUpdated'));
  }
}

export default WishlistService;
