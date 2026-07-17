import { Avatar, Badge, Group, Menu, Stack, Text, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconLogout } from '@tabler/icons-react'

import type { Role } from '../api/types'
import { useAuth } from '../auth/AuthContext'

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  leader: 'Старший состав',
  worker: 'Работник',
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const s = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return s.toUpperCase() || '?'
}

export function UserMenu() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <Menu position="bottom-end" width={240} withArrow>
      <Menu.Target>
        <UnstyledButton aria-label="Меню пользователя">
          <Group gap="xs" wrap="nowrap">
            <Avatar color="mtuci" radius="xl" size={34}>
              {initials(user.full_name)}
            </Avatar>
            <IconChevronDown size={16} color="var(--mantine-color-gray-6)" />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <Stack gap={2}>
            <Text fw={600} size="sm" c="dark">
              {user.full_name}
            </Text>
            <Text size="xs" c="dimmed">
              {user.email}
            </Text>
            <Badge mt={4} variant="light" color="mtuci" size="sm">
              {ROLE_LABEL[user.role]}
              {user.audience ? ` · ауд. ${user.audience}` : ''}
            </Badge>
          </Stack>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={logout}>
          Выйти
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
