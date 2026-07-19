import { Badge, Card, Group, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { IconCalendarOff } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useTimesheet } from '../../api/attendance'
import { useAuth } from '../../auth/AuthContext'
import { EmptyState } from '../../components/EmptyState'
import { StatCard } from '../../components/StatCard'
import type { TimesheetDay } from '../../api/types'

export default function Timesheet() {
  const { user } = useAuth()
  const [month, setMonth] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const end = dayjs(month).endOf('month').format('YYYY-MM-DD')
  const ts = useTimesheet(start, end)

  // несколько смен за день группируем под одной датой (без дублей заголовка)
  const byDate = useMemo(() => {
    const m = new Map<string, TimesheetDay[]>()
    for (const d of ts.data?.days ?? []) {
      const g = m.get(d.date)
      if (g) g.push(d)
      else m.set(d.date, [d])
    }
    return [...m.entries()]
  }, [ts.data])

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
          {/* колонки по ширине КОНТЕЙНЕРА, а не окна: у работника колонка 520px,
              у руководителя в «Моей смене» — широкая. Иначе карточки схлопываются
              до ~90px и крупные числа обрезаются. */}
          <SimpleGrid type="container" cols={{ base: 2, '600px': 3, '900px': 5 }} spacing="md">
            <StatCard label="Всего часов" value={ts.data.stats.total_hours} />
            <StatCard label="Норма (9ч)" value={ts.data.stats.work_hours} />
            <StatCard label="Оплачиваемые (8ч)" value={ts.data.stats.paid_hours} />
            <StatCard label="Переработка" value={ts.data.stats.overtime} />
            <StatCard label="Выходные" value={ts.data.stats.weekend_hours} />
          </SimpleGrid>

          {byDate.length === 0 ? (
            <EmptyState icon={IconCalendarOff} title="Нет отметок за период">
              Выберите другой месяц или отметьтесь на вкладке «Отметка».
            </EmptyState>
          ) : (
            <Stack gap="xs">
              {byDate.map(([date, shifts]) => {
                const isWeekend = shifts[0].is_weekend
                const dayTotal = Math.round(shifts.reduce((s, d) => s + d.hours, 0) * 100) / 100
                return (
                  <Card key={date} p="sm">
                    <Group justify="space-between" mb={6} wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <Text fw={600}>
                          {(() => {
                            const s = dayjs(date).format('dd, D MMMM')
                            return s.charAt(0).toUpperCase() + s.slice(1)
                          })()}
                        </Text>
                        {isWeekend && (
                          <Badge variant="light" color="mtuci">
                            выходной
                          </Badge>
                        )}
                      </Group>
                      {shifts.length > 1 && (
                        <Text fw={700} c="mtuci.7" className="tnum">
                          {dayTotal} ч
                        </Text>
                      )}
                    </Group>
                    <Stack gap={6}>
                      {shifts.map((d, i) => (
                        <Group key={i} justify="space-between" wrap="nowrap" align="center">
                          <Text size="sm" c="dimmed" className="tnum">
                            {dayjs(d.check_in).format('HH:mm')} —{' '}
                            {d.check_out ? dayjs(d.check_out).format('HH:mm') : '…'}
                            {d.check_out && !dayjs(d.check_out).isSame(dayjs(d.check_in), 'day') && (
                              <Text component="sup" size="xs" title="Уход на следующий день">
                                {' '}
                                +1
                              </Text>
                            )}
                          </Text>
                          <Group gap="xs" wrap="wrap" justify="flex-end">
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
                      ))}
                    </Stack>
                  </Card>
                )
              })}
            </Stack>
          )}
        </>
      )}
    </Stack>
  )
}
