import api from './api';

// --- Customer Methods ---

export const getMyFDs = async () => {
  const response = await api.get('/fd/my');
  return response.data;
};

export const transferToSavings = async (id: string) => {
  const response = await api.post(`/fd/${id}/transfer`);
  return response.data;
};

export const renewFD = async (id: string) => {
  const response = await api.post(`/fd/${id}/renew`);
  return response.data;
};

export const renewPrincipal = async (id: string) => {
  const response = await api.post(`/fd/${id}/renew-principal`);
  return response.data;
};

// --- Admin Methods ---

export const adminGetFDs = async () => {
  const response = await api.get('/admin/fd');
  return response.data;
};

export const adminSettleFD = async (id: string) => {
  const response = await api.post(`/admin/fd/${id}/settle`);
  return response.data;
};

export const adminCheckMaturity = async () => {
  const response = await api.post('/admin/fd/check-maturity');
  return response.data;
};
