const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please provide a valid 10-digit phone number'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Product creation validation
const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories'])
    .withMessage('Invalid category'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  handleValidationErrors
];

// Product update validation
const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isIn(['Laptops', 'Smartphones', 'Cameras', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accessories'])
    .withMessage('Invalid category'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Review comment must be between 3 and 500 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Review title cannot exceed 100 characters'),
  handleValidationErrors
];

// Address validation
const validateAddress = [
  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProductCreation,
  validateProductUpdate,
  validateReview,
  validateAddress
};
