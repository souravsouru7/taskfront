import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'https://api.bakerycrm.shop/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

// Add request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Ensure error object has the expected structure
    if (!error.response) {
      error.response = { 
        data: { 
          message: 'Network error or server unavailable. Please check your connection.'
        }
      };
    } else if (!error.response.data) {
      error.response.data = { message: error.message || 'Unknown error occurred' };
    } else if (typeof error.response.data === 'object' && !error.response.data.message) {
      error.response.data.message = error.message || 'An error occurred';
    }
    
    return Promise.reject(error);
  }
);

export default API; 