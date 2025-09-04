import axios from 'axios';

const API_URL = 'http://localhost:5000/api/customizations';

export const getAllCustomizations = async (page = 1, limit = 10, token) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('API error:', error, error.response);
    throw error.response?.data?.error || 'Failed to fetch customization requests';
  }
};

export const deleteCustomization = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to delete customization request';
  }
};

export const createCustomization = async (data, token) => {
  try {
    const response = await axios.post(API_URL, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to create customization request';
  }
};

export const updateCustomization = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to update customization request';
  }
};

export const getCustomizationById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Failed to fetch customization request';
  }
};