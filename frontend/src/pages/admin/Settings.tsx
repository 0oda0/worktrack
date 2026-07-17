import { Anchor, Button, Card, Group, NumberInput, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconMapPin } from '@tabler/icons-react'
import { useEffect } from 'react'

import { errMsg } from '../../api/errors'
import { useSettings, useUpdateSettings } from '../../api/settings'

export default function Settings() {
  const settings = useSettings()
  const update = useUpdateSettings()

  const form = useForm({
    initialValues: { office_lat: 0, office_lng: 0, office_radius_m: 200 },
    validate: {
      office_radius_m: (v) => (v > 0 ? null : 'Радиус должен быть больше 0'),
    },
  })

  // заполняем форму, когда настройки загрузились (initialize идемпотентен)
  useEffect(() => {
    if (settings.data) form.initialize(settings.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.data])

  const submit = form.onSubmit(async (vals) => {
    try {
      await update.mutateAsync(vals)
      notifications.show({ color: 'green', message: 'Настройки сохранены' })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось сохранить') })
    }
  })

  if (settings.isLoading) return <Skeleton h={320} radius="lg" maw={520} />

  const { office_lat, office_lng } = form.values

  return (
    <Stack gap="lg" maw={520}>
      <Title order={2}>Настройки геозоны</Title>
      <Card p="lg">
        <form onSubmit={submit}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Координаты рабочего места и радиус, в пределах которого приход считается «в зоне».
              Отметки вне радиуса сохраняются с пометкой для администратора.
            </Text>
            <Group grow>
              <NumberInput label="Широта" decimalScale={6} step={0.0001} {...form.getInputProps('office_lat')} />
              <NumberInput label="Долгота" decimalScale={6} step={0.0001} {...form.getInputProps('office_lng')} />
            </Group>
            <NumberInput label="Радиус, м" min={1} step={10} {...form.getInputProps('office_radius_m')} />
            <Anchor
              href={`https://www.openstreetmap.org/?mlat=${office_lat}&mlon=${office_lng}#map=17/${office_lat}/${office_lng}`}
              target="_blank"
              rel="noreferrer"
              size="sm"
            >
              <Group gap={4} wrap="nowrap">
                <IconMapPin size={16} /> Посмотреть на карте
              </Group>
            </Anchor>
            <Button type="submit" loading={update.isPending}>
              Сохранить
            </Button>
          </Stack>
        </form>
      </Card>
    </Stack>
  )
}
