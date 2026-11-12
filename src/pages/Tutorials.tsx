import React, { useState, useMemo } from 'react'
import { BookOpen, ArrowSquareOut, MagnifyingGlass, Tag } from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'

export const Tutorials: React.FC = () => {
  const { tutorials } = useDataStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = useMemo(() => {
    const cats = Array.from(new Set(tutorials.map((t) => t.category)))
    return ['All', ...cats]
  }, [tutorials])

  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tut) => {
      const matchesSearch =
        searchQuery === '' ||
        tut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tut.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCat =
        selectedCategory === 'All' || tut.category === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [tutorials, searchQuery, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <BookOpen size={14} weight="bold" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Lab Tutorials & Guides
        </h1>
        <p className="text-base text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Curated step-by-step guides, framework setup tutorials (MMDetection, YOLO, RTMDet, DINO),
          and Docker guidelines developed by UIT-Together researchers.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials by framework, topic, or keyword (e.g. Docker, MMDetection)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tut) => (
          <a
            key={tut.id}
            href={tut.url}
            target="_blank"
            rel="noreferrer"
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-900 border border-blue-200/50">
                  {tut.category}
                </span>
                <span className="text-slate-400 font-medium flex items-center gap-1 group-hover:text-blue-900 transition-colors">
                  <span>Open Guide</span>
                  <ArrowSquareOut size={14} />
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                {tut.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                {tut.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 mt-3 border-t border-slate-100">
              {tut.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1"
                >
                  <Tag size={10} className="text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
