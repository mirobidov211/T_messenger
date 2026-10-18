import api from './axios';

export const loginApi = async (credentials) => {
  const { data } = await api.post('/auth/login/', credentials);
  return data;
};

export const registerApi = async (userData) => {
  const { data } = await api.post('/auth/register/', userData);
  return data;
};

export const getUserApi = async () => {
  const { data } = await api.get('/auth/me/');
  return data;
};

export const updateProfileApi = async (data) => {
  const isFormData = data instanceof FormData;
  const res = await api.patch('/auth/profile/', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return res.data;
};