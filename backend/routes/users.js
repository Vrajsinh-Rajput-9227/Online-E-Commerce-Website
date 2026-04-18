const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { validateAddress } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -cart -wishlist -addresses');
    
    res.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || ''
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zipCode } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        email,
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || ''
      },
      { new: true, runValidators: true }
    ).select('-password -cart -wishlist -addresses');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          zipCode: updatedUser.zipCode || ''
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   GET /api/users/cart
// @desc    Get user's cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price images stock isActive'
    });

    // Filter out inactive products and out of stock items
    const validCartItems = user.cart.filter(item => 
      item.product && item.product.isActive && item.product.stock > 0
    );

    res.json({
      success: true,
      data: {
        cart: validCartItems,
        totalItems: validCartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: validCartItems.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching cart'
    });
  }
});

// @route   POST /api/users/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/cart/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID and quantity are required'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if enough stock is available
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      user.cart.push({
        product: productId,
        quantity
      });
    }

    await user.save();

    // Return updated cart
    const updatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price images stock'
    });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: updatedUser.cart,
        totalItems: updatedUser.cart.reduce((sum, item) => sum + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to cart'
    });
  }
});

// @route   PUT /api/users/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/cart/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid product ID and quantity are required'
      });
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const user = await User.findById(req.user._id);

    // Find and update the cart item
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart[cartItemIndex].quantity = quantity;
    await user.save();

    res.json({
      success: true,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart'
    });
  }
});

// @route   DELETE /api/users/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    // Remove item from cart
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
});

// @route   DELETE /api/users/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/cart/clear', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { cart: [] }
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price images stock isActive category'
    });

    // Filter out inactive products
    const validWishlist = user.wishlist.filter(product => product.isActive);

    res.json({
      success: true,
      data: {
        wishlist: validWishlist
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching wishlist'
    });
  }
});

// @route   POST /api/users/wishlist/add/:productId
// @desc    Add item to wishlist
// @access  Private
router.post('/wishlist/add/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if product already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding product to wishlist'
    });
  }
});

// @route   DELETE /api/users/wishlist/remove/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/wishlist/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } }
    );

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing product from wishlist'
    });
  }
});

// @route   GET /api/users/addresses
// @desc    Get user's addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    
    res.json({
      success: true,
      data: {
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching addresses'
    });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, validateAddress, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: {
        address: user.addresses[user.addresses.length - 1]
      }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding address'
    });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', protect, validateAddress, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update address
    Object.assign(user.addresses[addressIndex], req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: {
        address: user.addresses[addressIndex]
      }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating address'
    });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params;

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } }
    );

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting address'
    });
  }
});

module.exports = router;
