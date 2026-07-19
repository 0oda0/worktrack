import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { MonthPickerInput, TimeInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconMapPin, IconPencil, IconSearch, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useDeleteRecord, useRecords, useUpdateRecord } from '../../api/admin'
import { errMsg } from '../../api/errors'
import type { AdminRecord } from '../../api/types'
import { AudienceFilter, type AudienceValue } from '../../components/AudienceFilter'
import { EmptyState } from '../../components/EmptyState'

type SortField = 'work_date' | 'full_name' | 'audience'

function recordHours(r: AdminRecord): number | null {
  if (!r.check_out) return null
  return Math.round(((new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 3600000) * 100) / 100
}

/** Уход пришёлся на следующий календарный день (ночная смена). */
function isOvernight(r: AdminRecord): boolean {
  return !!r.check_out && !dayjs(r.check_out).isSame(dayjs(r.check_in), 'day')
}

export default function Records() {
  const [audience, setAudience] = useState<AudienceValue>('all')
  const [month, setMonth] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ field: SortField; dir: 'asc' | 'desc' }>({
    field: 'work_date',
    dir: 'desc',
  })

  const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const end = dayjs(month).endOf('month').format('YYYY-MM-DD')
  const records = useRecords({
    audience: audience === 'all' ? undefined : audience,
    start,
    end,
  })

  const updateRec = useUpdateRecord()
  const deleteRec = useDeleteRecord()

  const [editing, setEditing] = useState<AdminRecord | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const form = useForm({
    initialValues: { check_in: '', check_out: '', next_day: false, comment: '' },
  })

  const rows = useMemo(() => {
    let data = records.data ?? []
    const q = search.trim().toLowerCase()
    if (q) data = data.filter((r) => r.full_name.toLowerCase().includes(q))
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = a[sort.field] ?? ''
      const bv = b[sort.field] ?? ''
      return dir * String(av).localeCompare(String(bv), 'ru')
    })
  }, [records.data, search, sort])

  const toggleSort = (field: SortField) =>
    setSort((s) => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }))

  const startEdit = (r: AdminRecord) => {
    setEditing(r)
    form.setValues({
      check_in: dayjs(r.check_in).format('HH:mm'),
      check_out: r.check_out ? dayjs(r.check_out).format('HH:mm') : '',
      next_day: isOvernight(r),
      comment: r.comment ?? '',
    })
    open()
  }

  const saveEdit = form.onSubmit(async (vals) => {
    if (!editing) return
    const outDate = vals.next_day
      ? dayjs(editing.work_date).add(1, 'day').format('YYYY-MM-DD')
      : editing.work_date
    try {
      await updateRec.mutateAsync({
        id: editing.id,
        data: {
          check_in: `${editing.work_date}T${vals.check_in}:00`,
          check_out: vals.check_out ? `${outDate}T${vals.check_out}:00` : null,
          comment: vals.comment,
        },
      })
      notifications.show({ color: 'green', message: 'Отметка обновлена' })
      close()
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось сохранить') })
    }
  })

  const confirmDelete = (r: AdminRecord) =>
    modals.openConfirmModal({
      title: 'Удалить отметку',
      children: (
        <Text size="sm">
          Отметка {r.full_name} за {dayjs(r.work_date).format('D MMMM YYYY')} будет удалена.
        </Text>
      ),
      labels: { confirm: 'Удалить', cancel: 'Отмена' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteRec.mutateAsync(r.id)
          notifications.show({ color: 'green', message: 'Отметка удалена' })
        } catch (e) {
          notifications.show({ color: 'red', message: errMsg(e, 'Не удалось удалить') })
        }
      },
    })

  const th = (label: string, field: SortField) => (
    <Table.Th
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-sort={sort.field === field ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      onClick={() => toggleSort(field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleSort(field)
        }
      }}
    >
      {label}
      {sort.field === field ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
    </Table.Th>
  )

  return (
    <Stack gap="lg">
      <Title order={2}>Отметки</Title>

      <Group gap="md" wrap="wrap" align="flex-end">
        <AudienceFilter value={audience} onChange={setAudience} />
        <MonthPickerInput
          value={month}
          onChange={(v) => v && setMonth(v)}
          valueFormat="MMMM YYYY"
          w={180}
        />
        <TextInput
          placeholder="Поиск по ФИО"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={220}
        />
      </Group>

      {records.isLoading ? (
        <Skeleton h={240} radius="lg" />
      ) : rows.length === 0 ? (
        <EmptyState icon={IconSearch} title="Отметок не найдено">
          Измените период, аудиторию или запрос.
        </EmptyState>
      ) : (
        <Table.ScrollContainer minWidth={760}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                {th('Дата', 'work_date')}
                {th('ФИО', 'full_name')}
                {th('Ауд.', 'audience')}
                <Table.Th>Приход</Table.Th>
                <Table.Th>Уход</Table.Th>
                <Table.Th ta="right">Часы</Table.Th>
                <Table.Th>Метки</Table.Th>
                <Table.Th>Гео</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => {
                const hours = recordHours(r)
                return (
                  <Table.Tr key={r.id}>
                    <Table.Td>{dayjs(r.work_date).format('DD.MM.YY')}</Table.Td>
                    <Table.Td>{r.full_name}</Table.Td>
                    <Table.Td>{r.audience ?? '—'}</Table.Td>
                    <Table.Td className="tnum">{dayjs(r.check_in).format('HH:mm')}</Table.Td>
                    <Table.Td className="tnum">
                      {r.check_out ? (
                        <>
                          {dayjs(r.check_out).format('HH:mm')}
                          {isOvernight(r) && (
                            <Text component="sup" size="xs" c="dimmed" title="Уход на следующий день">
                              {' '}
                              +1
                            </Text>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </Table.Td>
                    <Table.Td ta="right" className="tnum">{hours ?? '—'}</Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        {r.is_manual && (
                          <Badge size="sm" variant="light" color="mtuci">
                            ручная
                          </Badge>
                        )}
                        {r.out_of_zone_in && (
                          <Badge size="sm" variant="light" color="yellow">
                            вне зоны
                          </Badge>
                        )}
                        {!r.check_out && dayjs(r.work_date).isBefore(dayjs(), 'day') && (
                          <Badge size="sm" variant="light" color="red">
                            не закрыта
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {r.lat_in != null && r.lng_in != null ? (
                        <Anchor
                          href={`https://www.openstreetmap.org/?mlat=${r.lat_in}&mlon=${r.lng_in}#map=17/${r.lat_in}/${r.lng_in}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Показать место отметки на карте"
                        >
                          <IconMapPin size={18} />
                        </Anchor>
                      ) : (
                        '—'
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          variant="subtle"
                          color="mtuci"
                          aria-label="Редактировать отметку"
                          onClick={() => startEdit(r)}
                        >
                          <IconPencil size={20} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Удалить отметку"
                          onClick={() => confirmDelete(r)}
                        >
                          <IconTrash size={20} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Modal opened={opened} onClose={close} title="Редактировать отметку" centered>
        {editing && (
          <form onSubmit={saveEdit}>
            <Stack>
              <Text size="sm" c="dimmed">
                {editing.full_name} · {dayjs(editing.work_date).format('D MMMM YYYY')}
              </Text>
              <TimeInput label="Приход" withAsterisk {...form.getInputProps('check_in')} />
              <TimeInput
                label="Уход"
                description="Пусто — смена останется открытой"
                {...form.getInputProps('check_out')}
              />
              <Checkbox
                label="Уход на следующий день (ночная смена)"
                disabled={!form.values.check_out}
                {...form.getInputProps('next_day', { type: 'checkbox' })}
              />
              <Textarea label="Комментарий" autosize minRows={2} {...form.getInputProps('comment')} />
              <Group justify="flex-end">
                <Button variant="default" onClick={close}>
                  Отмена
                </Button>
                <Button type="submit" loading={updateRec.isPending}>
                  Сохранить
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Stack>
  )
}
