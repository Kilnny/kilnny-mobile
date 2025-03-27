import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const API_URL = 'http://192.168.1.100:3000/api';

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        
        if (!refreshToken) {
          processQueue(new Error('No refresh token available'));
          await handleLogout();
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await AsyncStorage.setItem('@auth_token', accessToken);
        await AsyncStorage.setItem('@refresh_token', newRefreshToken);

        processQueue(null, accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
      
        processQueue(refreshError);
        await handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const handleLogout = async () => {
  await AsyncStorage.removeItem('@auth_token');
  await AsyncStorage.removeItem('@refresh_token');
  await AsyncStorage.removeItem('@auth_user');
 
  setTimeout(() => {
    router.replace('/login');
  }, 100);
};

export const apiClient = {
  get: (url: string, config?: AxiosRequestConfig) => 
    axiosInstance.get(url, config).then(response => response.data),
    
  post: (url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.post(url, data, config).then(response => response.data),
    
  put: (url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.put(url, data, config).then(response => response.data),
    
  delete: (url: string, config?: AxiosRequestConfig) => 
    axiosInstance.delete(url, config).then(response => response.data),
    
  patch: (url: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.patch(url, data, config).then(response => response.data),
};