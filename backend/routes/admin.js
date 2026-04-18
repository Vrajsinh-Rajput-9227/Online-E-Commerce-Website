const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get basic stats
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    
    // Get revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                '$total',
                0
              ]
            }
          }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .select('orderNumber total orderStatus createdAt user');

    // Get top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalUsers,
          totalOrders,
          totalRevenue: revenueStats[0]?.totalRevenue || 0,
          thisMonthRevenue: revenueStats[0]?.thisMonth || 0
        },
        recentOrders,
        topProducts,
        orderStatusBreakdown: orderStatusBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Private (Admin only)
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.orderStatus = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images')
      .select('orderNumber total orderStatus paymentStatus createdAt user trackingNumber items shippingAddress paymentMethod');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalOrders: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get single order details (admin view)
// @access  Private (Admin only)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone addresses')
      .populate('items.product', 'name images specifications');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get admin order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.orderStatus].includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.orderStatus} to ${orderStatus}`
      });
    }

    // Update order
    order.orderStatus = orderStatus;
    
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    
    if (orderStatus === 'delivered') {
      order.actualDelivery = new Date();
      order.paymentStatus = 'completed';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin view)
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('name email role phone isActive createdAt addresses');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalUsers: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

// @route   GET /api/admin/users/:id/order-stats
// @desc    Get order statistics for a specific user
// @access  Private (Admin only)
router.get('/users/:id/order-stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all orders for this user
    const Order = require('../models/Order');
    const orders = await Order.find({ user: id })
      .select('total createdAt status')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        lastOrderDate
      }
    });
  } catch (error) {
    console.error('Get user order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user order statistics'
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user (customer)
// @access  Private (Admin only)
router.post('/users', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user' } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password,
      role
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toJSON();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
});

// @route   GET /api/admin/products/low-stock
// @desc    Get products with low stock
// @access  Private (Admin only)
router.get('/products/low-stock', async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.find({
      isActive: true,
      stock: { $lte: parseInt(threshold) }
    })
    .sort({ stock: 1 })
    .select('name brand category stock price images');

    res.json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching low stock products'
    });
  }
});

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics
// @access  Private (Admin only)
router.get('/analytics/sales', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'yearly':
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
    }

    const salesData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        period
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales analytics'
    });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get overview analytics for dashboard
// @access  Private (Admin only)
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total revenue and orders in time range
    const revenueStats = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // Get total customers (unique users who placed orders)
    const customerStats = await Order.distinct('user', {
      createdAt: { $gte: startDate },
      orderStatus: { $ne: 'cancelled' }
    });

    // Get previous period data for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    
    const previousStats = await Order.aggregate([
      { 
        $match: { 
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Calculate conversion rate (orders / unique users * 100)
    const totalUsers = await User.countDocuments({ isActive: true });
    const conversionRate = totalUsers > 0 ? (customerStats.length / totalUsers * 100) : 0;

    const currentRevenue = revenueStats[0]?.totalRevenue || 0;
    const currentOrders = revenueStats[0]?.totalOrders || 0;
    const previousRevenue = previousStats[0]?.totalRevenue || 0;
    const previousOrders = previousStats[0]?.totalOrders || 0;

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 0;
    const ordersChange = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: currentRevenue,
          totalOrders: currentOrders,
          totalCustomers: customerStats.length,
          conversionRate: conversionRate.toFixed(1),
          revenueChange: revenueChange.toFixed(1),
          ordersChange: ordersChange.toFixed(1),
          avgOrderValue: revenueStats[0]?.avgOrderValue || 0
        }
      }
    });
  } catch (error) {
    console.error('Get overview analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching overview analytics'
    });
  }
});

// @route   GET /api/admin/analytics/categories
// @desc    Get category distribution analytics
// @access  Private (Admin only)
router.get('/analytics/categories', async (req, res) => {
  try {
    const categoryData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.subtotal' },
          orders: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);
    
    const formattedData = categoryData.map(cat => ({
      name: cat._id || 'Uncategorized',
      value: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0,
      revenue: cat.revenue,
      orders: cat.orders
    }));

    res.json({
      success: true,
      data: {
        categoryData: formattedData
      }
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching category analytics'
    });
  }
});

// @route   GET /api/admin/analytics/top-products
// @desc    Get top selling products
// @access  Private (Admin only)
router.get('/analytics/top-products', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          sales: '$totalSold',
          revenue: '$revenue'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topProducts
      }
    });
  } catch (error) {
    console.error('Get top products analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching top products analytics'
    });
  }
});

// @route   GET /api/admin/analytics/customer-metrics
// @desc    Get customer growth metrics
// @access  Private (Admin only)
router.get('/analytics/customer-metrics', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy;
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
    }

    // Get new customers over time
    const newCustomers = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 12 }
    ]);

    // Get returning customers (customers with more than one order)
    const returningCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$createdAt' }
        }
      },
      { $match: { orderCount: { $gt: 1 } } },
      {
        $group: {
          _id: {
            year: { $year: '$firstOrder' },
            month: { $month: '$firstOrder' },
            day: { $dayOfMonth: '$firstOrder' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 12 }
    ]);

    // Merge the data
    const customerMetrics = newCustomers.map(newCust => {
      const returningCust = returningCustomers.find(
        rc => JSON.stringify(rc._id) === JSON.stringify(newCust._id)
      );
      return {
        month: new Date(newCust._id.year, newCust._id.month - 1, 1).toLocaleString('default', { month: 'short' }),
        newCustomers: newCust.count,
        returningCustomers: returningCust?.count || 0
      };
    });

    res.json({
      success: true,
      data: {
        customerMetrics
      }
    });
  } catch (error) {
    console.error('Get customer metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customer metrics'
    });
  }
});

// @route   GET /api/admin/payments
// @desc    Get all payments (admin view)
// @access  Private (Admin only)
router.get('/payments', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.paymentStatus = status;
    if (method) query.paymentMethod = method;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'paymentDetails.transactionId': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email phone')
      .select('orderNumber total paymentStatus paymentMethod paymentDetails createdAt user shippingAddress items');

    const total = await Order.countDocuments(query);

    // Transform orders into payment records
    const payments = orders.map(order => ({
      id: order.orderNumber,
      orderId: order._id,
      date: order.createdAt,
      customerName: order.user?.name || 'Unknown Customer',
      customerEmail: order.user?.email || 'unknown@example.com',
      customerPhone: order.user?.phone || '+1 234-567-8900',
      amount: order.total,
      method: order.paymentMethod?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
      status: order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending',
      transactionId: order.paymentDetails?.transactionId || `txn_${order.orderNumber}_${Date.now()}`,
      billingAddress: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}`,
      refundStatus: order.paymentStatus === 'refunded' ? 'Processed' : null,
      refundAmount: order.paymentStatus === 'refunded' ? order.total : 0,
      notes: order.notes || ''
    }));

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalPayments: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payments'
    });
  }
});

