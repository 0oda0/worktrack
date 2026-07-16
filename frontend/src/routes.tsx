import { RouteObject } from 'react-router-dom';
import Login from './pages/Login';
import CheckIn from './pages/CheckIn';
import Timesheet from './pages/Timesheet';
import Requests from './pages/Requests';
import AdminPanel from './pages/AdminPanel';
import Reports from './pages/Reports';
import { ProtectedRoute } from './components/ProtectedRoute';

const routes: RouteObject[] = [
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <CheckIn /> },
      { path: '/timesheet', element: <Timesheet /> },
      { path: '/requests', element: <Requests /> },
      { path: '/reports', element: <Reports /> },
      { path: '/admin', element: <AdminPanel /> },
    ],
  },
];

export default routes;