import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('hostel_token');
        localStorage.removeItem('hostel_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Students Endpoints
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Rooms Endpoints
export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  getStats: () => api.get('/rooms/stats/summary'),
};

// Allocations Endpoints
export const allocationService = {
  getAll: (params) => api.get('/allocations', { params }),
  allocate: (data) => api.post('/allocations', data),
  vacate: (id, data) => api.post(`/allocations/${id}/vacate`, data),
  transfer: (id, data) => api.post(`/allocations/${id}/transfer`, data),
};

// Fees Endpoints
export const feeService = {
  getAll: (params) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  recordPayment: (id, data) => api.post(`/fees/${id}/pay`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  getStats: () => api.get('/fees/stats/summary'),
};

// Complaints Endpoints
export const complaintService = {
  getAll: (params) => api.get('/complaints', { params }),
  create: (data) => api.post('/complaints', data),
  update: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// Notices Endpoints
export const noticeService = {
  getAll: (params) => api.get('/notices', { params }),
  create: (data) => api.post('/notices', data),
  update: (id, data) => api.put(`/notices/${id}`, data),
  delete: (id) => api.delete(`/notices/${id}`),
};

// Dashboard Endpoints
export const dashboardService = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export default api;
