import type { Conference, ConferenceDeadline } from '../types'

export interface DeadlineTimeInfo {
  time: number
  comparison: number
  precision: 'exact' | 'aoe-day' | 'calendar'
}

export interface CandidateDeadline {
  conference: Conference
  deadline: ConferenceDeadline
  clock: DeadlineTimeInfo
}

export interface NextEventInfo {
  conference: Conference
  time: number
}

const DAY_MS = 86400000

export function getDeadlineTime(d: ConferenceDeadline | undefined | null): DeadlineTimeInfo | null {
  if (!d || d.status === 'unannounced') return null
  if (d.at && /(Z|[+-]\d\d:\d\d)$/.test(d.at)) {
    const time = Date.parse(d.at)
    if (Number.isFinite(time)) return { time, comparison: time, precision: 'exact' }
  }
  if (!d.date || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return null
  if (!Number.isFinite(Date.parse(d.date + 'T00:00:00Z'))) return null

  if (d.zone === 'AoE') {
    const time = Date.parse(d.date + 'T23:59:59-12:00')
    return { time, comparison: time, precision: 'aoe-day' }
  }

  const time = Date.parse(d.date + 'T00:00:00+07:00')
  return { time, comparison: time + DAY_MS - 1, precision: 'calendar' }
}

export function getConferenceEdition(record: Conference, now: number): Conference {
  const end = record.ends_on ? Date.parse(record.ends_on + 'T23:59:59-12:00') : null
  if (!end || !Number.isFinite(end) || end >= now) return record

  return {
    ...record,
    year: record.year + 1,
    starts_on: null,
    ends_on: null,
    location: '',
    deadlines: [],
    date_status: 'unannounced',
    sync_status: 'next-edition-pending',
    source_urls: [],
    rolled_over: true,
    notes_en: 'Next edition: official dates and location have not been announced',
    notes_vi: 'Kỳ tiếp theo: chưa công bố ngày và địa điểm chính thức',
    website: record.series_url || record.website || '',
  }
}

export function getCandidateDeadlines(records: Conference[], now: number): CandidateDeadline[] {
  const items: CandidateDeadline[] = []
  records.map((r) => getConferenceEdition(r, now)).forEach((conference) => {
    (conference.deadlines || []).forEach((deadline) => {
      const clock = getDeadlineTime(deadline)
      if (clock && clock.comparison > now) {
        items.push({ conference, deadline, clock })
      }
    })
  })
  return items.sort((a, b) => a.clock.comparison - b.clock.comparison)
}

export function getNextDeadline(records: Conference[], now: number): CandidateDeadline | null {
  return getCandidateDeadlines(records, now)[0] || null
}

export function getNextEvent(records: Conference[], now: number): NextEventInfo | null {
  return (
    records
      .map((r) => getConferenceEdition(r, now))
      .filter((r) => r.starts_on && r.date_status !== 'conflicting')
      .map((conference) => ({
        conference,
        time: Date.parse(conference.starts_on + 'T00:00:00+07:00'),
      }))
      .filter((r) => r.time > now)
      .sort((a, b) => a.time - b.time)[0] || null
  )
}

export function getCountdownParts(target: number, now: number): [string, string, string, string] {
  let value = Math.max(0, Math.ceil((target - now) / 1000))
  const days = Math.floor(value / 86400)
  value %= 86400
  const hours = Math.floor(value / 3600)
  value %= 3600
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return [
    String(days).padStart(2, '0'),
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
}

export function formatVietnamTime(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'number' || typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

export function formatDisplayDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'To Be Announced'
  try {
    const d = new Date(dateStr + 'T12:00:00+07:00')
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

export function getTimingNote(precision: 'exact' | 'aoe-day' | 'calendar'): string {
  if (precision === 'calendar') {
    return 'Calendar countdown to 00:00 Vietnam on the deadline date. Exact submission time unannounced.'
  }
  if (precision === 'aoe-day') {
    return 'Counts to the end of published AoE date (UTC−12), converted to Vietnam time.'
  }
  return 'Official submission time, shown in Vietnam time (UTC+07:00).'
}
