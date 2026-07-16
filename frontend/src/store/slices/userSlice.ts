import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/adminApi';

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const res = await getUsers();
  return res.data;
});

export const addUser = createAsyncThunk('users/add', async (data: any) => {
  const res = await createUser(data);
  return res.data;
});

export const editUser = createAsyncThunk('users/edit', async ({ id, data }: any) => {
  const res = await updateUser(id, data);
  return res.data;
});

export const removeUser = createAsyncThunk('users/remove', async (id: number) => {
  await deleteUser(id);
  return id;
});

const userSlice = createSlice({
  name: 'users',
  initialState: { users: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => { state.users = action.payload; })
      .addCase(addUser.fulfilled, (state, action) => { state.users.push(action.payload); })
      .addCase(editUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u: any) => u.id === action.payload.id);
        if (idx >= 0) state.users[idx] = action.payload;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u: any) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;