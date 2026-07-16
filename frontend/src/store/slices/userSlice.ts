import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '../../api/axiosInstance';

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const res = await instance.get('/admin/users');
  return res.data;
});

export const createUser = createAsyncThunk('users/create', async (data: any) => {
  const res = await instance.post('/admin/users', data);
  return res.data;
});

export const updateUser = createAsyncThunk('users/update', async ({ id, ...data }: any) => {
  const res = await instance.put(`/admin/users/${id}`, data);
  return res.data;
});

export const deleteUser = createAsyncThunk('users/delete', async (id: number) => {
  await instance.delete(`/admin/users/${id}`);
  return id;
});

const initialState = { users: [], loading: false };

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u: any) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u: any) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;