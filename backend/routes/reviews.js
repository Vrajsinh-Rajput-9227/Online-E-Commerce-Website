const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews'
    });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews by a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ user: req.params.userId })
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ user: req.params.userId });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalReviews: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user reviews'
    });
  }
});

// @route   POST /api/reviews/product/:productId
// @desc    Add a review to a product
// @access  Private
router.post('/product/:productId', protect, validateReview, async (req, res) => {
  try {
    console.log('🔍 Review submission request:', {
      body: req.body,
      params: req.params,
      user: req.user?._id
    });

    const { rating, comment, title } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product found:', product.name);

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: userId, product: productId });
    console.log('🔍 Existing review check:', existingReview ? 'Found existing review' : 'No existing review');

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.title = title;
      await existingReview.save();

      console.log('✅ Review updated successfully');
      res.json({
        success: true,
        message: 'Review updated successfully',
        data: {
          review: await existingReview.populate('user', 'name')
        }
      });
    } else {
      // Create new review
      console.log('🔍 Creating new review with data:', { userId, productId, rating, comment, title });
      
      const review = new Review({
        user: userId,
        product: productId,
        rating,
        comment,
        title,
        isVerifiedPurchase: true // All authenticated users are verified
      });

      await review.save();
      console.log('✅ New review saved successfully');

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: {
          review: await review.populate('user', 'name')
        }
      });
    }
  } catch (error) {
    console.error('❌ Add review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error adding review',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update a review
// @access  Private (review owner only)
router.put('/:reviewId', protect, validateReview, async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const reviewId = req.params.reviewId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the owner of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review.rating = rating;
    review.comment = comment;
    review.title = title;
    await review.save();

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: await review.populate('user', 'name')
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review'
    });
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete a review
// @access  Private (review owner or admin)
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the owner of the review or an admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review'
    });
  }
});

module.exports = router;
