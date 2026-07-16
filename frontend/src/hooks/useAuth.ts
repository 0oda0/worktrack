import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.users.user);
  const loading = useSelector((state: RootState) => state.users.loading);
  return { user, loading };
};