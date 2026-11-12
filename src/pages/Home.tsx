import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Article,
  Database,
  ArrowRight,
  Sparkle,
  CalendarBlank,
  CalendarCheck,
  AirplaneTilt,
  WarningCircle,
  FileText,
  ChatCenteredDots
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { PaperCard } from '../components/PaperCard'
import { BibtexModal } from '../components/BibtexModal'
import type { Paper } from '../types'

const iconMap: Record<string, React.ElementType> = {
  AirplaneTilt,
  WarningCircle,
  FileText,
  ChatCenteredDots
}

export const Home: React.FC = () => {
  const { papers, news, projects, siteConfig, datasets } = useDataStore()
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  // Featured papers (top 3)
  const featuredPapers = papers.slice(0, 3)

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-800/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading and Mission Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-semibold">
                <Sparkle size={14} weight="fill" className="text-cyan-400" />
                <span>{siteConfig.home.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {siteConfig.home.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {siteConfig.home.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/papers"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
                >
                  <span>Explore Publications</span>
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <Link
                  to="/conferences"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-100 font-semibold text-sm border border-blue-700/60 transition-all hover:scale-[1.02]"
                >
                  <CalendarCheck size={16} weight="bold" />
                  <span>Conference Deadlines</span>
                </Link>
                <Link
                  to="/research"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
                >
                  <span>Research Areas & Datasets</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Graphic / Image next to title */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl bg-gradient-to-tr from-blue-950 to-slate-900 p-2 backdrop-blur-sm group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={siteConfig.home.heroImage || '/images/team/team0.jpg'}
                    alt={siteConfig.home.heroTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/team/team0.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-200 font-medium">
                    {siteConfig.home.heroImageCaption || 'Computer Vision & Deep Learning Research'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Key Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80">
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-4xl font-extrabold text-blue-900">
              {siteConfig.home.statsPublications || `${papers.length}+`}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Research Publications</div>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-4xl font-extrabold text-blue-900">
              {siteConfig.home.statsJournals || 'Q1 / SCIE'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">High-Impact Journals</div>
          </div>
          <div className="text-center p-3 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-4xl font-extrabold text-blue-900">
              {siteConfig.home.statsDatasets || `${datasets.length}`}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Public Datasets</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-blue-900">
              {siteConfig.home.statsLabLocation || 'Room A108'}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">UIT VNU-HCM Lab</div>
          </div>
        </div>
      </section>

      {/* Announcements & Recent News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Latest Announcements
            </h2>
            <p className="text-sm text-slate-500 mt-1">Recent updates from the laboratory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                    <CalendarBlank size={14} />
                    <span>{item.date}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 text-[11px]">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {item.url && (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-800 hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    <span>Read Details</span>
                    <ArrowRight size={12} weight="bold" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Research Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Research Pillars
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Pioneering cutting-edge computer vision paradigms with real-world impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((proj) => {
            const IconComponent = iconMap[proj.icon || ''] || GraduationCap
            return (
              <div
                key={proj.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                      <IconComponent size={22} weight="duotone" />
                    </div>
                    {proj.mediaType && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {proj.mediaType}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                    <Link to={`/research#${proj.id}`} className="hover:text-blue-900 transition-colors">
                      {proj.title}
                    </Link>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {proj.description.split('\n')[0]}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[130px]">
                    {proj.tags[0] || 'Research Area'}
                  </span>
                  <Link
                    to={`/research#${proj.id}`}
                    className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Explore</span>
                    <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Publications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Featured Publications
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Recent articles published in leading international journals and conferences
            </p>
          </div>
          <Link
            to="/papers"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-blue-900"
          >
            <span>View All ({papers.length})</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onOpenBibtex={(p) => setSelectedPaper(p)}
            />
          ))}
        </div>

        <div className="text-center pt-8 sm:hidden">
          <Link
            to="/papers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white font-semibold text-sm"
          >
            <span>View All Publications ({papers.length})</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </section>

      <BibtexModal
        paper={selectedPaper}
        onClose={() => setSelectedPaper(null)}
      />
    </div>
  )
}
