import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconSearch, IconUserCheck } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useApproveUser, usePendingUsers, useUpdateUser, useUsers } from '../../api/admin'
import { errMsg } from '../../api/errors'
import type { Audience, Role, User } from '../../api/types'
import { AudienceFilter, type AudienceValue } from '../../components/AudienceFilter'
import { EmptyState } from '../../components/EmptyState'
import { AUDIENCE_OPTIONS, ROLE_LABEL, ROLE_OPTIONS } from '../../lib/labels'

interface FormValues {
  full_name: string
  role: Role
  audience: Audience | ''
  hire_date: string
}

export default function Employees() {
  const pending = usePendingUsers()
  const [audience, setAudience] = useState<AudienceValue>('all')
  const [search, setSearch] = useState('')
  const users = useUsers(audience === 'all' ? undefined : audience)
  const approve = useApproveUser()
  const update = useUpdateUser()

  const [mode, setMode] = useState<'approve' | 'edit'>('approve')
  const [target, setTarget] = useState<User | null>(null)
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm<FormValues>({
    initialValues: { full_name: '', role: 'worker', audience: '203', hire_date: '' },
    validate: {
      hire_date: (v) => (v ? null : 'Укажите дату трудоустройства'),
      audience: (v, values) =>
        values.role === 'admin' || v ? null : 'Выберите аудиторию',
    },
  })

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const data = users.data ?? []
    return q ? data.filter((u) => u.full_name.toLowerCase().includes(q)) : data
  }, [users.data, search])

  const startApprove = (u: User) => {
    setMode('approve')
    setTarget(u)
    form.setValues({ full_name: u.full_name, role: 'worker', audience: '203', hire_date: '' })
    open()
  }

  const startEdit = (u: User) => {
    setMode('edit')
    setTarget(u)
    form.setValues({
      full_name: u.full_name,
      role: u.role,
      audience: u.audience ?? '',
      hire_date: u.hire_date ?? '',
    })
    open()
  }

  const submit = form.onSubmit(async (vals) => {
    if (!target) return
    const audienceValue = vals.role === 'admin' ? null : (vals.audience as Audience)
    try {
      if (mode === 'approve') {
        await approve.mutateAsync({
          id: target.id,
          data: { role: vals.role, audience: audienceValue, hire_date: vals.hire_date },
        })
        notifications.show({ color: 'green', message: 'Пользователь одобрен' })
      } else {
        await update.mutateAsync({
          id: target.id,
          data: {
            full_name: vals.full_name,
            role: vals.role,
            audience: audienceValue,
            hire_date: vals.hire_date,
          },
        })
        notifications.show({ color: 'green', message: 'Данные обновлены' })
      }
      close()
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось сохранить') })
    }
  })

  const toggleActive = (u: User) =>
    modals.openConfirmModal({
      title: u.is_active ? 'Деактивировать аккаунт' : 'Активировать аккаунт',
      children: (
        <Text size="sm">
          {u.full_name}: {u.is_active ? 'вход будет заблокирован' : 'доступ будет восстановлен'}.
        </Text>
      ),
      labels: { confirm: u.is_active ? 'Деактивировать' : 'Активировать', cancel: 'Отмена' },
      confirmProps: { color: u.is_active ? 'red' : 'green' },
      onConfirm: async () => {
        try {
          await update.mutateAsync({ id: u.id, data: { is_active: !u.is_active } })
          notifications.show({ color: 'green', message: 'Статус обновлён' })
        } catch (e) {
          notifications.show({ color: 'red', message: errMsg(e, 'Не удалось обновить') })
        }
      },
    })

  return (
    <Stack gap="lg">
      <Title order={2}>Сотрудники</Title>

      {/* на одобрение */}
      {pending.data && pending.data.length > 0 && (
        <Card p="lg">
          <Text fw={700} mb="sm">
            На одобрении ({pending.data.length})
          </Text>
          <Stack gap="xs">
            {pending.data.map((u) => (
              <Group key={u.id} justify="space-between" wrap="wrap">
                <Stack gap={0}>
                  <Text fw={600} size="sm">
                    {u.full_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {u.email}
                  </Text>
                </Stack>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconUserCheck size={16} />}
                  onClick={() => startApprove(u)}
                >
                  Одобрить
                </Button>
              </Group>
            ))}
          </Stack>
        </Card>
      )}

      <Group gap="md" wrap="wrap" align="flex-end">
        <AudienceFilter value={audience} onChange={setAudience} />
        <TextInput
          placeholder="Поиск по ФИО"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={220}
        />
      </Group>

      {users.isLoading ? (
        <Skeleton h={240} radius="lg" />
      ) : rows.length === 0 ? (
        <EmptyState icon={IconSearch} title="Сотрудников не найдено" />
      ) : (
        <Table.ScrollContainer minWidth={720}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ФИО</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Роль</Table.Th>
                <Table.Th>Ауд.</Table.Th>
                <Table.Th>Трудоустройство</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.full_name}</Table.Td>
                  <Table.Td>{u.email}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="mtuci">
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{u.audience ?? '—'}</Table.Td>
                  <Table.Td>{u.hire_date ? dayjs(u.hire_date).format('DD.MM.YYYY') : '—'}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.is_active ? 'green' : 'gray'}>
                      {u.is_active ? 'активен' : 'отключён'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon variant="subtle" color="mtuci" onClick={() => startEdit(u)}>
                        <IconPencil size={20} />
                      </ActionIcon>
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        color={u.is_active ? 'red' : 'green'}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? 'Откл.' : 'Вкл.'}
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={mode === 'approve' ? 'Одобрение сотрудника' : 'Редактирование сотрудника'}
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <TextInput
              label="ФИО"
              disabled={mode === 'approve'}
              {...form.getInputProps('full_name')}
            />
            <Select
              label="Роль"
              data={ROLE_OPTIONS}
              allowDeselect={false}
              {...form.getInputProps('role')}
            />
            <Select
              label="Аудитория"
              data={AUDIENCE_OPTIONS}
              disabled={form.values.role === 'admin'}
              clearable
              {...form.getInputProps('audience')}
            />
            <DatePickerInput
              label="Дата трудоустройства"
              withAsterisk
              valueFormat="D MMMM YYYY"
              {...form.getInputProps('hire_date')}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                Отмена
              </Button>
              <Button type="submit" loading={approve.isPending || update.isPending}>
                {mode === 'approve' ? 'Одобрить' : 'Сохранить'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  )
}
