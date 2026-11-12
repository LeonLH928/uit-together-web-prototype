import React, { useState, useEffect } from 'react'
import {
  CalendarCheck,
  GlobeHemisphereEast,
  Clock,
  MagnifyingGlass,
  ArrowSquareOut,
  ArrowRight,
  ArrowsClockwise,
  CheckCircle,
  Funnel,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { ConferenceCard } from '../components/ConferenceCard'
import {
  getNextDeadline,
  getNextEvent,
  getCountdownParts,
  formatDisplayDate,
  formatVietnamTime,
  getTimingNote,
  getDeadlineTime
} from '../utils/conferenceClock'

export const Conferences: React.FC = () => {
  const { conferences, conferencesUpdatedAt, syncConferencesFromLive } = useDataStore()

  // Real-time tick every second
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 6

  // Clock interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-sync on first mount
  useEffect(() => {
    syncConferencesFromLive().then((ok) => {
      if (ok) console.log('Synced conferences with live schedule')
    })
  }, [syncConferencesFromLive])

  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncSuccess(null)
    const success = await syncConferencesFromLive()
    setIsSyncing(false)
    setSyncSuccess(success)
    setTimeout(() => setSyncSuccess(null), 4000)
  }

  // Next imminent deadline & next conference event
  const nextDeadlineInfo = getNextDeadline(conferences, currentTime)
  const nextEventInfo = getNextEvent(conferences, currentTime)

  // Filtering
  const filteredConferences = conferences.filter((c) => {
    // Search query
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      c.acronym.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      String(c.year).includes(q)

    // Topic
    const matchesTopic = selectedTopic === 'all' || (c.topics || []).includes(selectedTopic)

    // Status
    let matchesStatus = true
    if (selectedStatus === 'open') {
      matchesStatus = (c.deadlines || []).some((d) => {
        const t = getDeadlineTime(d)
        return t !== null && t.comparison > currentTime
      })
    } else if (selectedStatus === 'upcoming') {
      matchesStatus = Boolean(c.starts_on && Date.parse(c.starts_on + 'T00:00:00+07:00') > currentTime)
    } else if (selectedStatus === 'pending') {
      matchesStatus = c.date_status === 'unannounced' || !c.starts_on
    }

    return matchesSearch && matchesTopic && matchesStatus
  })

  // Sort: Nearest deadline first, then by starts_on
  const sortedConferences = [...filteredConferences].sort((a, b) => {
    const da = (a.deadlines || [])
      .map(getDeadlineTime)
      .filter((t): t is NonNullable<typeof t> => t !== null && t.comparison > currentTime)
      .sort((x, y) => x.comparison - y.comparison)[0]

    const db = (b.deadlines || [])
      .map(getDeadlineTime)
      .filter((t): t is NonNullable<typeof t> => t !== null && t.comparison > currentTime)
      .sort((x, y) => x.comparison - y.comparison)[0]

    if (da && db) return da.comparison - db.comparison
    if (da) return -1
    if (db) return 1
    return (a.starts_on || '9999').localeCompare(b.starts_on || '9999')
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedConferences.length / pageSize))
  const paginatedConferences = sortedConferences.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handlePageChange = (p: number) => {
    setCurrentPage(p)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Title & Vietnam Clock Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
            <GlobeHemisphereEast size={14} weight="bold" />
            <span>International AI & Computer Vision Deadlines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Conference Deadlines
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Real-time countdowns, paper submission deadlines, and conference schedules for premier venues
            in Computer Vision, Machine Learning, and Medical AI — verified and synchronized in Vietnam Time.
          </p>
        </div>

        {/* Vietnam Clock & Sync Badge */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-xs">
            <Clock size={16} weight="bold" className="text-blue-400" />
            <div className="text-xs">
              <span className="font-semibold text-slate-300 mr-2">Vietnam Time (UTC+07:00):</span>
              <span className="font-mono font-bold text-white tracking-wide">
                {formatVietnamTime(currentTime)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Verified: {formatDisplayDate(conferencesUpdatedAt.split('T')[0])}</span>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
              title="Sync latest deadlines from official Git repository"
            >
              <ArrowsClockwise size={13} className={isSyncing ? 'animate-spin text-blue-600' : ''} />
              <span>{isSyncing ? 'Checking...' : 'Sync Feed'}</span>
            </button>
            {syncSuccess === true && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle size={12} weight="fill" />
                <span>Updated</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spotlight Feature Cards (2 Columns: Next Deadline Banner + Next Conference Event) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Imminent Paper Deadline (Col-8) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between gap-6 border border-blue-900/50">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Next Paper Deadline
              </span>
              {nextDeadlineInfo && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {nextDeadlineInfo.deadline.status === 'tentative' ? 'Tentative' : 'Imminent Submission'}
                </span>
              )}
            </div>

            {nextDeadlineInfo ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                    {nextDeadlineInfo.conference.acronym}
                  </h2>
                  <span className="text-xl sm:text-2xl font-light text-blue-300">
                    {nextDeadlineInfo.conference.year}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl line-clamp-2">
                  {nextDeadlineInfo.conference.name}
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  📍 {nextDeadlineInfo.conference.location || 'Location To Be Announced'}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-white">New Deadlines Coming Soon</h2>
                <p className="text-sm text-slate-300 mt-1">
                  All current conference cycles are closed or pending announcement.
                </p>
              </div>
            )}
          </div>

          {/* Countdown Clock Display */}
          {nextDeadlineInfo && (
            <div className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-blue-200 uppercase tracking-wider">
                  Target: {nextDeadlineInfo.deadline.label}
                </span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {formatVietnamTime(nextDeadlineInfo.clock.time)} (UTC+07:00)
                </span>
              </div>

              {/* Countdown Numbers */}
              {(() => {
                const [d, h, m, s] = getCountdownParts(nextDeadlineInfo.clock.time, currentTime)
                return (
                  <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                    <div className="bg-slate-900/90 rounded-xl p-2.5 sm:p-4 border border-white/10 shadow-lg">
                      <span className="block text-2xl sm:text-4xl font-black font-mono text-white leading-none">
                        {d}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                        Days
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 sm:p-4 border border-white/10 shadow-lg">
                      <span className="block text-2xl sm:text-4xl font-black font-mono text-white leading-none">
                        {h}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                        Hours
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 sm:p-4 border border-white/10 shadow-lg">
                      <span className="block text-2xl sm:text-4xl font-black font-mono text-white leading-none">
                        {m}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                        Minutes
                      </span>
                    </div>
                    <div className="bg-slate-900/90 rounded-xl p-2.5 sm:p-4 border border-white/10 shadow-lg">
                      <span className="block text-2xl sm:text-4xl font-black font-mono text-amber-400 leading-none">
                        {s}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                        Seconds
                      </span>
                    </div>
                  </div>
                )
              })()}

              <p className="text-[11px] text-blue-200/80 leading-relaxed">
                {getTimingNote(nextDeadlineInfo.clock.precision)}
              </p>
            </div>
          )}

          {/* Action Links */}
          {nextDeadlineInfo && (
            <div className="flex items-center gap-4 flex-wrap relative z-10 pt-2">
              {nextDeadlineInfo.conference.website && (
                <a
                  href={nextDeadlineInfo.conference.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-colors shadow-md"
                >
                  <span>Official Conference Website</span>
                  <ArrowSquareOut size={16} weight="bold" />
                </a>
              )}
              <a
                href="#directory"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-300 hover:text-white transition-colors"
              >
                <span>View all conferences below</span>
                <ArrowRight size={14} weight="bold" />
              </a>
            </div>
          )}
        </div>

        {/* Next Conference Opening Event (Col-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
              Next Conference Event
            </span>

            {nextEventInfo ? (
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {nextEventInfo.conference.acronym} {nextEventInfo.conference.year}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                  {nextEventInfo.conference.name}
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  📍 {nextEventInfo.conference.location || 'Location TBA'}
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Event Period</span>
                  <p className="text-xs font-bold text-slate-800">
                    {formatDisplayDate(nextEventInfo.conference.starts_on)}
                    {nextEventInfo.conference.ends_on && ` – ${formatDisplayDate(nextEventInfo.conference.ends_on)}`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No scheduled conference event.</p>
            )}
          </div>

          {nextEventInfo && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Countdown to Opening Date
              </span>
              {(() => {
                const [d, h, m, s] = getCountdownParts(nextEventInfo.time, currentTime)
                return (
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-slate-100 rounded-lg p-2 border border-slate-200/60">
                      <span className="block text-base font-extrabold text-slate-900 font-mono leading-none">
                        {d}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-2 border border-slate-200/60">
                      <span className="block text-base font-extrabold text-slate-900 font-mono leading-none">
                        {h}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-2 border border-slate-200/60">
                      <span className="block text-base font-extrabold text-slate-900 font-mono leading-none">
                        {m}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-2 border border-slate-200/60">
                      <span className="block text-base font-extrabold text-blue-900 font-mono leading-none">
                        {s}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Secs</span>
                    </div>
                  </div>
                )
              })()}

              {nextEventInfo.conference.website && (
                <a
                  href={nextEventInfo.conference.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors mt-2"
                >
                  <span>Visit Conference Site</span>
                  <ArrowSquareOut size={14} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Directory Section Header & Search/Filters */}
      <section id="directory" className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck size={26} className="text-blue-900" />
              <span>All Conferences Directory</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {sortedConferences.length} tracked international venues
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search conference (CVPR, MICCAI), name, or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            {/* Topic Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="all">All Research Areas</option>
                <option value="vision">Computer Vision</option>
                <option value="machine-learning">Machine Learning</option>
                <option value="medical">Medical Imaging</option>
                <option value="multimedia">Multimedia</option>
                <option value="retrieval">Information Retrieval</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open Deadlines</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="pending">Dates to Be Announced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conferences Grid */}
        {paginatedConferences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedConferences.map((conf) => (
              <ConferenceCard
                key={conf.id}
                conference={conf}
                currentTime={currentTime}
                isNearest={nextDeadlineInfo?.conference.id === conf.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <Funnel size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No conferences match these filters</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting all topics.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">
              Page {currentPage} of {totalPages} ({sortedConferences.length} conferences)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
              >
                <CaretLeft size={14} weight="bold" />
                <span>Previous</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                    p === currentPage
                      ? 'bg-blue-900 text-white'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
              >
                <span>Next</span>
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Explainer Note */}
      <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-700 mb-1">Timezone & Countdown Convention Note:</p>
        <p>
          Deadlines with a published hour and timezone are converted precisely to Vietnam Time (UTC+07:00).
          AoE (Anywhere on Earth) deadlines count down to 23:59:59 UTC−12 (equivalent to 18:59:59 the following day in Vietnam).
          For dates without published hours, countdowns target 00:00 Vietnam time on the calendar date.
        </p>
      </div>
    </div>
  )
}
