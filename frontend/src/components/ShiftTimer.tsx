import { Text } from '@mantine/core'
import { useEffect, useState } from 'react'

function fmt(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

/** Живой таймер открытой смены (тикает раз в секунду). */
export function ShiftTimer({ since }: { since: string }) {
  const start = new Date(since).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const sec = Math.max(0, Math.floor((now - start) / 1000))
  return (
    <Text component="span" fw={700} fz={44} lh={1} c="mtuci.7" className="tnum">
      {fmt(sec)}
    </Text>
  )
}
