import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './auth/ProtectedRoute'
import { Placeholder } from './components/Placeholder'
import { AdminShell } from './layouts/AdminShell'
import { WorkerShell } from './layouts/WorkerShell'
import Login from './pages/Login'
import PendingApproval from './pages/PendingApproval'
import Register from './pages/Register'
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
          <Route path="/admin" element={<Placeholder title="Дашборд" />} />
          <Route path="/admin/records" element={<Placeholder title="Отметки" />} />
          <Route path="/admin/requests" element={<Placeholder title="Заявки" />} />
          <Route path="/admin/reports" element={<Placeholder title="Отчёты" />} />
          <Route path="/admin/rating" element={<Placeholder title="Рейтинг" />} />
          <Route path="/admin/me" element={<Placeholder title="Моя смена" />} />
          <Route path="/admin/employees" element={<Placeholder title="Сотрудники" />} />
          <Route path="/admin/holidays" element={<Placeholder title="Праздники" />} />
          <Route path="/admin/settings" element={<Placeholder title="Настройки" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
