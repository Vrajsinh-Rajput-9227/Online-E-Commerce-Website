# TechShop Backend

A comprehensive Node.js/Express backend for the TechShop e-commerce application.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for products with categories, reviews, and ratings
- **Order Management**: Complete order workflow with status tracking
- **User Management**: User profiles, cart, wishlist, and address management
- **Admin Dashboard**: Analytics, order management, and user administration
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Express Validator

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with your database connection and JWT secret.

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering/pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/categories` - Get categories and brands
- `GET /api/products/featured/list` - Get featured products

### Users
- `GET /api/users/cart` - Get user cart
- `POST /api/users/cart/add` - Add item to cart
- `PUT /api/users/cart/update` - Update cart quantity
- `DELETE /api/users/cart/remove/:productId` - Remove from cart
- `DELETE /api/users/cart/clear` - Clear cart
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/wishlist/add/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/remove/:productId` - Remove from wishlist
- `GET /api/users/addresses` - Get addresses
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/:addressId` - Update address
- `DELETE /api/users/addresses/:addressId` - Delete address

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/summary` - Get order statistics

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order details
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/products/low-stock` - Get low stock products
- `GET /api/admin/analytics/sales` - Get sales analytics

## Database Schema

### User
- name, email, password, phone, role
- addresses array
- wishlist (product references)
- cart (product references with quantities)

### Product
- name, description, price, category, brand
- images array, specifications
- stock, featured flag
- rating system with reviews
- discount functionality

### Order
- user reference, order number
- items array with product details
- shipping address, payment method
- order status tracking
- payment status and details

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techshop
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation and sanitization
- Helmet for security headers
- Role-based access control

## Error Handling

- Global error handling middleware
- Consistent error response format
- Validation error messages
- Development vs production error details

## Development

The server runs on port 5000 by default and connects to MongoDB. Make sure MongoDB is running locally before starting the server.

## Testing

```bash
npm test
```

## License

ISC
