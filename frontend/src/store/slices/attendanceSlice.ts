import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTimesheet } from '../../api/attendanceApi';

export const fetchTimesheetData = createAsyncThunk(
  'attendance/fetchTimesheet',
  async (params: { start: string; end: string }) => {
    const res = await fetchTimesheet(params);
    return res.data;
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { stats: {}, days: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheetData.pending, (state) => { state.loading = true; })
      .addCase(fetchTimesheetData.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.days = action.payload.days;
        state.loading = false;
      })
      .addCase(fetchTimesheetData.rejected, (state) => { state.loading = false; });
  },
});

export default attendanceSlice.reducer;