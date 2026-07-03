import localStorageService from './localStorageService';
import { STORAGE_KEYS } from '../utils/storageKeys';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const buildHeaders = (customHeaders = {}) => {
  const token = localStorageService.get(STORAGE_KEYS.AUTH_TOKEN, null);
  const headers = { ...customHeaders };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async (response) => {
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result?.message || (response.status ? `Máy chủ trả về lỗi ${response.status}.` : 'Không thể kết nối tới máy chủ.');
    const error = new Error(message);
    error.details = result?.data || null;
    throw error;
  }
  return result;
};

const apiClient = {
  get(url) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: buildHeaders({ 'Content-Type': 'application/json' })
    }).then(parseResponse);
  },
  post(url, body) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    }).then(parseResponse);
  },
  postForm(url, formData) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: formData
    }).then(parseResponse);
  },
  put(url, body) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    }).then(parseResponse);
  },
  putForm(url, formData) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: formData
    }).then(parseResponse);
  },
  patch(url, body) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body)
    }).then(parseResponse);
  },
  patchForm(url, formData) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: formData
    }).then(parseResponse);
  },
  delete(url, body) {
    return fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: buildHeaders({ 'Content-Type': 'application/json' }),
      body: body ? JSON.stringify(body) : undefined
    }).then(parseResponse);
  }
};

export default apiClient;
