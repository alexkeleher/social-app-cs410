// Set up an Axios instance with custom configuration for handling API requests.
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/';

// This creates a custom Axios instance with a base URL of http://localhost:3500/api.
// This means all requests made with this instance will be prefixed with this URL.
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
});

// The first interceptor (Request Interceptor):
// Add token to all requests
// This interceptor runs before every request and:
//      Retrieves the authentication token from localStorage
//      If a token exists, adds it to the request headers as a Bearer token
//      This ensures every API request includes authentication if available
api.interceptors.response.use(
    (response) => {
        // Check for new token in response headers
        const newToken = response.headers['new-token'];
        if (newToken) {
            localStorage.setItem('token', newToken);
        }
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            try {
                const oldToken = localStorage.getItem('token');
                if (oldToken) {
                    // Try to refresh token
                    const response = await api.post('/refresh-token', {
                        token: oldToken,
                    });
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        // Retry original request
                        const config = error.config;
                        config.headers.Authorization = `Bearer ${response.data.token}`;
                        return api(config);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// The second interceptor (Response Interceptor):
// Handle token expiration
// This interceptor handles responses and:
//      Passes through successful responses unchanged
//      Checks for 401 (Unauthorized) errors specifically
//      If a 401 error occurs:
//          Removes the token from localStorage (it's likely expired or invalid)
//          Redirects the user to the login page
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

export default api;

// Key benefits of this setup:
//      Centralized API configuration
//      Automatic token management for authentication
//      Automatic handling of expired tokens

// You would use this in other files like:
// javascriptCopyimport api from './api';

// Then make requests like:
// api.get('/users');
// api.post('/data', { someData: 'value' });
