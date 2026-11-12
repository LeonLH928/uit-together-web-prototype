import React from 'react'
import { MapPin, ArrowSquareOut, Clock, CalendarBlank, CheckCircle, WarningCircle, Hourglass } from '@phosphor-icons/react'
import type { Conference } from '../types'
import {
  getConferenceEdition,
  getDeadlineTime,
  getCountdownParts,
  formatDisplayDate,
  formatVietnamTime,
  getTimingNote
} from '../utils/conferenceClock'

interface ConferenceCardProps {
  conference: Conference
  currentTime: number
  isNearest?: boolean
}

const TOPIC_LABELS: Record<string, string> = {
  'vision': 'Computer Vision',
  'machine-learning': 'Machine Learning',
  'medical': 'Medical Imaging',
  'multimedia': 'Multimedia',
  'retrieval': 'Information Retrieval'
}

export const ConferenceCard: React.FC<ConferenceCardProps> = ({
  conference,
  currentTime,
  isNearest = false
}) => {
  const edition = getConferenceEdition(conference, currentTime)

  // Find nearest upcoming deadline for this conference
  const upcomingDeadlines = (edition.deadlines || [])
    .map((d) => ({ deadline: d, clock: getDeadlineTime(d) }))
    .filter((item): item is { deadline: typeof item.deadline; clock: NonNullable<typeof item.clock> } => 
      item.clock !== null && item.clock.comparison > currentTime
    )
    .sort((a, b) => a.clock.comparison - b.clock.comparison)

  const activeDeadline = upcomingDeadlines[0] || null

  const getStatusBadge = () => {
    switch (edition.date_status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} weight="fill" />
            <span>Official Dates</span>
          </span>
        )
      case 'tentative':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <WarningCircle size={12} weight="fill" />
            <span>Tentative</span>
          </span>
        )
      case 'unannounced':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <Hourglass size={12} weight="bold" />
            <span>To Be Announced</span>
          </span>
        )
    }
  }

  return (
    <article
      className={`rounded-2xl p-6 bg-white border transition-all flex flex-col justify-between gap-5 relative group ${
        isNearest
          ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
          : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300'
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-900 text-white tracking-wide">
              {edition.year}
            </span>
            {getStatusBadge()}
          </div>
          {isNearest && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 animate-pulse">
              <Clock size={12} weight="fill" />
              <span>Nearest Deadline</span>
            </span>
          )}
        </div>

        {/* Heading & Acronym */}
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-900 transition-colors">
              {edition.acronym}
            </h3>
            <span className="text-sm font-semibold text-slate-400">
              {edition.year}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-snug line-clamp-2">
            {edition.name}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin size={15} weight="bold" className="text-slate-400 shrink-0" />
          <span className="truncate">{edition.location || 'Location To Be Announced'}</span>
        </div>

        {/* Conference Dates */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <CalendarBlank size={13} weight="bold" />
            <span>Conference Dates</span>
          </div>
          <p className="text-xs font-semibold text-slate-800">
            {edition.starts_on ? formatDisplayDate(edition.starts_on) : 'To Be Announced'}
            {edition.ends_on ? ` – ${formatDisplayDate(edition.ends_on)}` : ''}
          </p>
        </div>

        {/* Deadlines Section */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Submission Deadlines
          </span>
          <div className="space-y-1.5">
            {edition.deadlines && edition.deadlines.length > 0 ? (
              edition.deadlines.map((d, idx) => {
                const timeInfo = getDeadlineTime(d)
                const isClosed = timeInfo ? timeInfo.comparison <= currentTime : false

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <span>{d.label}</span>
                      {d.status === 'tentative' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                          Tentative
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-mono text-[11px]">
                        {timeInfo
                          ? timeInfo.precision === 'calendar'
                            ? `${formatDisplayDate(d.date)} (Date only)`
                            : formatVietnamTime(timeInfo.time)
                          : 'TBA'}
                      </span>
                      {isClosed ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                          Closed
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No deadlines published yet.</p>
            )}
          </div>
        </div>

        {/* Live Countdown for Active Deadline */}
        {activeDeadline && (
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-900 uppercase tracking-wider">
                Time Remaining: {activeDeadline.deadline.label}
              </span>
              <span className="text-blue-700/80 font-medium">
                {activeDeadline.clock.precision === 'aoe-day' ? 'AoE' : 'Vietnam Time'}
              </span>
            </div>

            {/* Countdown Tiles */}
            {(() => {
              const [days, hours, minutes, seconds] = getCountdownParts(
                activeDeadline.clock.time,
                currentTime
              )
              return (
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-white rounded-lg p-1.5 border border-blue-200/60 shadow-2xs">
                    <span className="block text-base font-extrabold text-blue-950 font-mono leading-none">
                      {days}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Days
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 border border-blue-200/60 shadow-2xs">
                    <span className="block text-base font-extrabold text-blue-950 font-mono leading-none">
                      {hours}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Hours
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 border border-blue-200/60 shadow-2xs">
                    <span className="block text-base font-extrabold text-blue-950 font-mono leading-none">
                      {minutes}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Mins
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 border border-blue-200/60 shadow-2xs">
                    <span className="block text-base font-extrabold text-blue-950 font-mono leading-none">
                      {seconds}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Secs
                    </span>
                  </div>
                </div>
              )
            })()}

            <p className="text-[10px] text-slate-500 leading-tight">
              {getTimingNote(activeDeadline.clock.precision)}
            </p>
          </div>
        )}

        {/* Topics Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(edition.topics || []).map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600"
            >
              {TOPIC_LABELS[t] || t}
            </span>
          ))}
        </div>

        {/* Notes (if any) */}
        {edition.notes_en && (
          <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {edition.notes_en}
          </p>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {edition.website ? (
          <a
            href={edition.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-bold text-blue-900 hover:text-blue-700 hover:underline"
          >
            <span>Official Website</span>
            <ArrowSquareOut size={13} weight="bold" />
          </a>
        ) : (
          <span className="text-slate-400 italic">Website TBA</span>
        )}

        {edition.source_urls && edition.source_urls[0] && (
          <a
            href={edition.source_urls[0]}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-slate-700 text-[11px] hover:underline"
          >
            Dates Source ↗
          </a>
        )}
      </div>
    </article>
  )
}
