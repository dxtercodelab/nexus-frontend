import api from './api';

export const productService = {
  // Récupérer tous les produits (avec filtres)
  getAll: (params = {}) => api.get('/products', { params }),
  
  // Récupérer un produit
  getById: (id) => api.get(`/products/${id}`),
  
  // Créer
  create: (data) => api.post('/products', data),
  
  // Modifier
  update: (id, data) => api.put(`/products/${id}`, data),
  
  // Supprimer
  delete: (id) => api.delete(`/products/${id}`),
};