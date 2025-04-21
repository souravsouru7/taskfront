import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

// Suppress ResizeObserver loop error
const originalConsoleError = console.error;
console.error = function(msg) {
  if (msg && typeof msg === 'string' && msg.includes('ResizeObserver loop')) {
    // Don't log ResizeObserver loop errors
    return;
  }
  originalConsoleError.apply(console, arguments);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
); 