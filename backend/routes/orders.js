const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating order with data:', req.body);
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    console.log('Processing items:', items);

    for (const item of items) {
      console.log('Processing item:', item);
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product} not found or inactive`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Calculate shipping (completely free)
    const shippingCost = 0; // Free shipping for all orders
    const total = subtotal + shippingCost;

    // Generate unique order number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `TS${timestamp}${random}`;

    console.log('Creating order with:', {
      user: req.user._id,
      orderNumber,
      itemsCount: orderItems.length,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total
    });

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      notes,
      orderStatus: 'confirmed',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'processing'
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      req.user._id,
      { cart: [] }
    );

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: populatedOrder
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('items.product', 'name images');

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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images specifications');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
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

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order
    order.orderStatus = 'cancelled';
    order.cancellationReason = cancellationReason || 'User requested cancellation';
    order.cancelledAt = new Date();

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number and email (public endpoint)
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for order tracking'
      });
    }

    const order = await Order.findOne({ orderNumber })
      .populate('user', 'name email phone')
      .populate('items.product', 'name images specifications');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order ID and try again.'
      });
    }

    // Verify email matches (allow tracking if user is not logged in or email matches)
    const userEmail = order.user?.email?.toLowerCase();
    const providedEmail = email.toLowerCase();

    if (userEmail && userEmail !== providedEmail) {
      return res.status(403).json({
        success: false,
        message: 'This order is not associated with the provided email address.'
      });
    }

    // Generate tracking number if not exists
    if (!order.trackingNumber) {
      order.trackingNumber = `TRK${orderNumber.slice(-9)}`;
      await order.save();
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          status: order.orderStatus,
          total: order.total,
          trackingNumber: order.trackingNumber,
          customerName: order.user?.name || 'Customer',
          customerEmail: providedEmail,
          customerPhone: order.user?.phone || '+1 234-567-8900',
          shippingAddress: order.shippingAddress,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product?.images?.[0] || '/placeholder-product.jpg'
          })),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          estimatedDelivery: order.estimatedDelivery || new Date(new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error tracking order'
    });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get user's order statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ user: userId });
    const totalSpent = await Order.aggregate([
      { $match: { user: userId, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalAmount: stat.totalAmount
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order statistics'
    });
  }
});

module.exports = router;
