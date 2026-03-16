import axios from 'axios';

// Ensure the Flask backend is running on 5000 in dev, or use the deployed URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const orderServices = {
    getOrders: () => api.get('/orders'),
    createOrder: (order) => api.post('/orders', order),
    updateOrder: (id, order) => api.put(`/orders/${id}`, order),
    deleteOrder: (id) => api.delete(`/orders/${id}`)
};

export const productServices = {
    getProducts: () => api.get('/products'),
    addProduct: (data) => api.post('/products', data),
    updateProduct: (id, data) => api.put(`/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/products/${id}`)
};

export const dashboardServices = {
    getConfig: () => api.get('/dashboards'),
    saveConfig: (widgets) => api.post('/dashboards', { widgets })
};

export default api;
