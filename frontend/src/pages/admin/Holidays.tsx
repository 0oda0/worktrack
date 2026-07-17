import {
  ActionIcon,
  Button,
  Card,
  Group,
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
import { notifications } from '@mantine/notifications'
import { IconCalendarEvent, IconPlus, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { errMsg } from '../../api/errors'
import { useAddHoliday, useDeleteHoliday, useHolidays } from '../../api/holidays'
import type { Holiday } from '../../api/types'
import { EmptyState } from '../../components/EmptyState'

export default function Holidays() {
  const list = useHolidays()
  const add = useAddHoliday()
  const del = useDeleteHoliday()

  const form = useForm<{ date: string | null; name: string }>({
    initialValues: { date: null, name: '' },
    validate: {
      date: (v) => (v ? null : 'Укажите дату'),
      name: (v) => (v.trim() ? null : 'Укажите название'),
    },
  })

  const submit = form.onSubmit(async (vals) => {
    try {
      await add.mutateAsync({ date: vals.date as string, name: vals.name.trim() })
      notifications.show({ color: 'green', message: 'Праздник добавлен' })
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось добавить') })
    }
  })

  const confirmDelete = (h: Holiday) =>
    modals.openConfirmModal({
      title: 'Удалить праздник',
      children: (
        <Text size="sm">
          {h.name} ({dayjs(h.date).format('D MMMM YYYY')}) будет удалён.
        </Text>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отмена' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await del.mutateAsync(h.id)
          notifications.show({ color: 'green', message: 'Праздник удалён' })
        } catch (e) {
          notifications.show({ color: 'red', message: errMsg(e, 'Не удалось удалить') })
        }
      },
    })

  return (
    <Stack gap="lg">
      <Title order={2}>Праздники</Title>

      <Card p="lg">
        <form onSubmit={submit}>
          <Group align="flex-end" gap="md" wrap="wrap">
            <DatePickerInput
              label="Дата"
              withAsterisk
              valueFormat="D MMMM YYYY"
              w={200}
              {...form.getInputProps('date')}
            />
            <TextInput
              label="Название"
              placeholder="Напр. День России"
              w={260}
              {...form.getInputProps('name')}
            />
            <Button type="submit" leftSection={<IconPlus size={18} />} loading={add.isPending}>
              Добавить
            </Button>
          </Group>
        </form>
      </Card>

      {list.isLoading ? (
        <Skeleton h={160} radius="lg" />
      ) : !list.data || list.data.length === 0 ? (
        <EmptyState icon={IconCalendarEvent} title="Праздников пока нет">
          Добавьте нерабочие дни — они исключаются из нормы и считаются отдельным счётчиком.
        </EmptyState>
      ) : (
        <Table.ScrollContainer minWidth={400}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Название</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {list.data.map((h) => (
                <Table.Tr key={h.id}>
                  <Table.Td className="tnum">{dayjs(h.date).format('DD.MM.YYYY')}</Table.Td>
                  <Table.Td>{h.name}</Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      aria-label="Удалить праздник"
                      onClick={() => confirmDelete(h)}
                    >
                      <IconTrash size={20} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  )
}
