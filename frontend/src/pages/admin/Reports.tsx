import { Button, Group, Skeleton, Stack, Table, Title } from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { IconDownload, IconReportAnalytics } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { errMsg } from '../../api/errors'
import { downloadReportXlsx, useSummary } from '../../api/reports'
import { AudienceFilter, type AudienceValue } from '../../components/AudienceFilter'
import { EmptyState } from '../../components/EmptyState'

export default function Reports() {
  const [audience, setAudience] = useState<AudienceValue>('all')
  const [month, setMonth] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [downloading, setDownloading] = useState(false)

  const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
  const end = dayjs(month).endOf('month').format('YYYY-MM-DD')
  const aud = audience === 'all' ? undefined : audience
  const summary = useSummary(start, end, aud)

  const download = async () => {
    setDownloading(true)
    try {
      await downloadReportXlsx(start, end, aud)
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось скачать отчёт') })
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Title order={2}>Отчёты</Title>
        <Button
          leftSection={<IconDownload size={18} />}
          onClick={download}
          loading={downloading}
          disabled={!summary.data?.length}
        >
          Скачать Excel
        </Button>
      </Group>

      <Group gap="md" wrap="wrap" align="flex-end">
        <AudienceFilter value={audience} onChange={setAudience} />
        <MonthPickerInput
          value={month}
          onChange={(v) => v && setMonth(v)}
          valueFormat="MMMM YYYY"
          w={180}
        />
      </Group>

      {summary.isLoading ? (
        <Skeleton h={240} radius="lg" />
      ) : !summary.data || summary.data.length === 0 ? (
        <EmptyState icon={IconReportAnalytics} title="Нет данных за период">
          Выберите другой месяц или аудиторию.
        </EmptyState>
      ) : (
        <Table.ScrollContainer minWidth={820}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ФИО</Table.Th>
                <Table.Th>Ауд.</Table.Th>
                <Table.Th>Трудоустройство</Table.Th>
                <Table.Th>Всего</Table.Th>
                <Table.Th>Норма 9ч</Table.Th>
                <Table.Th>Оплач. 8ч</Table.Th>
                <Table.Th>Переработка</Table.Th>
                <Table.Th>Выходные</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {summary.data.map((r) => (
                <Table.Tr key={r.user_id}>
                  <Table.Td>{r.full_name}</Table.Td>
                  <Table.Td>{r.audience ?? '—'}</Table.Td>
                  <Table.Td>{r.hire_date ? dayjs(r.hire_date).format('DD.MM.YYYY') : '—'}</Table.Td>
                  <Table.Td className="tnum">{r.total_hours}</Table.Td>
                  <Table.Td className="tnum">{r.work_hours}</Table.Td>
                  <Table.Td className="tnum">{r.paid_hours}</Table.Td>
                  <Table.Td className="tnum">{r.overtime}</Table.Td>
                  <Table.Td className="tnum">{r.weekend_hours}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Stack>
  )
}
