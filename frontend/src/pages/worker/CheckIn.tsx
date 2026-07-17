import { Badge, Button, Card, Skeleton, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconMapPin, IconMapPinOff } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { useCheckIn, useCheckOut, useStatus } from '../../api/attendance'
import { errMsg } from '../../api/errors'
import { ShiftTimer } from '../../components/ShiftTimer'
import { getPosition } from '../../lib/geo'

export default function CheckIn() {
  const status = useStatus()
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const [busy, setBusy] = useState(false)

  const open = status.data ?? null

  const arrive = async () => {
    setBusy(true)
    try {
      const coords = await getPosition() // гео только на приходе — запрашивается по тапу
      const rec = await checkIn.mutateAsync(coords)
      notifications.show({
        color: rec.out_of_zone_in ? 'yellow' : 'green',
        title: 'Приход отмечен',
        message: rec.out_of_zone_in
          ? 'Вы вне рабочей зоны — отметка сохранена с пометкой для администратора'
          : 'Вы в рабочей зоне',
      })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось отметиться') })
    } finally {
      setBusy(false)
    }
  }

  const leave = async () => {
    setBusy(true)
    try {
      await checkOut.mutateAsync() // уход геолокацию не проверяет
      notifications.show({ color: 'green', title: 'Уход отмечен', message: 'Смена закрыта' })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось отметиться') })
    } finally {
      setBusy(false)
    }
  }

  if (status.isLoading) {
    return (
      <Stack gap="md">
        <Skeleton h={28} w={200} radius="sm" />
        <Skeleton h={160} radius="lg" />
      </Stack>
    )
  }

  return (
    <Stack gap="xl" mih="72vh" justify="space-between">
      <Stack gap="md">
        <Text fw={700} fz="lg">
          {(() => {
            const s = dayjs().format('dddd, D MMMM')
            return s.charAt(0).toUpperCase() + s.slice(1)
          })()}
        </Text>

        <Card p="lg">
          {open ? (
            <Stack align="center" gap="sm" py="sm">
              <Badge
                variant="light"
                color={open.out_of_zone_in ? 'yellow' : 'green'}
                leftSection={
                  open.out_of_zone_in ? <IconMapPinOff size={14} /> : <IconMapPin size={14} />
                }
              >
                {open.out_of_zone_in ? 'Вне зоны' : 'В зоне'}
              </Badge>
              <Text size="sm" c="dimmed" className="tnum">
                Смена идёт с {dayjs(open.check_in).format('HH:mm')}
              </Text>
              <ShiftTimer since={open.check_in} />
            </Stack>
          ) : (
            <Stack align="center" gap="xs" py="md">
              <Text fw={600}>Смена не начата</Text>
              <Text size="sm" c="dimmed" ta="center" maw={320}>
                Нажмите «Пришёл», чтобы отметить приход. Потребуется доступ к геолокации.
              </Text>
            </Stack>
          )}
        </Card>
      </Stack>

      {open ? (
        <Button
          size="xl"
          h={64}
          color="mtuci"
          variant="outline"
          fullWidth
          loading={busy}
          onClick={leave}
        >
          Ушёл
        </Button>
      ) : (
        <Button size="xl" h={64} color="mtuci" fullWidth loading={busy} onClick={arrive}>
          Пришёл
        </Button>
      )}
    </Stack>
  )
}
