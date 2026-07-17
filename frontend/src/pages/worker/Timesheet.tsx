import { Badge, Card, Group, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { IconCalendarOff } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { useTimesheet } from '../../api/attendance'
import { useAuth } from '../../auth/AuthContext'
import { EmptyState } from '../../components/EmptyState'
import { StatCard } from '../../components/StatCard'

export default function Timesheet() {
  const { user } = useAuth()
  const [month, setMonth] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const end = dayjs(month).endOf('month').format('YYYY-MM-DD')
  const ts = useTimesheet(start, end)

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <MonthPickerInput
          label="Период"
          value={month}
          onChange={(v) => v && setMonth(v)}
          maxDate={new Date()}
          valueFormat="MMMM YYYY"
          w={200}
        />
        {user?.hire_date && (
          <Text size="sm" c="dimmed">
            Дата трудоустройства: {dayjs(user.hire_date).format('D MMMM YYYY')}
          </Text>
        )}
      </Group>

      {ts.isLoading ? (
        <Skeleton h={104} radius="lg" />
      ) : ts.isError ? (
        <EmptyState icon={IconCalendarOff} title="Не удалось загрузить табель">
          Обновите страницу или выберите другой период.
        </EmptyState>
      ) : !ts.data ? null : (
        <>
          <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
            <StatCard label="Всего часов" value={ts.data.stats.total_hours} />
            <StatCard label="Норма (9ч)" value={ts.data.stats.work_hours} />
            <StatCard label="Оплачиваемые (8ч)" value={ts.data.stats.paid_hours} />
            <StatCard label="Переработка" value={ts.data.stats.overtime} />
            <StatCard label="Выходные" value={ts.data.stats.weekend_hours} />
          </SimpleGrid>

          {ts.data.days.length === 0 ? (
            <EmptyState icon={IconCalendarOff} title="Нет отметок за период">
              Выберите другой месяц или отметьтесь на вкладке «Отметка».
            </EmptyState>
          ) : (
            <Stack gap="xs">
              {ts.data.days.map((d) => (
                <Card key={d.date} p="sm">
                  <Group justify="space-between" wrap="nowrap" align="center">
                    <Stack gap={2}>
                      <Text fw={600} tt="capitalize">
                        {dayjs(d.date).format('dd, D MMM')}
                      </Text>
                      <Text size="sm" c="dimmed" className="tnum">
                        {dayjs(d.check_in).format('HH:mm')} —{' '}
                        {d.check_out ? dayjs(d.check_out).format('HH:mm') : '…'}
                      </Text>
                    </Stack>
                    <Group gap="xs" wrap="wrap" justify="flex-end">
                      {d.is_weekend && (
                        <Badge variant="light" color="mtuci">
                          выходной
                        </Badge>
                      )}
                      {d.is_manual && (
                        <Badge variant="light" color="mtuci">
                          ручная
                        </Badge>
                      )}
                      {d.out_of_zone_in && (
                        <Badge variant="light" color="yellow">
                          вне зоны
                        </Badge>
                      )}
                      <Text fw={700} c="mtuci.7" className="tnum">
                        {d.hours} ч
                      </Text>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
