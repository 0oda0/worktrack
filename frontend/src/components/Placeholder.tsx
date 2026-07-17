import { Card, Stack, Text, ThemeIcon, Title } from '@mantine/core'
import { IconTool } from '@tabler/icons-react'

// ponytail: единый плейсхолдер для экранов F2–F4, заменяется реальными страницами по спринтам.
export function Placeholder({ title }: { title: string }) {
  return (
    <Stack gap="lg">
      <Title order={2}>{title}</Title>
      <Card p="xl">
        <Stack align="center" gap="sm" py="xl">
          <ThemeIcon variant="light" color="mtuci" size={56} radius="xl">
            <IconTool size={28} stroke={1.75} />
          </ThemeIcon>
          <Text c="dimmed">Раздел появится в следующем спринте</Text>
        </Stack>
      </Card>
    </Stack>
  )
}
