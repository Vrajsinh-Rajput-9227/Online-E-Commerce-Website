const express = require('express');
const cors = require('cors');
const Inventory = require('./models/Inventory');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing without MongoDB
let mockInventory = [
  {
    _id: '1',
    productId: 'PROD001',
    productName: 'MacBook Pro 14"',
    category: 'Laptops',
    brand: 'Apple',
    sku: 'MBP14-2023',
    quantity: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    unitPrice: 199900,
    totalValue: 4997500,
    location: 'Warehouse A - Shelf 1',
    supplier: 'Apple Inc.',
    lastRestocked: '2024-01-15',
    nextRestockDate: '2024-02-01',
    status: 'in-stock',
    notes: 'High demand product',
    lastUpdated: new Date()
  },
  {
    _id: '2',
    productId: 'PROD002',
    productName: 'iPhone 15 Pro',
    category: 'Smartphones',
    brand: 'Apple',
    sku: 'IP15P-256',
    quantity: 8,
    minStockLevel: 15,
    maxStockLevel: 40,
    unitPrice: 139900,
    totalValue: 1119200,
    location: 'Warehouse B - Shelf 3',
    supplier: 'Apple Inc.',
    lastRestocked: '2024-01-10',
    nextRestockDate: '2024-01-25',
    status: 'low-stock',
    notes: 'Need urgent restock',
    lastUpdated: new Date()
  }
];

// Inventory routes
app.get('/api/admin/inventory', (req, res) => {
  console.log('GET /api/admin/inventory');
  res.json({
    success: true,
    data: {
      inventory: mockInventory,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockInventory.length,
        hasNext: false,
        hasPrev: false
      }
    }
  });
});

app.get('/api/admin/inventory/stats', (req, res) => {
  console.log('GET /api/admin/inventory/stats');
  const totalItems = mockInventory.length;
  const totalInventoryValue = mockInventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = mockInventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = mockInventory.filter(item => item.status === 'out-of-stock').length;

  res.json({
    success: true,
    data: {
      totalItems,
      totalInventoryValue,
      lowStockItems,
      outOfStockItems
    }
  });
});

app.post('/api/admin/inventory', (req, res) => {
  console.log('POST /api/admin/inventory');
  const newItem = {
    ...req.body,
    _id: String(mockInventory.length + 1),
    lastUpdated: new Date()
  };
  mockInventory.push(newItem);
  
  res.status(201).json({
    success: true,
    message: 'Inventory item created successfully',
    data: {
      inventory: newItem
    }
  });
});

app.put('/api/admin/inventory/:id', (req, res) => {
  console.log('PUT /api/admin/inventory/:id');
  const index = mockInventory.findIndex(item => item._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  mockInventory[index] = {
    ...mockInventory[index],
    ...req.body,
    lastUpdated: new Date()
  };
  
  res.json({
    success: true,
    message: 'Inventory item updated successfully',
    data: {
      inventory: mockInventory[index]
    }
  });
});

app.delete('/api/admin/inventory/:id', (req, res) => {
  console.log('DELETE /api/admin/inventory/:id');
  const index = mockInventory.findIndex(item => item._id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }
  
  const deletedItem = mockInventory.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Inventory item deleted successfully',
    data: {
      inventory: deletedItem
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Test server is running' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('  GET /api/admin/inventory');
  console.log('  GET /api/admin/inventory/stats');
  console.log('  POST /api/admin/inventory');
  console.log('  PUT /api/admin/inventory/:id');
  console.log('  DELETE /api/admin/inventory/:id');
  console.log('  GET /api/health');
});
