import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '../../api/axiosInstance';

export const fetchRating = createAsyncThunk(
  'rating/fetch',
  async (params: { start: string; end: string }) => {
    const res = await instance.get('/admin/rating', { params });
    return res.data;
  }
);

const ratingSlice = createSlice({
  name: 'rating',
  initialState: { rating: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRating.pending, (state) => { state.loading = true; })
      .addCase(fetchRating.fulfilled, (state, action) => { state.rating = action.payload; state.loading = false; })
      .addCase(fetchRating.rejected, (state) => { state.loading = false; });
  },
});

export default ratingSlice.reducer;