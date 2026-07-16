import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import attendanceReducer from './slices/attendanceSlice';
import requestReducer from './slices/requestSlice';
import holidayReducer from './slices/holidaySlice';
import ratingReducer from './slices/ratingSlice';

export const store = configureStore({
  reducer: {
    users: userReducer,
    attendance: attendanceReducer,
    requests: requestReducer,
    holidays: holidayReducer,
    rating: ratingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;