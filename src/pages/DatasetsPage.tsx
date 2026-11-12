import React, { useState, useMemo } from 'react'
import { Database, GithubLogo, ArrowSquareOut, Tag, MagnifyingGlass, X, Sparkle, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'

export const DatasetsPage: React.FC = () => {
  const { datasets } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 6

  // Available Years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(datasets.map((d) => d.year))).sort((a, b) => b - a)
    return ['All', ...years.map(String)]
  }, [datasets])

  // Filtered Datasets
  const filteredDatasets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return datasets.filter((d) => {
      const matchesSearch =
        !query ||
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some((t) => t.toLowerCase().includes(query))

      const matchesYear = selectedYear === 'All' || d.year.toString() === selectedYear

      return matchesSearch && matchesYear
    })
  }, [datasets, searchQuery, selectedYear])

  const totalPages = Math.max(1, Math.ceil(filteredDatasets.length / PAGE_SIZE))

  const paginatedDatasets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredDatasets.slice(start, start + PAGE_SIZE)
  }, [filteredDatasets, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const element = document.getElementById('datasets-list-top')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <Database size={14} weight="bold" />
          <span>Open Science & Resources</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Open Datasets & Benchmarks
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          The UIT-Together Research Group has released <strong>13 official open benchmark datasets</strong> to advance
          computer vision research in Vietnamese document AI, drone surveillance, traffic anomaly forecasting,
          medical radiography, and cultural heritage recognition.
        </p>
      </div>

      {/* Search and Filters */}
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search all 13 datasets by name (e.g. UIT-DODV, VNAnomaly, Drone21), domain, or keywords..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Year Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {availableYears.map((year) => {
              const count =
                year === 'All'
                  ? datasets.length
                  : datasets.filter((d) => d.year.toString() === year).length
              const isSelected = selectedYear === year
              return (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {year === 'All' ? `All Years (${count})` : `${year} (${count})`}
                </button>
              )
            })}
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredDatasets.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredDatasets.length)}</strong> of {filteredDatasets.length} filtered ({datasets.length} total)
          </span>
        </div>
      </div>

      {/* Datasets Grid (Paginated: 6 cards per page) */}
      <div id="datasets-list-top" className="space-y-8">
        {paginatedDatasets.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDatasets.map((dataset) => (
                <div
                  key={dataset.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Dataset Preview Image */}
                {dataset.image && (
                  <div className="w-full h-48 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                    <img
                      src={dataset.image}
                      alt={dataset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-950/80 backdrop-blur-xs text-white shadow-sm">
                        {dataset.year}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-4">
                  {!dataset.image && (
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-white">
                        {dataset.year}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Public Benchmark</span>
                    </div>
                  )}

                  <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {dataset.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                    {dataset.description}
                  </p>

                  {/* Highlights Bullet List */}
                  {dataset.highlights && dataset.highlights.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                        <Sparkle size={13} className="text-amber-500" weight="fill" />
                        <span>Key Highlights:</span>
                      </div>
                      <ul className="space-y-1.5">
                        {dataset.highlights.slice(0, 2).map((h, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-blue-900 font-bold shrink-0">•</span>
                            <span className="line-clamp-2">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Tags & Actions */}
              <div className="p-6 pt-0 space-y-4">
                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-4">
                  {dataset.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1"
                    >
                      <Tag size={10} className="text-slate-400" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {dataset.githubUrl && (
                    <a
                      href={dataset.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <GithubLogo size={15} />
                      <span>Dataset Page</span>
                    </a>
                  )}
                  {dataset.paperUrl && (
                    <a
                      href={dataset.paperUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors ml-auto border border-blue-200"
                    >
                      <ArrowSquareOut size={14} />
                      <span>Documentation</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({filteredDatasets.length} datasets)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
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
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
                  >
                    <span>Next</span>
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Database size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No datasets found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search query or switching the year filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
