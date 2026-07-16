import instance from './axiosInstance';

export const getUsers = () => {
  return instance.get('/admin/users'); // предполагаем, что есть такой эндпоинт
};

export const createUser = (data: any) => {
  return instance.post('/admin/users', data);
};

export const updateUser = (id: number, data: any) => {
  return instance.put(`/admin/users/${id}`, data);
};

export const deleteUser = (id: number) => {
  return instance.delete(`/admin/users/${id}`);
};

export const getHolidays = () => {
  return instance.get('/admin/holidays');
};

export const createHoliday = (data: any) => {
  return instance.post('/admin/holidays', data);
};

export const updateHoliday = (id: number, data: any) => {
  return instance.put(`/admin/holidays/${id}`, data);
};

export const deleteHoliday = (id: number) => {
  return instance.delete(`/admin/holidays/${id}`);
};