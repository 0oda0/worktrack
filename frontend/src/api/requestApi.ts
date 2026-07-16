import instance from './axiosInstance';

export const getRequests = () => {
  return instance.get('/requests');
};

export const createRequest = (data: any) => {
  return instance.post('/requests', data);
};

export const approveRequest = (id: number) => {
  return instance.put(`/requests/${id}/approve`);
};

export const rejectRequest = (id: number) => {
  return instance.put(`/requests/${id}/reject`);
};