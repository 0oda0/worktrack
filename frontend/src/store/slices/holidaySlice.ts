import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../api/adminApi';

export const fetchHolidays = createAsyncThunk('holidays/fetch', async () => {
  const res = await getHolidays();
  return res.data;
});

export const addHoliday = createAsyncThunk('holidays/add', async (data: any) => {
  const res = await createHoliday(data);
  return res.data;
});

export const editHoliday = createAsyncThunk('holidays/edit', async ({ id, data }: any) => {
  const res = await updateHoliday(id, data);
  return res.data;
});

export const removeHoliday = createAsyncThunk('holidays/remove', async (id: number) => {
  await deleteHoliday(id);
  return id;
});

const holidaySlice = createSlice({
  name: 'holidays',
  initialState: { holidays: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHolidays.fulfilled, (state, action) => { state.holidays = action.payload; })
      .addCase(addHoliday.fulfilled, (state, action) => { state.holidays.push(action.payload); })
      .addCase(editHoliday.fulfilled, (state, action) => {
        const idx = state.holidays.findIndex((h: any) => h.id === action.payload.id);
        if (idx >= 0) state.holidays[idx] = action.payload;
      })
      .addCase(removeHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter((h: any) => h.id !== action.payload);
      });
  },
});

export default holidaySlice.reducer;