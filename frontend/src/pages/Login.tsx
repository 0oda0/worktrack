import { Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { errMsg } from '../api/errors'
import { homeFor, useAuth } from '../auth/AuthContext'
import { AuthScreen } from '../components/AuthScreen'

export default function Login() {
  const { user, status, login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Некорректный email'),
      password: (v) => (v.length >= 6 ? null : 'Минимум 6 символов'),
    },
  })

  if (status === 'authenticated' && user) {
    return <Navigate to={user.is_approved ? homeFor(user.role) : '/pending'} replace />
  }

  const submit = form.onSubmit(async (vals) => {
    setLoading(true)
    try {
      const u = await login(vals.email, vals.password)
      navigate(u.is_approved ? homeFor(u.role) : '/pending', { replace: true })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Неверный email или пароль') })
    } finally {
      setLoading(false)
    }
  })

  return (
    <AuthScreen>
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <div>
            <Title order={3}>Вход</Title>
            <Text size="sm" c="dimmed">
              Учёт рабочего времени
            </Text>
          </div>
          <TextInput
            label="Email"
            placeholder="you@mtuci.ru"
            withAsterisk
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            withAsterisk
            {...form.getInputProps('password')}
          />
          <Button type="submit" size="md" fullWidth loading={loading}>
            Войти
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            Нет аккаунта?{' '}
            <Anchor component={Link} to="/register" fw={600}>
              Зарегистрироваться
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthScreen>
  )
}
