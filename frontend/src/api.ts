import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get ID token:', error);
  }
  return config;
});

export const createComplaint = async (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  const response = await api.post('/api/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getComplaints = async (filters: any = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.latitude) params.append('latitude', filters.latitude);
  if (filters.longitude) params.append('longitude', filters.longitude);
  
  const response = await api.get('/api/complaints', { params });
  return response.data;
};

export const getComplaint = async (id: string) => {
  const response = await api.get(`/api/complaints/${id}`);
  return response.data;
};

export const updateComplaint = async (id: string, status: string) => {
  const response = await api.patch(`/api/complaints/${id}`, { status });
  return response.data;
};

export const verifyComplaint = async (id: string, phone: string) => {
  const formData = new FormData();
  formData.append('phone', phone);
  const response = await api.post(`/api/complaints/${id}/verify`, formData);
  return response.data;
};

export const suggestCategory = async (description?: string, filename?: string) => {
  const formData = new FormData();
  if (description) formData.append('description', description);
  if (filename) formData.append('filename', filename);
  const response = await api.post('/api/suggest-category', formData);
  return response.data;
};

export const getStats = async (latitude?: number, longitude?: number) => {
  const params: any = {};
  if (latitude) params.latitude = latitude;
  if (longitude) params.longitude = longitude;
  const response = await api.get('/api/stats', { params });
  return response.data;
};
