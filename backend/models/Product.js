const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: false,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: 'No description available'
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories']
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative']
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  discount: {
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    validUntil: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Create index for search functionality
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// Virtual for final price after discount
productSchema.virtual('finalPrice').get(function() {
  if (this.discount.percentage && this.discount.validUntil && new Date(this.discount.validUntil) > new Date()) {
    return this.price * (1 - this.discount.percentage / 100);
  }
  return this.price;
});

module.exports = mongoose.model('Product', productSchema);
