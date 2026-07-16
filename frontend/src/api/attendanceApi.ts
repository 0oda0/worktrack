export const getTimesheetForUser = (userId: number, params: any) => {
  return instance.get(`/attendance/timesheet/${userId}`, { params });
};