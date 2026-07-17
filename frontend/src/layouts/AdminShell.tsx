import { AppShell, Burger, Group, MantineProvider, NavLink, ScrollArea } from '@mantine/core'
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

// desktop-scale дефолты для содержимого админки (не задевают WorkerShell/AuthScreen)
const adminComponents = {
  Button: { defaultProps: { size: 'md' } },
  ActionIcon: { defaultProps: { size: 'lg' } },
  TextInput: { defaultProps: { size: 'md' } },
  PasswordInput: { defaultProps: { size: 'md' } },
  Select: { defaultProps: { size: 'md' } },
  Textarea: { defaultProps: { size: 'md' } },
  DatePickerInput: { defaultProps: { size: 'md' } },
  MonthPickerInput: { defaultProps: { size: 'md' } },
  TimeInput: { defaultProps: { size: 'md' } },
} as const

export function AdminShell() {
  const [opened, { toggle, close }] = useDisclosure()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const role = user?.role

  const items = NAV.filter((i) => !i.roles || (role && i.roles.includes(role)))

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 280, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="xl"
    >
      <AppShell.Header>
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="md" />
            <Logo height={40} />
          </Group>
          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <ScrollArea>
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <NavLink
                key={to}
                component={Link}
                to={to}
                label={label}
                leftSection={<Icon size={22} stroke={1.75} />}
                active={active}
                color="mtuci"
                variant="light"
                onClick={close}
                mb={6}
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
              />
            )
          })}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <MantineProvider theme={{ components: adminComponents }} withCssVariables={false}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <Outlet />
          </div>
        </MantineProvider>
      </AppShell.Main>
    </AppShell>
  )
}
