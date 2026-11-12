import React from 'react'
import {
  GraduationCap,
  Database,
  ArrowSquareOut,
  GithubLogo,
  VideoCamera,
  Image as ImageIcon
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'

export const Research: React.FC = () => {
  const { projects, datasets } = useDataStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <GraduationCap size={14} weight="bold" />
          <span>Research Agenda</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Research Areas & Directions
        </h1>
        <p className="text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
          Our group conducts foundational and applied research across sparse-view medical imaging,
          high-resolution whole-slide pathology analysis, video anomaly detection, and robust object detection
          under adverse weather conditions.
        </p>

        {/* Jump Navigation Bar */}
        {projects.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <span className="text-xs font-bold text-slate-500 mr-1">Quick Jump:</span>
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={`#${proj.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 transition-all hover:scale-[1.02]"
              >
                {proj.mediaType === 'video' ? (
                  <VideoCamera size={14} weight="bold" className="text-blue-700" />
                ) : (
                  <ImageIcon size={14} weight="bold" className="text-emerald-700" />
                )}
                <span>{proj.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Research Directions Sections */}
      <section className="space-y-10">
        {projects.map((proj) => {
          const isVideo = proj.mediaType === 'video' || (proj.mediaUrl && proj.mediaUrl.endsWith('.mp4'))

          return (
            <section
              id={proj.id}
              key={proj.id}
              className="scroll-mt-24 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left Column: Copy & Paragraphs */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-100 text-blue-900 uppercase tracking-wide">
                      Research Direction
                    </span>
                    {proj.mediaType && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 capitalize">
                        {proj.mediaType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {proj.title}
                  </h2>

                  <div className="space-y-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
                    {proj.description.split(/\n\s*\n|\n/).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>

                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Media (Video or Image) */}
                <div className="lg:col-span-5">
                  <figure className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
                    {isVideo && proj.mediaUrl ? (
                      <div className="relative aspect-video bg-black flex items-center justify-center">
                        <video
                          controls
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                          src={proj.mediaUrl}
                        >
                          <source src={proj.mediaUrl} type="video/mp4" />
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ) : proj.mediaUrl ? (
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={proj.mediaUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.4'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No Media Uploaded
                      </div>
                    )}

                    {proj.caption && (
                      <figcaption className="p-3.5 bg-slate-900 text-xs text-slate-300 italic border-t border-slate-800 leading-relaxed">
                        {proj.caption}
                      </figcaption>
                    )}
                  </figure>
                </div>
              </div>
            </section>
          )
        })}
      </section>

      {/* Datasets & Benchmarks */}
      <section className="space-y-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database size={24} className="text-blue-900" />
              <span>Open Datasets & Benchmarks</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Open-access datasets curated and released by UIT-Together to support the global academic research community.
            </p>
          </div>
          <a
            href="/datasets"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>Explore All {datasets.length} Datasets</span>
            <span>→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.slice(0, 6).map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div>
                {dataset.image && (
                  <div className="w-full h-44 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                    <img
                      src={dataset.image}
                      alt={dataset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-950/80 backdrop-blur-xs text-white">
                        {dataset.year}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-3">
                  {!dataset.image && (
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-white">
                        {dataset.year}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Benchmark</span>
                    </div>
                  )}

                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors">
                    {dataset.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {dataset.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-3">
                <div className="flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                  {dataset.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {dataset.githubUrl && (
                    <a
                      href={dataset.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <GithubLogo size={14} />
                      <span>Dataset Page</span>
                    </a>
                  )}
                  {dataset.paperUrl && (
                    <a
                      href={dataset.paperUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 hover:bg-blue-100 transition-colors ml-auto border border-blue-200"
                    >
                      <ArrowSquareOut size={14} />
                      <span>Details</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {datasets.length > 6 && (
          <div className="text-center pt-2">
            <a
              href="/datasets"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200 transition-colors"
            >
              <span>Explore All {datasets.length} Open Datasets & Benchmarks</span>
              <span>→</span>
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
