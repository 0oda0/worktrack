import { Box, Center, Paper, Stack } from '@mantine/core'
import type { ReactNode } from 'react'

import { BrandPattern } from './BrandPattern'
import { Logo } from './Logo'

/** Центрированная карточка на белом фоне с фирменным паттерном — для Login/Register/Pending. */
export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <Box style={{ position: 'relative', minHeight: '100vh', background: '#fff', overflow: 'hidden' }}>
      <BrandPattern />
      <Center mih="100vh" p="md" style={{ position: 'relative', zIndex: 1 }}>
        <Stack w="100%" maw={400} gap="lg">
          <Center>
            <Logo height={52} />
          </Center>
          <Paper p="xl" shadow="sm" withBorder>
            {children}
          </Paper>
        </Stack>
      </Center>
    </Box>
  )
}
