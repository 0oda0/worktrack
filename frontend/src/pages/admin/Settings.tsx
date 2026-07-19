import {
  Anchor,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconMapPin } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { errMsg } from '../../api/errors'
import { useSettings, useUpdateSettings } from '../../api/settings'

/** Вытаскивает внешнее кольцо первого Polygon из вставленного GeoJSON (FeatureCollection/Feature/Geometry). */
function extractRing(text: string): number[][] | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  // спускаемся до geometry типа Polygon
  const stack: unknown[] = [data]
  let geom: Record<string, unknown> | null = null
  while (stack.length) {
    const node = stack.pop()
    if (!node || typeof node !== 'object') continue
    const o = node as Record<string, unknown>
    if (o.type === 'Polygon') {
      geom = o
      break
    }
    if (Array.isArray(o.features)) stack.push(...o.features)
    if (o.geometry) stack.push(o.geometry)
  }
  const coords = geom?.coordinates
  const ring = Array.isArray(coords) ? coords[0] : null
  if (!Array.isArray(ring) || ring.length < 3) return null
  const out: number[][] = []
  for (const p of ring) {
    if (!Array.isArray(p) || typeof p[0] !== 'number' || typeof p[1] !== 'number') return null
    out.push([p[0], p[1]])
  }
  return out
}

export default function Settings() {
  const settings = useSettings()
  const update = useUpdateSettings()
  const [geojson, setGeojson] = useState('')

  const form = useForm({
    initialValues: {
      office_lat: 0,
      office_lng: 0,
      office_radius_m: 200,
      office_polygon: null as number[][] | null,
    },
    validate: {
      office_radius_m: (v) => (v > 0 ? null : 'Радиус должен быть больше 0'),
    },
  })

  // заполняем форму, когда настройки загрузились (initialize идемпотентен)
  useEffect(() => {
    if (settings.data) form.initialize(settings.data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.data])

  const applyPolygon = () => {
    const ring = extractRing(geojson)
    if (!ring) {
      notifications.show({ color: 'red', message: 'Не найден полигон в GeoJSON' })
      return
    }
    form.setFieldValue('office_polygon', ring)
    setGeojson('')
    notifications.show({ color: 'green', message: `Полигон обновлён: ${ring.length} точек` })
  }

  const submit = form.onSubmit(async (vals) => {
    try {
      await update.mutateAsync(vals)
      notifications.show({ color: 'green', message: 'Настройки сохранены' })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось сохранить') })
    }
  })

  if (settings.isLoading) return <Skeleton h={320} radius="lg" maw={560} />

  const { office_lat, office_lng, office_polygon } = form.values

  return (
    <Stack gap="lg" maw={560}>
      <Title order={2}>Настройки геозоны</Title>
      <Card p="lg">
        <form onSubmit={submit}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Приход в пределах зоны считается «в зоне», вне — сохраняется с пометкой для
              администратора. Уход геолокацию не проверяет.
            </Text>

            {/* полигон — основной способ задать территорию */}
            <Group gap="xs">
              <Text fw={600} size="sm">
                Рабочая зона:
              </Text>
              {office_polygon ? (
                <>
                  <Badge color="mtuci" variant="light">
                    полигон, {office_polygon.length} точек
                  </Badge>
                  <Anchor
                    href={`https://geojson.io/#data=data:application/json,${encodeURIComponent(
                      JSON.stringify({ type: 'Polygon', coordinates: [office_polygon] }),
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    size="sm"
                  >
                    посмотреть на карте
                  </Anchor>
                </>
              ) : (
                <Badge color="gray" variant="light">
                  круг (точка + радиус)
                </Badge>
              )}
            </Group>
            <Textarea
              label="GeoJSON полигона"
              description="Обведите территорию на geojson.io и вставьте сюда GeoJSON"
              placeholder='{"type":"Polygon","coordinates":[[[37.61,55.75],…]]}'
              autosize
              minRows={3}
              maxRows={8}
              value={geojson}
              onChange={(e) => setGeojson(e.currentTarget.value)}
            />
            <Group>
              <Button variant="light" onClick={applyPolygon} disabled={!geojson.trim()}>
                Применить полигон
              </Button>
              {office_polygon && (
                <Button
                  variant="subtle"
                  color="red"
                  onClick={() => form.setFieldValue('office_polygon', null)}
                >
                  Убрать полигон (вернуть круг)
                </Button>
              )}
            </Group>

            <Divider label="Круг (запасной вариант)" labelPosition="center" />
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
                <IconMapPin size={16} /> Посмотреть точку на карте
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
