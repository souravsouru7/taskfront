import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'https://api.bakerycrm.shop/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, 
  withCredentials: true
});


API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    };
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      error.response = {
        data: {
          message: 'Request timeout. Please check your internet connection.'
        }
      };
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

const formatNotificationMessage = (notification) => {
    const actorName = notification.actor?.name || 'Unknown User';
    
    switch (notification.type) {
        case 'comment':
            return `${actorName} commented on a task`;
        case 'task':
            return `${actorName} assigned you a task`;
        default:
            return notification.message;
    }
};

export default API; 