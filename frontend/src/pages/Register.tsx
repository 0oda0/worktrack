import { Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { errMsg } from '../api/errors'
import { homeFor, useAuth } from '../auth/AuthContext'
import { AuthScreen } from '../components/AuthScreen'

export default function Register() {
  const { user, status, register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: { full_name: '', email: '', password: '' },
    validate: {
      full_name: (v) => (v.trim().length >= 3 ? null : 'Укажите ФИО'),
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
      await register(vals.full_name.trim(), vals.email, vals.password)
      navigate('/pending', { replace: true })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось зарегистрироваться') })
    } finally {
      setLoading(false)
    }
  })

  return (
    <AuthScreen>
      <form onSubmit={submit} noValidate>
        <Stack gap="md">
          <div>
            <Title order={3}>Регистрация</Title>
            <Text size="sm" c="dimmed">
              После регистрации аккаунт одобрит администратор
            </Text>
          </div>
          <TextInput
            label="ФИО"
            placeholder="Иванов Иван Иванович"
            withAsterisk
            {...form.getInputProps('full_name')}
          />
          <TextInput
            label="Email"
            placeholder="you@mtuci.ru"
            withAsterisk
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Минимум 6 символов"
            withAsterisk
            {...form.getInputProps('password')}
          />
          <Button type="submit" size="md" fullWidth loading={loading}>
            Зарегистрироваться
          </Button>
          <Text size="sm" c="dimmed" ta="center">
            Уже есть аккаунт?{' '}
            <Anchor component={Link} to="/login" fw={600}>
              Войти
            </Anchor>
          </Text>
        </Stack>
      </form>
    </AuthScreen>
  )
}
