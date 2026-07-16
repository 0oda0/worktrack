import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '../../api/axiosInstance';

export const fetchRequests = createAsyncThunk('requests/fetch', async () => {
  const res = await instance.get('/requests');
  return res.data;
});

export const createRequest = createAsyncThunk('requests/create', async (data: any) => {
  const res = await instance.post('/requests', data);
  return res.data;
});

export const approveRequest = createAsyncThunk('requests/approve', async (id: number) => {
  const res = await instance.put(`/requests/${id}/approve`);
  return res.data;
});

export const rejectRequest = createAsyncThunk('requests/reject', async (id: number) => {
  const res = await instance.put(`/requests/${id}/reject`);
  return res.data;
});

const initialState = { list: [], loading: false };

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchRequests.rejected, (state) => { state.loading = false; })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r: any) => r.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r: any) => r.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export const selectRequests = (state: any) => state.requests;
export default requestSlice.reducer;