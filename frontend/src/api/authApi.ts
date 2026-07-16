import instance from './axiosInstance';

export const login = (email: string, password: string) => {
  return instance.post('/auth/login', { email, password });
};

export const register = (data: any) => {
  return instance.post('/auth/register', data);
};