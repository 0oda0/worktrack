import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
};