import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const YELP_URL = 'https://api.yelp.com/v3/businesses/search';
const YELP_KEY = process.env.REACT_APP_YELP_API_KEY;

// This creates a custom Axios instance with a base URL of http://localhost:3500/api.
// This means all requests made with this instance will be prefixed with this URL.
const yelp: AxiosInstance = axios.create({
    baseURL: YELP_URL,
});

// Request interceptor - Add authentication token to all requests (Kirby's key)
yelp.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers.Authorization = `Bearer ${YELP_KEY}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default yelp;
