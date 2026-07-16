import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '../../api/axiosInstance';

export const fetchHolidays = createAsyncThunk('holidays/fetch', async () => {
  const res = await instance.get('/admin/holidays');
  return res.data;
});

export const createHoliday = createAsyncThunk('holidays/create', async (data: any) => {
  const res = await instance.post('/admin/holidays', data);
  return res.data;
});

export const updateHoliday = createAsyncThunk('holidays/update', async ({ id, ...data }: any) => {
  const res = await instance.put(`/admin/holidays/${id}`, data);
  return res.data;
});

export const deleteHoliday = createAsyncThunk('holidays/delete', async (id: number) => {
  await instance.delete(`/admin/holidays/${id}`);
  return id;
});

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: { holidays: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.fulfilled, (state, action) => { state.holidays = action.payload; })
      .addCase(createHoliday.fulfilled, (state, action) => { state.holidays.push(action.payload); })
      .addCase(updateHoliday.fulfilled, (state, action) => {
        const idx = state.holidays.findIndex((h: any) => h.id === action.payload.id);
        if (idx >= 0) state.holidays[idx] = action.payload;
      })
      .addCase(deleteHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter((h: any) => h.id !== action.payload);
      });
  },
});

export default holidaySlice.reducer;