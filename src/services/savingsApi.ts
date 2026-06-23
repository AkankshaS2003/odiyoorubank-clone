import api from './api';

export const getSavingsProfile = async () => {
  const response = await api.get('/savings/profile');
  return response.data;
};

export const getSavingsBalance = async () => {
  const response = await api.get('/savings/balance');
  return response.data;
};

export const createDepositOrder = async (data: any) => {
  const response = await api.post('/savings/deposit', data);
  return response.data;
};

export const verifyDepositPayment = async (data: any) => {
  const response = await api.post('/savings/payment', data);
  return response.data;
};

export const getSavingsTransactions = async (params: any = {}) => {
  const response = await api.get('/savings/transactions', { params });
  return response.data;
};

export const getAllSavingsDeposits = async () => {
  const response = await api.get('/admin/savings/deposits');
  return response.data;
};
