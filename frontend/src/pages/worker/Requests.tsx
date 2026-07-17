import { Button, Card, Group, Skeleton, Stack, Text, Textarea } from '@mantine/core'
import { DatePickerInput, TimeInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconFileOff } from '@tabler/icons-react'
import dayjs from 'dayjs'

import { useCreateRequest, useMyRequests } from '../../api/requests'
import { errMsg } from '../../api/errors'
import { EmptyState } from '../../components/EmptyState'
import { RequestStatusBadge } from '../../components/StatusBadge'

const today = () => dayjs().format('YYYY-MM-DD')

interface FormValues {
  work_date: string
  check_in: string
  check_out: string
  comment: string
}

export default function Requests() {
  const list = useMyRequests()
  const create = useCreateRequest()

  const form = useForm<FormValues>({
    initialValues: { work_date: today(), check_in: '', check_out: '', comment: '' },
    validate: {
      work_date: (v) => (v ? null : 'Укажите дату'),
      check_in: (v) => (v ? null : 'Укажите время прихода'),
      check_out: (v, values) => {
        const past = values.work_date < today()
        if (!past) return null // сегодня — уход не указывается
        if (!v) return 'Для прошедшей даты укажите время ухода'
        if (values.check_in && v <= values.check_in) return 'Уход должен быть позже прихода'
        return null
      },
    },
  })

  const past = form.values.work_date < today()

  const submit = form.onSubmit(async (vals) => {
    try {
      await create.mutateAsync({
        work_date: vals.work_date,
        check_in: `${vals.work_date}T${vals.check_in}:00`,
        check_out: past && vals.check_out ? `${vals.work_date}T${vals.check_out}:00` : null,
        comment: vals.comment || undefined,
      })
      notifications.show({ color: 'green', message: 'Заявка отправлена на рассмотрение' })
      form.reset()
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось отправить заявку') })
    }
  })

  return (
    <Stack gap="lg">
      <Card p="lg">
        <form onSubmit={submit}>
          <Stack gap="md">
            <Text fw={700} fz="lg">
              Ручная отметка
            </Text>

            <DatePickerInput
              label="Дата"
              withAsterisk
              maxDate={new Date()}
              valueFormat="D MMMM YYYY"
              value={form.values.work_date}
              onChange={(v) => form.setFieldValue('work_date', v ?? today())}
              error={form.errors.work_date}
            />

            <TimeInput label="Время прихода" withAsterisk {...form.getInputProps('check_in')} />

            {past ? (
              <TimeInput label="Время ухода" withAsterisk {...form.getInputProps('check_out')} />
            ) : (
              <Text size="sm" c="dimmed">
                Смена за сегодня закроется кнопкой «Ушёл» на вкладке «Отметка».
              </Text>
            )}

            <Textarea
              label="Комментарий"
              placeholder="Необязательно"
              autosize
              minRows={2}
              {...form.getInputProps('comment')}
            />

            <Button type="submit" loading={create.isPending}>
              Отправить заявку
            </Button>
          </Stack>
        </form>
      </Card>

      {list.isLoading ? (
        <Skeleton h={120} radius="lg" />
      ) : list.isError ? (
        <EmptyState icon={IconFileOff} title="Не удалось загрузить заявки">
          Обновите страницу.
        </EmptyState>
      ) : !list.data ? null : list.data.length === 0 ? (
        <EmptyState icon={IconFileOff} title="Заявок пока нет">
          Создайте ручную отметку в форме выше.
        </EmptyState>
      ) : (
        <Stack gap="xs">
          <Text fw={600}>Мои заявки</Text>
          {list.data.map((r) => (
            <Card key={r.id} p="sm">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={2}>
                  <Text fw={600}>{dayjs(r.work_date).format('D MMMM YYYY')}</Text>
                  <Text size="sm" c="dimmed" className="tnum">
                    {dayjs(r.check_in).format('HH:mm')}
                    {r.check_out ? ` — ${dayjs(r.check_out).format('HH:mm')}` : ''}
                  </Text>
                  {r.comment && (
                    <Text size="xs" c="dimmed">
                      {r.comment}
                    </Text>
                  )}
                  {r.review_comment && (
                    <Text size="xs" c="dimmed">
                      Ответ: {r.review_comment}
                    </Text>
                  )}
                </Stack>
                <RequestStatusBadge status={r.status} />
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
