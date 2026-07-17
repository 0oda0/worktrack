import { Tabs } from '@mantine/core'
import { IconCalendarStats, IconClockHour9, IconFileDescription } from '@tabler/icons-react'

import CheckIn from '../worker/CheckIn'
import Requests from '../worker/Requests'
import Timesheet from '../worker/Timesheet'

// Личная «Моя смена» для старшего состава — те же экраны работника внутри админки.
export default function MyShift() {
  return (
    <Tabs defaultValue="checkin" color="mtuci">
      <Tabs.List mb="lg">
        <Tabs.Tab value="checkin" leftSection={<IconClockHour9 size={16} />}>
          Отметка
        </Tabs.Tab>
        <Tabs.Tab value="timesheet" leftSection={<IconCalendarStats size={16} />}>
          Табель
        </Tabs.Tab>
        <Tabs.Tab value="requests" leftSection={<IconFileDescription size={16} />}>
          Заявки
        </Tabs.Tab>
      </Tabs.List>
      <div style={{ maxWidth: 640 }}>
        <Tabs.Panel value="checkin">
          <CheckIn />
        </Tabs.Panel>
        <Tabs.Panel value="timesheet">
          <Timesheet />
        </Tabs.Panel>
        <Tabs.Panel value="requests">
          <Requests />
        </Tabs.Panel>
      </div>
    </Tabs>
  )
}
