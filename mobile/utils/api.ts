import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://3000-01kjh74m2g3yb6f947rwt1axry.cloudspaces.litng.ai';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('fitly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  signup: (data: { email: string; password: string; phone?: string }) =>
    api.post('/auth/signup', data),
  verifyOtp: (data: { userId: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  resendOtp: (userId: string) =>
    api.post('/auth/resend-otp', { userId }),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  deleteAccount: () =>
    api.delete('/auth/account'),
};

// Profiles
export const profilesApi = {
  getAll: () => api.get('/profiles'),
  getOne: (id: string) => api.get(`/profiles/${id}`),
  create: (data: { name: string; gender?: string }) =>
    api.post('/profiles', data),
  update: (id: string, data: { name?: string; gender?: string }) =>
    api.put(`/profiles/${id}`, data),
  delete: (id: string) => api.delete(`/profiles/${id}`),
};

// Measurements
export const measurementsApi = {
  getAll: (profileId: string) => api.get(`/measurements/${profileId}`),
  getLatest: (profileId: string) => api.get(`/measurements/${profileId}/latest`),
  create: (profileId: string, data: MeasurementInput) =>
    api.post(`/measurements/${profileId}`, data),
  update: (id: string, data: MeasurementInput) =>
    api.put(`/measurements/${id}`, data),
  delete: (id: string) => api.delete(`/measurements/${id}`),
};

// Cards
export const cardsApi = {
  getAll: () => api.get('/cards'),
  generate: (profileId: string) => api.post(`/cards/${profileId}`),
  delete: (id: string) => api.delete(`/cards/${id}`),
  getShared: (token: string) => api.get(`/cards/share/${token}`),
};

// Conversions
export const conversionsApi = {
  convert: (params: { type: string; system: string; value: number }) =>
    api.get('/conversions', { params }),
  getTypes: () => api.get('/conversions/types'),
  getSystems: (type?: string) => api.get('/conversions/systems', { params: { type } }),
  getSizes: (type?: string, system?: string) =>
    api.get('/conversions/sizes', { params: { type, system } }),
};

// Subscriptions
export const subscriptionsApi = {
  getStatus: () => api.get('/subscriptions/status'),
  activateTrial: () => api.post('/subscriptions/trial/activate'),
  subscribe: (type: 'MONTHLY' | 'ANNUAL') =>
    api.post('/subscriptions/subscribe', { type }),
  restore: () => api.post('/subscriptions/restore'),
};

// Banners
export const bannersApi = {
  getActive: () => api.get('/banners'),
};

// Types
export interface MeasurementInput {
  height?: number;
  weight?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  armLength?: number;
  legLength?: number;
  shoeSize?: number;
}

export default api;
