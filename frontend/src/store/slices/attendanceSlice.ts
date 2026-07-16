// ... существующие
export const fetchTimesheetForUser = createAsyncThunk(
  'attendance/fetchTimesheetForUser',
  async ({ userId, start, end }: { userId: number; start: string; end: string }) => {
    const res = await instance.get(`/attendance/timesheet/${userId}`, { params: { start, end } });
    return res.data;
  }
);