import { Card, Text } from '@mantine/core'

/** Белая карточка: крупное число mtuci.7 + подпись. Табель, дашборд-KPI, сводка. */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card p="md">
      <Text fw={700} fz={28} lh={1.1} c="mtuci.7" className="tnum">
        {value}
      </Text>
      <Text size="sm" c="dimmed" mt={4}>
        {label}
      </Text>
    </Card>
  )
}
