// Mock order service for when the backend API is not available
const mockOrders = [
  {
    id: '69d6a1100331d326fb01454c',
    orderNumber: 'TS1775474990093001',
    date: new Date('2024-04-01').toISOString(),
    status: 'Processing',
    total: 157999,
    trackingNumber: 'TRK123456789',
    estimatedDelivery: new Date('2024-04-06').toISOString().split('T')[0],
    items: [
      {
        id: 'laptop2',
        name: 'MacBook Pro 16-inch',
        price: 157999,
        quantity: 1,
        image: 'https://via.placeholder.com/100x100?text=MacBook'
      }
    ],
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+919876543210',
    shippingAddress: {
      street: '123 Tech Street',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India'
    }
  },
  {
    id: 'ORD001',
    orderNumber: 'TS1775474990093002',
    date: new Date('2024-01-15').toISOString(),
    status: 'Delivered',
    total: 29999,
    trackingNumber: 'TRK123456780',
    estimatedDelivery: new Date('2024-01-20').toISOString().split('T')[0],
    items: [
      {
        id: 'laptop1',
        name: 'Dell XPS 13 Laptop',
        price: 29999,
        quantity: 1,
        image: 'https://via.placeholder.com/100x100?text=Laptop'
      }
    ],
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    customerPhone: '+919876543211',
    shippingAddress: {
      street: '456 Commercial Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    }
  },
  {
    id: 'ORD002',
    orderNumber: 'TS1775474990093003',
    date: new Date('2024-02-20').toISOString(),
    status: 'Processing',
    total: 45999,
    trackingNumber: 'TRK123456781',
    estimatedDelivery: new Date('2024-02-25').toISOString().split('T')[0],
    items: [
      {
        id: 'phone1',
        name: 'iPhone 15 Pro',
        price: 45999,
        quantity: 1,
        image: 'https://via.placeholder.com/100x100?text=iPhone'
      }
    ],
    customerName: 'Robert Johnson',
    customerEmail: 'robert.johnson@example.com',
    customerPhone: '+919876543212',
    shippingAddress: {
      street: '789 Tech Park',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India'
    }
  }
];

export const mockOrderService = {
  // Get user orders
  getUserOrders: async (page = 1, limit = 10, status = '') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredOrders = mockOrders;
    if (status) {
      filteredOrders = mockOrders.filter(order => 
        order.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      data: {
        orders: paginatedOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredOrders.length / limit),
          totalOrders: filteredOrders.length,
          hasNext: endIndex < filteredOrders.length,
          hasPrev: page > 1
        }
      }
    };
  },
  
  // Get single order by ID
  getOrderById: async (orderId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return {
      data: {
        order: order
      }
    };
  },
  
  // Cancel order
  cancelOrder: async (orderId, cancellationReason) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason
    };
    
    return {
      data: {
        order: mockOrders[orderIndex]
      }
    };
  },
  
  // Get order stats
  getOrderStats: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const stats = {
      totalOrders: mockOrders.length,
      processingOrders: mockOrders.filter(o => o.status === 'Processing').length,
      shippedOrders: mockOrders.filter(o => o.status === 'Shipped').length,
      deliveredOrders: mockOrders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: mockOrders.filter(o => o.status === 'Cancelled').length,
      totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0)
    };
    
    return {
      data: stats
    };
  },
  
  // Track order by number
  trackOrderByNumber: async (orderNumber) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const order = mockOrders.find(o => o.trackingNumber === orderNumber || o.id === orderNumber);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return {
      data: {
        order: order
      }
    };
  }
};
