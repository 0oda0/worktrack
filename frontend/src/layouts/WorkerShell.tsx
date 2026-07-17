import { AppShell, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconCalendarStats, IconClockHour9, IconFileDescription } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'

interface Tab {
  to: string
  label: string
  icon: Icon
}

const TABS: Tab[] = [
  { to: '/', label: 'Отметка', icon: IconClockHour9 },
  { to: '/timesheet', label: 'Табель', icon: IconCalendarStats },
  { to: '/requests', label: 'Заявки', icon: IconFileDescription },
]

export function WorkerShell() {
  const { pathname } = useLocation()

  return (
    <AppShell header={{ height: 60 }} footer={{ height: 68 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Logo height={30} />
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <Outlet />
        </div>
      </AppShell.Main>

      <AppShell.Footer>
        <Group h="100%" grow gap={0}>
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            const color = active ? 'var(--mantine-color-mtuci-7)' : 'var(--mantine-color-gray-5)'
            return (
              <UnstyledButton key={to} component={Link} to={to} h="100%" aria-current={active ? 'page' : undefined}>
                <Stack gap={2} align="center" justify="center" h="100%">
                  <Icon size={24} stroke={1.75} color={color} />
                  <Text size="xs" fw={active ? 700 : 500} c={active ? 'mtuci.7' : 'dimmed'}>
                    {label}
                  </Text>
                </Stack>
              </UnstyledButton>
            )
          })}
        </Group>
      </AppShell.Footer>
    </AppShell>
  )
}
