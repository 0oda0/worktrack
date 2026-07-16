import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTimesheet } from '../../api/attendanceApi';

export const fetchTimesheet = createAsyncThunk(
  'attendance/fetchTimesheet',
  async (params: { start: string; end: string }) => {
    const res = await getTimesheet(params);
    return res.data;
  }
);

const initialState = { stats: {}, days: [], loading: false };

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheet.pending, (state) => { state.loading = true; })
      .addCase(fetchTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.days = action.payload.days;
      })
      .addCase(fetchTimesheet.rejected, (state) => { state.loading = false; });
  },
});

export const selectTimesheet = (state: any) => state.attendance;
export default attendanceSlice.reducer;