// @route   PUT /api/admin/payments/:id/refund
// @desc    Process refund for a payment
// @access  Private (Admin only)
router.put('/payments/:id/refund', async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been refunded'
      });
    }

    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    const refundAmt = parseFloat(refundAmount);
    if (refundAmt <= 0 || refundAmt > order.total) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund amount'
      });
    }

    // Update order with refund information
    order.paymentStatus = refundAmt === order.total ? 'refunded' : 'partially_refunded';
    order.notes = (order.notes || '') + `\nRefund processed: ₹${refundAmt.toFixed(2)} - ${refundReason}`;
    
    await order.save();

    res.json({
      success: true,
      message: `Refund of ₹${refundAmt.toFixed(2)} processed successfully`,
      data: {
        refundAmount: refundAmt,
        refundReason,
        refundDate: new Date(),
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
});

// @route   GET /api/admin/payments/stats
// @desc    Get payment statistics
// @access  Private (Admin only)
router.get('/payments/stats', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalTransactions = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRefunded = await Order.aggregate([
      { $match: { paymentStatus: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const statusBreakdown = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalRefunded: totalRefunded[0]?.total || 0,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching payment statistics'
    });
  }
});

// @route   GET /api/admin/inventory
// @desc    Get all inventory items
// @access  Private (Admin only)
router.get('/inventory', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      status
    } = req.query;

    // Build query
    const query = {};
    
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const inventory = await Inventory.find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Inventory.countDocuments(query);

    res.json({
      success: true,
      data: {
        inventory,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory'
    });
  }
});

// @route   GET /api/admin/inventory/stats
// @desc    Get inventory statistics
// @access  Private (Admin only)
router.get('/inventory/stats', async (req, res) => {
  try {
    const stats = await Inventory.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    const totalItems = await Inventory.countDocuments();
    const totalInventoryValue = await Inventory.aggregate([
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ]);
    const lowStockItems = await Inventory.countDocuments({ status: 'low-stock' });
    const outOfStockItems = await Inventory.countDocuments({ status: 'out-of-stock' });

    const statusBreakdown = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalValue: stat.totalValue
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalItems,
        totalInventoryValue: totalInventoryValue[0]?.total || 0,
        lowStockItems,
        outOfStockItems,
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching inventory statistics'
    });
  }
});

// @route   POST /api/admin/inventory
// @desc    Create new inventory item
// @access  Private (Admin only)
router.post('/inventory', async (req, res) => {
  try {
    const inventoryData = req.body;

    // Check if product ID or SKU already exists
    const existingItem = await Inventory.findOne({
      $or: [
        { productId: inventoryData.productId },
        { sku: inventoryData.sku }
      ]
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product ID or SKU already exists'
      });
    }

    const inventoryItem = new Inventory(inventoryData);
    await inventoryItem.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: {
        inventory: inventoryItem
      }
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating inventory item'
    });
  }
});

// @route   PUT /api/admin/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin only)
router.put('/inventory/:id', async (req, res) => {
  try {
    const inventoryData = req.body;

    // Check if product ID or SKU already exists (excluding current item)
    const existingItem = await Inventory.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { productId: inventoryData.productId },
        { sku: inventoryData.sku }
      ]
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product ID or SKU already exists'
      });
    }

    const inventoryItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      inventoryData,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: {
        inventory: inventoryItem
      }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating inventory item'
    });
  }
});

// @route   DELETE /api/admin/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin only)
router.delete('/inventory/:id', async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: {
        inventory: inventoryItem
      }
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid inventory ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting inventory item'
    });
  }
});

// @route   GET /api/admin/profile
// @desc    Get admin profile information
// @access  Private (Admin only)
router.get('/profile', async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: {
        admin
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin profile'
    });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile information
// @access  Private (Admin only)
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, profileImage } = req.body;
    const Admin = require('../models/Admin');
    
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Update fields
    if (firstName !== undefined) admin.firstName = firstName;
    if (lastName !== undefined) admin.lastName = lastName;
    if (profileImage !== undefined) admin.profileImage = profileImage;

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating admin profile'
    });
  }
});

// @route   PUT /api/admin/profile/password
// @desc    Change admin password
// @access  Private (Admin only)
router.put('/profile/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const Admin = require('../models/Admin');
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

module.exports = router;
