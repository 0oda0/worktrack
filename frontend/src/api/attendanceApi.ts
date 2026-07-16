import instance from './axiosInstance';

export const checkIn = (lat: number, lng: number) => {
  return instance.post('/attendance/check-in', { lat, lng });
};

export const checkOut = (lat: number, lng: number) => {
  return instance.post('/attendance/check-out', { lat, lng });
};

export const fetchTimesheet = (params: { start: string; end: string }) => {
  return instance.get('/attendance/timesheet', { params });
};