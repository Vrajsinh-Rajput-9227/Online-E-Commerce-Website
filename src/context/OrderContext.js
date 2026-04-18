import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';

// Order context
const OrderContext = createContext();

// Initial state
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  orderStats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  }
};

// Action types
const ORDER_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CREATE_ORDER_SUCCESS: 'CREATE_ORDER_SUCCESS',
  GET_ORDERS_SUCCESS: 'GET_ORDERS_SUCCESS',
  GET_ORDER_SUCCESS: 'GET_ORDER_SUCCESS',
  CANCEL_ORDER_SUCCESS: 'CANCEL_ORDER_SUCCESS',
  GET_ORDER_STATS_SUCCESS: 'GET_ORDER_STATS_SUCCESS',
  CLEAR_CURRENT_ORDER: 'CLEAR_CURRENT_ORDER',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const orderReducer = (state, action) => {
  switch (action.type) {
    case ORDER_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ORDER_ACTIONS.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case ORDER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ORDER_ACTIONS.CREATE_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        currentOrder: action.payload,
        orders: [action.payload, ...state.orders]
      };

    case ORDER_ACTIONS.GET_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        orders: action.payload.orders,
        pagination: action.payload.pagination
      };

    case ORDER_ACTIONS.GET_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        currentOrder: action.payload
      };

    case ORDER_ACTIONS.CANCEL_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        currentOrder: action.payload,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        )
      };

    case ORDER_ACTIONS.GET_ORDER_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        orderStats: action.payload
      };

    case ORDER_ACTIONS.CLEAR_CURRENT_ORDER:
      return {
        ...state,
        currentOrder: null
      };

    case ORDER_ACTIONS.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Provider component
export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: ORDER_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ORDER_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_ERROR });
  };

  // Create order
  const createOrder = async (orderData) => {
    setLoading(true);
    clearError();

    try {
      const response = await orderService.createOrder(orderData);
      
      dispatch({
        type: ORDER_ACTIONS.CREATE_ORDER_SUCCESS,
        payload: response.data.order
      });

      return response.data.order;
    } catch (error) {
      const errorMessage = error.message || 'Failed to create order';
      setError(errorMessage);
      throw error;
    }
  };

  // Get user orders
  const getUserOrders = useCallback(async (page = 1, limit = 10, status = '') => {
    setLoading(true);
    clearError();

    try {
      const response = await orderService.getUserOrders(page, limit, status);
      
      // Handle different response formats
      const orders = response.data?.orders || response.data || [];
      const pagination = response.data?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        hasNext: false,
        hasPrev: page > 1
      };
      
      dispatch({
        type: ORDER_ACTIONS.GET_ORDERS_SUCCESS,
        payload: {
          orders: Array.isArray(orders) ? orders : [],
          pagination
        }
      });

      return { orders, pagination };
    } catch (error) {
      console.error('API Error in getUserOrders:', error);
      let errorMessage = 'Failed to fetch orders';
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to view orders. Please login again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No orders found.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Get single order
  const getOrderById = useCallback(async (orderId) => {
    setLoading(true);
    clearError();

    try {
      console.log('OrderContext: Getting order by ID:', orderId);
      const response = await orderService.getOrderById(orderId);
      console.log('OrderContext: API response:', response);
      
      // Handle different response formats
      const orderData = response.data?.order || response.data || response;
      
      dispatch({
        type: ORDER_ACTIONS.GET_ORDER_SUCCESS,
        payload: orderData
      });

      return orderData;
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Cancel order
  const cancelOrder = useCallback(async (orderId, cancellationReason) => {
    setLoading(true);
    clearError();

    try {
      const response = await orderService.cancelOrder(orderId, cancellationReason);
      
      dispatch({
        type: ORDER_ACTIONS.CANCEL_ORDER_SUCCESS,
        payload: response.data.order
      });

      return response.data.order;
    } catch (error) {
      const errorMessage = error.message || 'Failed to cancel order';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Get order statistics
  const getOrderStats = async () => {
    setLoading(true);
    clearError();

    try {
      const response = await orderService.getOrderStats();
      
      dispatch({
        type: ORDER_ACTIONS.GET_ORDER_STATS_SUCCESS,
        payload: response.data
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch order statistics';
      setError(errorMessage);
      throw error;
    }
  };

  // Track order by number
  const trackOrderByNumber = async (orderNumber) => {
    setLoading(true);
    clearError();

    try {
      const response = await orderService.trackOrderByNumber(orderNumber);
      setLoading(false);
      return response.data;
    } catch (error) {
      const errorMessage = error.message || 'Failed to track order';
      setError(errorMessage);
      throw error;
    }
  };

  // Clear current order
  const clearCurrentOrder = () => {
    dispatch({ type: ORDER_ACTIONS.CLEAR_CURRENT_ORDER });
  };

  // Reset state
  const resetState = () => {
    dispatch({ type: ORDER_ACTIONS.RESET_STATE });
  };

  const value = {
    ...state,
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getOrderStats,
    trackOrderByNumber,
    clearCurrentOrder,
    resetState,
    clearError
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
