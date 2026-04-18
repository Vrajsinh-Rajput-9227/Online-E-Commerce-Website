const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true,
    unique: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: [0, 'Minimum stock level cannot be negative'],
    default: 10
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Maximum stock level cannot be negative']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative'],
    default: 0
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  supplier: {
    type: String,
    trim: true,
    default: ''
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  nextRestockDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
    default: 'in-stock'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for search functionality
inventorySchema.index({ productName: 'text', brand: 'text', sku: 'text', category: 'text' });
inventorySchema.index({ status: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ quantity: 1 });

// Pre-save middleware to calculate total value and update status
inventorySchema.pre('save', function(next) {
  // Calculate total value
  this.totalValue = this.quantity * this.unitPrice;
  
  // Auto-update status based on quantity and min stock level
  if (this.quantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  this.lastUpdated = new Date();
  next();
});

// Virtual for stock trend
inventorySchema.virtual('stockTrend').get(function() {
  const quantity = this.quantity || 0;
  const minStockLevel = this.minStockLevel || 0;
  
  if (quantity === 0) return 'down';
  if (quantity <= minStockLevel) return 'warning';
  if (this.maxStockLevel && quantity >= this.maxStockLevel) return 'up';
  return 'stable';
});

module.exports = mongoose.model('Inventory', inventorySchema);
