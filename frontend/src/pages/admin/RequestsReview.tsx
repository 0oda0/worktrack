import { Button, Card, Group, Modal, Skeleton, Stack, Text, Textarea, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconInbox, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState } from 'react'

import { errMsg } from '../../api/errors'
import { useApproveRequest, usePendingRequests, useRejectRequest } from '../../api/requests'
import type { WorkRequest } from '../../api/types'
import { EmptyState } from '../../components/EmptyState'

export default function RequestsReview() {
  const list = usePendingRequests()
  const approve = useApproveRequest()
  const reject = useRejectRequest()

  const [rejectTarget, setRejectTarget] = useState<WorkRequest | null>(null)
  const [comment, setComment] = useState('')
  const [opened, { open, close }] = useDisclosure(false)

  const onApprove = async (r: WorkRequest) => {
    try {
      await approve.mutateAsync({ id: r.id })
      notifications.show({ color: 'green', message: 'Заявка одобрена, отметка создана' })
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось одобрить') })
    }
  }

  const startReject = (r: WorkRequest) => {
    setRejectTarget(r)
    setComment('')
    open()
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    try {
      await reject.mutateAsync({ id: rejectTarget.id, comment })
      notifications.show({ color: 'green', message: 'Заявка отклонена' })
      close()
    } catch (e) {
      notifications.show({ color: 'red', message: errMsg(e, 'Не удалось отклонить') })
    }
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Заявки на рассмотрении</Title>

      {list.isLoading ? (
        <Skeleton h={160} radius="lg" />
      ) : !list.data || list.data.length === 0 ? (
        <EmptyState icon={IconInbox} title="Нет заявок на рассмотрении">
          Новые ручные отметки сотрудников появятся здесь.
        </EmptyState>
      ) : (
        <Stack gap="xs">
          {list.data.map((r) => (
            <Card key={r.id} p="lg">
              <Group justify="space-between" wrap="wrap" gap="md">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text fw={600}>{dayjs(r.work_date).format('D MMMM YYYY')}</Text>
                    <Text size="sm" c="dimmed" className="tnum">
                      {dayjs(r.check_in).format('HH:mm')}
                      {r.check_out ? ` — ${dayjs(r.check_out).format('HH:mm')}` : ' (открытая смена)'}
                    </Text>
                  </Group>
                  {r.comment && (
                    <Text size="sm" c="dimmed">
                      «{r.comment}»
                    </Text>
                  )}
                </Stack>
                <Group gap="xs">
                  <Button
                    variant="light"
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    loading={approve.isPending}
                    onClick={() => onApprove(r)}
                  >
                    Одобрить
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconX size={16} />}
                    onClick={() => startReject(r)}
                  >
                    Отклонить
                  </Button>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Modal opened={opened} onClose={close} title="Отклонить заявку" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            Можно указать причину — сотрудник увидит её в своих заявках.
          </Text>
          <Textarea
            label="Причина"
            placeholder="Необязательно"
            autosize
            minRows={2}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              Отмена
            </Button>
            <Button color="red" loading={reject.isPending} onClick={confirmReject}>
              Отклонить
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
