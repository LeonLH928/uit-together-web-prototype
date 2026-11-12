import React, { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlass, Article, X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { PaperCard } from '../components/PaperCard'
import { BibtexModal } from '../components/BibtexModal'
import type { Paper } from '../types'

const ITEMS_PER_PAGE = 10

export const Papers: React.FC = () => {
  const { papers } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedYear, selectedType])

  // Extract available years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a)
    return ['All', ...years.map(String)]
  }, [papers])

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        searchQuery === '' ||
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.venue.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesYear =
        selectedYear === 'All' || paper.year.toString() === selectedYear

      const matchesType =
        selectedType === 'All' ||
        paper.type.toLowerCase() === selectedType.toLowerCase()

      return matchesSearch && matchesYear && matchesType
    })
  }, [papers, searchQuery, selectedYear, selectedType])

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPapers.length)
  const paginatedPapers = useMemo(() => {
    return filteredPapers.slice(startIndex, endIndex)
  }, [filteredPapers, startIndex, endIndex])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const listTop = document.getElementById('publications-heading')
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header */}
      <div id="publications-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <Article size={14} weight="bold" />
          <span>Scientific Output</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Research Publications
        </h1>
        <p className="text-base text-slate-500 mt-2 max-w-2xl">
          Peer-reviewed journal papers, international conference proceedings, and technical reports
          authored by researchers at UIT-Together Research Group.
        </p>
      </div>

      {/* Controls Bar */}
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
            placeholder="Search publications by title, author (e.g. Khang Nguyen), or venue..."
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-sm">
          {/* Publication Type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Type:
            </span>
            {['All', 'Journal', 'Conference'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Year:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {availableYears.slice(0, 8).map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 transition-all ${
                    selectedYear === year
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Publications Count Banner */}
      <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-500 px-1 gap-2">
        <span>
          Showing <strong className="text-slate-900">{filteredPapers.length > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{' '}
          <strong className="text-slate-900">{filteredPapers.length}</strong> publications (Page {currentPage} of {totalPages})
        </span>
        {(searchQuery || selectedYear !== 'All' || selectedType !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedYear('All')
              setSelectedType('All')
            }}
            className="text-blue-700 hover:underline font-semibold text-xs"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Publications List (Paginated 10 at a time) */}
      <div className="space-y-4">
        {paginatedPapers.length > 0 ? (
          paginatedPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onOpenBibtex={(p) => setSelectedPaper(p)}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Article size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No publications found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search keywords or clearing active filters.
            </p>
          </div>
        )}
      </div>

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

      <BibtexModal
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
      />
    </div>
  )
}
