import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '../../api/axiosInstance';

export const fetchRating = createAsyncThunk(
  'rating/fetch',
  async (params: { start: string; end: string }) => {
    const res = await instance.get('/admin/rating', { params });
    return res.data;
  }
);

const initialState = { rating: [], loading: false };

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRating.pending, (state) => { state.loading = true; })
      .addCase(fetchRating.fulfilled, (state, action) => {
        state.loading = false;
        state.rating = action.payload;
      })
      .addCase(fetchRating.rejected, (state) => { state.loading = false; });
  },
});

export const selectRating = (state: any) => state.rating;
export default ratingSlice.reducer;