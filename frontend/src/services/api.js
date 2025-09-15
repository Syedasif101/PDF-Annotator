import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance banao
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token automatically add karne ke liye interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// PDF services
export const pdfService = {
  upload: (formData) => {
    return api.post('/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyPDFs: () => api.get('/pdfs/my-pdfs'),
  getPDF: (uuid) => api.get(`/pdfs/${uuid}`, { responseType: 'blob' }),
  deletePDF: (uuid) => api.delete(`/pdfs/${uuid}`),
  renamePDF: (uuid, newName) => api.patch(`/pdfs/${uuid}/rename`, { newName }),
};

// Highlight services
export const highlightService = {
  create: (highlightData) => api.post('/highlights', highlightData),
  getByPDF: (pdfId) => api.get(`/highlights/pdf/${pdfId}`),
  update: (id, updates) => api.patch(`/highlights/${id}`, updates),
  delete: (id) => api.delete(`/highlights/${id}`),
};

export default api;
