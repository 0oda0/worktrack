import { Badge, Group, Skeleton, Stack, Table, Text, Title } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { IconTrophy } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { useRating } from '../../api/reports'
import { AudienceFilter, type AudienceValue } from '../../components/AudienceFilter'
import { EmptyState } from '../../components/EmptyState'

export default function Rating() {
  const [audience, setAudience] = useState<AudienceValue>('all')
  const [month, setMonth] = useState<string>(dayjs().format('YYYY-MM-DD'))

  const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const end = dayjs(month).endOf('month').format('YYYY-MM-DD')
  const rating = useRating(start, end, audience === 'all' ? undefined : audience)

  return (
    <Stack gap="lg">
      <Title order={2}>Рейтинг</Title>

      <Group gap="md" wrap="wrap" align="flex-end">
        <AudienceFilter value={audience} onChange={setAudience} />
        <MonthPickerInput
          value={month}
          onChange={(v) => v && setMonth(v)}
          valueFormat="MMMM YYYY"
          w={180}
        />
      </Group>

      {rating.isLoading ? (
        <Skeleton h={240} radius="lg" />
      ) : !rating.data || rating.data.length === 0 ? (
        <EmptyState icon={IconTrophy} title="Нет данных за период">
          Балл считается по переработкам, часам и опозданиям за месяц.
        </EmptyState>
      ) : (
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={64}>#</Table.Th>
                <Table.Th>ФИО</Table.Th>
                <Table.Th>Ауд.</Table.Th>
                <Table.Th>Часы</Table.Th>
                <Table.Th>Переработка</Table.Th>
                <Table.Th>Выходные</Table.Th>
                <Table.Th>Опоздания</Table.Th>
                <Table.Th>Балл</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rating.data.map((r, i) => {
                const top = i < 3
                return (
                  <Table.Tr key={r.user_id} bg={top ? 'mtuci.0' : undefined}>
                    <Table.Td>
                      <Badge size="lg" circle variant={top ? 'filled' : 'light'} color="mtuci">
                        {i + 1}
                      </Badge>
                    </Table.Td>
                    <Table.Td fw={top ? 700 : 500}>{r.full_name}</Table.Td>
                    <Table.Td>{r.audience ?? '—'}</Table.Td>
                    <Table.Td className="tnum">{r.total_hours}</Table.Td>
                    <Table.Td className="tnum">{r.overtime}</Table.Td>
                    <Table.Td className="tnum">{r.weekend_hours}</Table.Td>
                    <Table.Td className="tnum">{r.lateness}</Table.Td>
                    <Table.Td>
                      <Text fw={700} c="mtuci.7" className="tnum">
                        {r.score}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  )
}
