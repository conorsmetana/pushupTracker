import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000' : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/api/auth/profile', data),
};

// Pushups API
export const pushupsApi = {
  create: (count: number, date?: string) =>
    api.post('/api/pushups', { count, date }),
  getAll: (take = 30, skip = 0) =>
    api.get(`/api/pushups?take=${take}&skip=${skip}`),
  getToday: () => api.get('/api/pushups/today'),
  update: (id: number, count: number) =>
    api.put(`/api/pushups/${id}`, { count }),
  delete: (id: number) => api.delete(`/api/pushups/${id}`),
};

export default api;
