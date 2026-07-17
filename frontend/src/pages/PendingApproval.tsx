import { Button, Center, Loader, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconHourglassHigh } from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'

import { homeFor, useAuth } from '../auth/AuthContext'
import { AuthScreen } from '../components/AuthScreen'

export default function PendingApproval() {
  const { user, status, logout } = useAuth()

  if (status === 'loading') {
    return (
      <Center h="100vh">
        <Loader color="mtuci" />
      </Center>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.is_approved) return <Navigate to={homeFor(user.role)} replace />

  return (
    <AuthScreen>
      <Stack align="center" gap="md" py="sm">
        <ThemeIcon variant="light" color="mtuci" size={64} radius="xl">
          <IconHourglassHigh size={32} stroke={1.75} />
        </ThemeIcon>
        <Title order={3} ta="center">
          Аккаунт на одобрении
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          {user.full_name}, ваша заявка отправлена администратору. Как только аккаунт одобрят
          и назначат роль, вы получите доступ к системе.
        </Text>
        <Button variant="light" fullWidth onClick={() => window.location.reload()}>
          Проверить снова
        </Button>
        <Button variant="subtle" color="gray" fullWidth onClick={logout}>
          Выйти
        </Button>
      </Stack>
    </AuthScreen>
  )
}
