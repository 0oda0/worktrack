import { AppShell, Burger, Group, MantineProvider, NavLink, ScrollArea, Tooltip } from '@mantine/core'
import { useDisclosure, useLocalStorage } from '@mantine/hooks'
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
  // моб. оверлей и десктоп-сворачивание — независимы; выбор на десктопе запоминаем
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const [desktopExpanded, setDesktopExpanded] = useLocalStorage({
    key: 'worktrack-nav-expanded',
    defaultValue: true,
    getInitialValueInEffect: false, // читаем сразу — без мигания при загрузке
  })
  const { pathname } = useLocation()
  const { user } = useAuth()
  const role = user?.role

  const items = NAV.filter((i) => !i.roles || (role && i.roles.includes(role)))

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened, desktop: !desktopExpanded },
      }}
      padding="xl"
      transitionDuration={200}
      transitionTimingFunction="cubic-bezier(0.32, 0.72, 0, 1)"
    >
      <AppShell.Header>
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="md">
            {/* мобильный: открывает/закрывает выезжающее меню */}
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="md"
              size="md"
              aria-label={mobileOpened ? 'Закрыть меню' : 'Открыть меню'}
            />
            {/* десктоп: сворачивает/разворачивает боковое меню */}
            <Tooltip
              label={desktopExpanded ? 'Свернуть меню' : 'Развернуть меню'}
              openDelay={400}
              position="right"
              withArrow
            >
              <Burger
                opened={desktopExpanded}
                onClick={() => setDesktopExpanded((v) => !v)}
                visibleFrom="md"
                size="md"
                aria-label={desktopExpanded ? 'Свернуть меню' : 'Развернуть меню'}
              />
            </Tooltip>
            <Logo height={44} />
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
                onClick={closeMobile}
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
