import React, { useState, useMemo, useEffect } from 'react'
import {
  MagnifyingGlass,
  Student,
  X,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { MemberCard } from '../components/MemberCard'

const ORDERED_COHORTS = [
  'Cohort K2023',
  'Cohort K2022',
  'Cohort K2021',
  'Cohort K2020',
  'Cohort K2019',
  'Cohort K2018',
  'Cohort K2017',
  'Cohort K2016',
  'Cohort K2015'
]

const ITEMS_PER_PAGE = 12

export const Students: React.FC = () => {
  const { members } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCohort, setSelectedCohort] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Alumni'>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Filter for student members
  const allStudents = useMemo(() => {
    return members.filter((m) => {
      const isStudentRole =
        m.role.toLowerCase().includes('student') || m.role.toLowerCase().includes('graduate')
      const hasCohort = Boolean(m.cohort)
      return isStudentRole || hasCohort
    })
  }, [members])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCohort, selectedStatus])

  // Count students per cohort
  const cohortCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allStudents.length }
    ORDERED_COHORTS.forEach((c) => {
      counts[c] = allStudents.filter((s) => s.cohort === c).length
    })
    return counts
  }, [allStudents])

  // Filtered students based on search, cohort, and status
  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return allStudents.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        (student.bio && student.bio.toLowerCase().includes(query)) ||
        (student.cohort && student.cohort.toLowerCase().includes(query)) ||
        student.position.toLowerCase().includes(query)

      const matchesCohort =
        selectedCohort === 'All' || student.cohort === selectedCohort

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Alumni' && student.alum) ||
        (selectedStatus === 'Active' && !student.alum)

      return matchesSearch && matchesCohort && matchesStatus
    })
  }, [allStudents, searchQuery, selectedCohort, selectedStatus])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredStudents.length)
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, endIndex)
  }, [filteredStudents, startIndex, endIndex])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const listTop = document.getElementById('students-heading')
    if (listTop) {
      listTop.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }, [totalPages, currentPage])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div id="students-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <Student size={14} weight="bold" />
          <span>Student Directory & Cohorts</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Student Researchers
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          The comprehensive directory of undergraduate and graduate student researchers across graduating cohorts
          from <strong>K2015 to K2022</strong> at the UIT-Together Research Group (University of Information Technology, VNU-HCM).
        </p>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name (e.g. Bùi Cao Doanh, Hồ Minh Trí), topic, or cohort..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Cohort & Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-sm">
          {/* Cohort Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <button
              onClick={() => setSelectedCohort('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedCohort === 'All'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Cohorts ({allStudents.length})
            </button>
            {ORDERED_COHORTS.map((c) => {
              const count = cohortCounts[c] || 0
              const label = c.replace('Cohort ', '')
              const isSelected = selectedCohort === c
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCohort(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>

          {/* Status Toggle (All / Active / Alumni) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {(['All', 'Active', 'Alumni'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === status
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count Indicator */}
      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-500 px-1 gap-2">
        <span>
          Showing <strong className="text-slate-900">{filteredStudents.length > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{' '}
          <strong className="text-slate-900">{filteredStudents.length}</strong> students
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </span>
        {(searchQuery || selectedCohort !== 'All' || selectedStatus !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCohort('All')
              setSelectedStatus('All')
            }}
            className="text-blue-700 hover:underline font-semibold text-xs"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Card Grid View */}
      {paginatedStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedStudents.map((student) => (
            <MemberCard key={student.id} member={student} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Student size={48} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No students found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search keywords or clearing active filters.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-6">
          {/* Previous Button */}
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Numbered Page Buttons */}
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 font-bold text-xs"
                >
                  ...
                </span>
              )
            }
            const isCurrent = page === currentPage
            return (
              <button
                key={`page-${page}`}
                onClick={() => handlePageChange(Number(page))}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            )
          })}

          {/* Next Button */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      )}
    </div>
  )
}
