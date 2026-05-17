import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getTopProducts: () => api.get('/dashboard/top-products'),
  getMonthlySales: () => api.get('/dashboard/monthly-sales'),
  getOrdersByStatus: () => api.get('/dashboard/orders-by-status'),
};