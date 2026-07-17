import { AppShell, Burger, Group, NavLink, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCalendarEvent,
  IconChartBar,
  IconClipboardList,
  IconFileDescription,
  IconLayoutDashboard,
  IconClockCheck,
  IconSettings,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import type { Role } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'

interface NavItem {
  to: string
  label: string
  icon: Icon
  roles?: Role[] // undefined → всем (admin+leader); иначе только указанным
}

const NAV: NavItem[] = [
  { to: '/admin', label: 'Дашборд', icon: IconLayoutDashboard },
  { to: '/admin/records', label: 'Отметки', icon: IconClipboardList },
  { to: '/admin/requests', label: 'Заявки', icon: IconFileDescription },
  { to: '/admin/reports', label: 'Отчёты', icon: IconChartBar },
  { to: '/admin/rating', label: 'Рейтинг', icon: IconTrophy },
  { to: '/admin/me', label: 'Моя смена', icon: IconClockCheck, roles: ['leader'] },
  { to: '/admin/employees', label: 'Сотрудники', icon: IconUsers, roles: ['admin'] },
  { to: '/admin/holidays', label: 'Праздники', icon: IconCalendarEvent, roles: ['admin'] },
  { to: '/admin/settings', label: 'Настройки', icon: IconSettings, roles: ['admin'] },
]

export function AdminShell() {
  const [opened, { toggle, close }] = useDisclosure()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const role = user?.role

  const items = NAV.filter((i) => !i.roles || (role && i.roles.includes(role)))

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 264, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Logo height={28} />
          </Group>
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <ScrollArea>
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <NavLink
                key={to}
                component={Link}
                to={to}
                label={label}
                leftSection={<Icon size={20} stroke={1.75} />}
                active={active}
                color="mtuci"
                variant="light"
                onClick={close}
                mb={4}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
            )
          })}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
