import { Center, Loader } from '@mantine/core'
import { Navigate, Outlet } from 'react-router-dom'

import type { Role } from '../api/types'
import { homeFor, useAuth } from './AuthContext'

/** Пускает только одобренных пользователей с разрешённой ролью. */
export function ProtectedRoute({ allow }: { allow: Role[] }) {
  const { user, status } = useAuth()

  if (status === 'loading') {
    return (
      <Center h="100vh">
        <Loader color="mtuci" />
      </Center>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_approved) return <Navigate to="/pending" replace />
  if (!allow.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />

  return <Outlet />
}
