import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRequests, createRequest, approveRequest, rejectRequest } from '../../api/requestApi';

export const fetchRequests = createAsyncThunk('requests/fetch', async () => {
  const res = await getRequests();
  return res.data;
});

export const addRequest = createAsyncThunk('requests/add', async (data: any) => {
  const res = await createRequest(data);
  return res.data;
});

export const approveRequestById = createAsyncThunk('requests/approve', async (id: number) => {
  const res = await approveRequest(id);
  return res.data;
});

export const rejectRequestById = createAsyncThunk('requests/reject', async (id: number) => {
  const res = await rejectRequest(id);
  return res.data;
});

const requestSlice = createSlice({
  name: 'requests',
  initialState: { list: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchRequests.fulfilled, (state, action) => { state.list = action.payload; state.loading = false; })
      .addCase(fetchRequests.rejected, (state) => { state.loading = false; })
      .addCase(addRequest.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(approveRequestById.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r: any) => r.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(rejectRequestById.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r: any) => r.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      });
  },
});

export default requestSlice.reducer;