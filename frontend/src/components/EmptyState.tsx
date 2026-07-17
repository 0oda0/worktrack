import { Card, Stack, Text, ThemeIcon } from '@mantine/core'
import type { Icon } from '@tabler/icons-react'
import type { ReactNode } from 'react'

/** Контурная пиктограмма + текст — единое пустое состояние для data-экранов. */
export function EmptyState({
  icon: Icon,
  title,
  children,
}: {
  icon: Icon
  title: string
  children?: ReactNode
}) {
  return (
    <Card p="xl">
      <Stack align="center" gap="xs" py="lg">
        <ThemeIcon variant="light" color="mtuci" size={52} radius="xl">
          <Icon size={26} stroke={1.75} />
        </ThemeIcon>
        <Text fw={600}>{title}</Text>
        {children && (
          <Text size="sm" c="dimmed" ta="center" maw={360}>
            {children}
          </Text>
        )}
      </Stack>
    </Card>
  )
}
