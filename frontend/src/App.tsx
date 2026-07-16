import { Badge, Center, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { Route, Routes } from 'react-router-dom'

import { api } from './api/client'

function Home() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<{ status: string }>('/health')).data,
  })

  return (
    <Center h="100vh">
      <Stack align="center" gap="xs">
        <Title order={1}>WorkTrack</Title>
        <Text c="dimmed">Учёт рабочего времени</Text>
        <Badge color={health.data?.status === 'ok' ? 'green' : 'red'}>
          API: {health.isLoading ? '…' : health.data?.status === 'ok' ? 'работает' : 'недоступен'}
        </Badge>
      </Stack>
    </Center>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}
