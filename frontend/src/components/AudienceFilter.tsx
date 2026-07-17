import { SegmentedControl } from '@mantine/core'

import type { Audience } from '../api/types'
import { AUDIENCES } from '../lib/labels'

export type AudienceValue = Audience | 'all'

const DATA = [{ label: 'Все', value: 'all' }, ...AUDIENCES.map((a) => ({ label: a, value: a }))]

/** Фильтр по аудитории (203/903/906/все) — общий для админ-экранов. */
export function AudienceFilter({
  value,
  onChange,
}: {
  value: AudienceValue
  onChange: (v: AudienceValue) => void
}) {
  return <SegmentedControl data={DATA} value={value} onChange={(v) => onChange(v as AudienceValue)} />
}
