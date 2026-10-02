import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && Array.isArray(response.data.data) && response.data.total !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auditApi = { list: () => api.get('/audit') };
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  register: (data: any) => api.post('/auth/register', data),
  listUsers: () => api.get('/auth/users'),
};

export const productsApi = {
  list: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const suppliersApi = {
  list: () => api.get('/suppliers'),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};

export const batchesApi = {
  list: (productId?: string) => api.get('/batches', { params: { productId } }),
  register: (data: any) => api.post('/batches/register', data),
  expedition: (data: any) => api.post('/batches/expedition', data),
};

export const purchaseOrdersApi = {
  list: () => api.get('/purchase-orders'),
  create: (data: any) => api.post('/purchase-orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/purchase-orders/${id}/status`, { status }),
};

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getExpiringBatches: (days?: number) => api.get('/dashboard/expiring?days=' + (days || 30)),
  getTrend: () => api.get('/dashboard/trend'),
  getLosses: () => api.get('/dashboard/losses'),
  runExpirationJob: () => api.post('/dashboard/run-expiration-job'),
};

export default api;
