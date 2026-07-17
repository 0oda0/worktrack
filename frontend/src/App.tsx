import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './auth/ProtectedRoute'
import { AdminShell } from './layouts/AdminShell'
import { WorkerShell } from './layouts/WorkerShell'
import Login from './pages/Login'
import PendingApproval from './pages/PendingApproval'
import Register from './pages/Register'
import Dashboard from './pages/admin/Dashboard'
import Employees from './pages/admin/Employees'
import Holidays from './pages/admin/Holidays'
import MyShift from './pages/admin/MyShift'
import Records from './pages/admin/Records'
import Rating from './pages/admin/Rating'
import Reports from './pages/admin/Reports'
import RequestsReview from './pages/admin/RequestsReview'
import Settings from './pages/admin/Settings'
import CheckIn from './pages/worker/CheckIn'
import Requests from './pages/worker/Requests'
import Timesheet from './pages/worker/Timesheet'

export default function App() {
  return (
    <Routes>
      {/* публичные */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<PendingApproval />} />

      {/* работник (mobile-first) */}
      <Route element={<ProtectedRoute allow={['worker']} />}>
        <Route element={<WorkerShell />}>
          <Route path="/" element={<CheckIn />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/requests" element={<Requests />} />
        </Route>
      </Route>

      {/* админка (leader + admin) */}
      <Route element={<ProtectedRoute allow={['admin', 'leader']} />}>
        <Route element={<AdminShell />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/records" element={<Records />} />
          <Route path="/admin/requests" element={<RequestsReview />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/rating" element={<Rating />} />
          <Route path="/admin/me" element={<MyShift />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/holidays" element={<Holidays />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
