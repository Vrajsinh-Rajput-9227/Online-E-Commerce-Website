const express = require('express');
const Product = require('../models/Product');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { validateProductCreation, validateProductUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (featured === 'true') query.featured = true;

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalProducts: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin only)
router.post('/', protect, admin, validateProductCreation, async (req, res) => {
  try {
    // Handle images transformation
    let productData = { ...req.body };
    
    // Ensure images array exists
    if (!productData.images || productData.images.length === 0) {
      productData.images = ['placeholder.jpg'];
    }
    
    // Handle specifications Map conversion
    if (productData.specifications && typeof productData.specifications === 'object') {
      if (!(productData.specifications instanceof Map)) {
        // Convert plain object to Map, then to plain object for MongoDB storage
        const specMap = new Map(Object.entries(productData.specifications));
        productData.specifications = Object.fromEntries(specMap);
      } else {
        // Convert Map to plain object for MongoDB storage
        productData.specifications = Object.fromEntries(productData.specifications);
      }
    }
    
    const product = await Product.create(productData);
    
    console.log('✅ Product created successfully:', {
      id: product._id,
      name: product.name,
      specsCount: Object.keys(product.specifications || {}).length,
      specifications: product.specifications,
      imageCount: product.images?.length || 0,
      category: product.category,
      brand: product.brand
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', protect, admin, validateProductUpdate, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (hard delete)
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('🗑️ Product permanently deleted from database:', product.name);
    
    res.json({
      success: true,
      message: 'Product permanently deleted from database',
      data: {
        deletedProduct: product
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');

    res.json({
      success: true,
      data: {
        categories,
        brands
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true, isActive: true })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products'
    });
  }
});

module.exports = router;
