import { Badge, Card, Group, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core'
import { IconClockPause, IconMapPinOff, IconUsers } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useNowWorking, useUsers } from '../../api/admin'
import { usePendingRequests } from '../../api/requests'
import { useSummary } from '../../api/reports'
import { EmptyState } from '../../components/EmptyState'
import { StatCard } from '../../components/StatCard'

export default function Dashboard() {
  const start = dayjs().startOf('month').format('YYYY-MM-DD')
  const end = dayjs().endOf('month').format('YYYY-MM-DD')

  const nowWorking = useNowWorking()
  const users = useUsers()
  const pending = usePendingRequests()
  const summary = useSummary(start, end)

  const monthHours = summary.data?.reduce((s, r) => s + r.total_hours, 0) ?? 0

  // «Петров П.» вместо первого слова ФИО — иначе тёзки на графике неразличимы
  const shortName = (full: string) => {
    const [a, b] = full.trim().split(/\s+/)
    return b ? `${a} ${b[0]}.` : a
  }
  const chartData = (summary.data ?? [])
    .filter((r) => r.total_hours > 0)
    .sort((a, b) => b.total_hours - a.total_hours)
    .slice(0, 8)
    .map((r) => ({ name: shortName(r.full_name), hours: r.total_hours }))

  return (
    <Stack gap="lg">
      <Title order={2}>Дашборд</Title>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <StatCard label="Сейчас на работе" value={nowWorking.data?.length ?? '—'} />
        <StatCard label="Сотрудников" value={users.data?.length ?? '—'} />
        <StatCard label="Часов за месяц" value={Math.round(monthHours)} />
        <StatCard label="Заявок на рассмотрении" value={pending.data?.length ?? '—'} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Card p="lg">
          <Group justify="space-between" mb="md">
            <Text fw={700}>Кто на работе</Text>
            <Badge variant="light" color="mtuci">
              {nowWorking.data?.length ?? 0}
            </Badge>
          </Group>
          {nowWorking.isLoading ? (
            <Skeleton h={120} />
          ) : !nowWorking.data || nowWorking.data.length === 0 ? (
            <EmptyState icon={IconClockPause} title="Сейчас никто не отмечен" />
          ) : (
            <Stack gap="xs">
              {nowWorking.data.map((w) => (
                <Group key={w.user_id} justify="space-between" wrap="nowrap">
                  <Stack gap={0}>
                    <Text fw={600} size="sm">
                      {w.full_name}
                    </Text>
                    <Text size="xs" c="dimmed" className="tnum">
                      с {dayjs(w.check_in).format('HH:mm')}
                      {w.audience ? ` · ауд. ${w.audience}` : ''}
                    </Text>
                  </Stack>
                  {w.out_of_zone_in && (
                    <Badge variant="light" color="yellow" leftSection={<IconMapPinOff size={12} />}>
                      вне зоны
                    </Badge>
                  )}
                </Group>
              ))}
            </Stack>
          )}
        </Card>

        <Card p="lg">
          <Text fw={700} mb="md">
            Часы за месяц по сотрудникам
          </Text>
          {summary.isLoading ? (
            <Skeleton h={200} />
          ) : chartData.length === 0 ? (
            <EmptyState icon={IconUsers} title="Нет данных за месяц" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEECF6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F2F0FA' }}
                  formatter={(v) => [`${v} ч`, 'Часы']}
                />
                <Bar dataKey="hours" fill="#372579" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </SimpleGrid>

      {pending.data && pending.data.length > 0 && (
        <Card p="lg" component={Link} to="/admin/requests" style={{ textDecoration: 'none' }}>
          <Group justify="space-between">
            <Text fw={600}>
              Заявок на рассмотрении: {pending.data.length}
            </Text>
            <Text size="sm" c="mtuci.7" fw={600}>
              Перейти к ревью →
            </Text>
          </Group>
        </Card>
      )}
    </Stack>
  )
}
