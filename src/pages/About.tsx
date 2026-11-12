import React, { useState, useMemo } from 'react'
import {
  MapPin,
  Envelope,
  Globe,
  Camera,
  X,
  CaretLeft,
  CaretRight,
  Sparkle
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import type { GalleryItem } from '../types'

export const About: React.FC = () => {
  const { gallery, siteConfig } = useDataStore()
  const [selectedFilter, setSelectedFilter] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null)
  const PAGE_SIZE = 6

  // Categories dynamically derived from distinct event text on photos in the gallery
  const categories = useMemo(() => {
    const events = Array.from(new Set(gallery.map((g) => g.event).filter(Boolean)))
    return ['All', ...events]
  }, [gallery])

  // Filtered gallery for the broader moments section
  const filteredMoments = useMemo(() => {
    if (selectedFilter === 'All') return gallery
    return gallery.filter((item) => item.event === selectedFilter)
  }, [gallery, selectedFilter])

  // Pagination for moments gallery (6 cards per page)
  const totalPages = Math.max(1, Math.ceil(filteredMoments.length / PAGE_SIZE))

  const paginatedMoments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredMoments.slice(start, start + PAGE_SIZE)
  }, [filteredMoments, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const element = document.getElementById('lab-moments-gallery')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Lightbox navigation within current filtered list
  const currentList = filteredMoments.length > 0 ? filteredMoments : gallery
  const currentIndex = activePhoto ? currentList.findIndex((p) => p.id === activePhoto.id) : -1

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentList.length === 0) return
    if (currentIndex > 0) {
      setActivePhoto(currentList[currentIndex - 1])
    } else {
      setActivePhoto(currentList[currentList.length - 1])
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentList.length === 0) return
    if (currentIndex < currentList.length - 1) {
      setActivePhoto(currentList[currentIndex + 1])
    } else {
      setActivePhoto(currentList[0])
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-3">
          <Sparkle size={14} weight="bold" />
          <span>About Us & Lab Life</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About UIT-Together Research Group
        </h1>
        <p className="text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Pioneering research in Computer Vision, Machine Learning, Aerial Remote Sensing, and Vietnamese Document AI
          at the University of Information Technology, Vietnam National University - Ho Chi Minh City.
        </p>
      </div>

      {/* Lab Overview & Facilities */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {siteConfig?.about?.facilityTitle || 'Our Mission & Research Environment'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {siteConfig?.about?.facilityDescription || 'Founded with the ambition of bridging theoretical artificial intelligence with real-world computer vision systems, UIT-Together brings together faculty advisors, postgraduates, and passionate student cohorts to solve pressing challenges in drone surveillance, anomaly forecasting, document digitisation, and multi-modal scene understanding.'}
          </p>

          <div className="space-y-3 pt-2 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                <MapPin size={18} weight="bold" />
              </div>
              <div>
                <strong className="block text-slate-900">Lab Headquarters</strong>
                <span>{siteConfig?.about?.facilityRoom || 'Room A108, Block A'}, {siteConfig?.about?.facilityBuilding || 'University of Information Technology (VNU-HCM)'}</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  {siteConfig?.about?.facilityAddress || 'Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City, Vietnam'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                <Envelope size={18} weight="bold" />
              </div>
              <div>
                <strong className="block text-slate-900">Lab Inquiries & Contact</strong>
                <div className="text-xs text-slate-600 space-y-0.5 mt-0.5">
                  <p>
                    <a href="mailto:khangnttm@uit.edu.vn" className="text-blue-900 font-semibold hover:underline">
                      khangnttm@uit.edu.vn
                    </a>{' '}
                    (Dr. Nguyễn Tấn Trần Minh Khang)
                  </p>
                  <p>
                    <a href="mailto:nguyenvd@uit.edu.vn" className="text-blue-900 font-semibold hover:underline">
                      nguyenvd@uit.edu.vn
                    </a>{' '}
                    (Dr. Võ Duy Nguyên)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                <Globe size={18} weight="bold" />
              </div>
              <div>
                <strong className="block text-slate-900">University Portal</strong>
                <a
                  href="https://www.uit.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-900 font-semibold hover:underline"
                >
                  www.uit.edu.vn (University of Information Technology)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Campus Photo */}
        <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          <img
            src="/images/about/UIT.jpg"
            alt="University of Information Technology VNU-HCM"
            className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      {/* LAB MOMENTS & ACADEMIC MEMORIES GALLERY (Paginated: 6 cards per page) */}
      <section id="lab-moments-gallery" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold mb-2">
              <Camera size={16} weight="bold" />
              <span>Lab Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lab Activities & Academic Milestones
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Memories from weekly research seminars, national conferences (REV-ECIT), graduation days, and celebrations.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {categories.map((cat) => {
              const count = cat === 'All' ? gallery.length : gallery.filter((g) => g.event === cat).length
              const isSelected = selectedFilter === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedFilter(cat)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Status / Count bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong className="text-slate-900">{filteredMoments.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, filteredMoments.length)}</strong> of {filteredMoments.length} photos ({gallery.length} total)
          </span>
          {selectedFilter !== 'All' && (
            <button
              onClick={() => {
                setSelectedFilter('All')
                setCurrentPage(1)
              }}
              className="text-blue-900 font-semibold hover:underline"
            >
              Reset to All
            </button>
          )}
        </div>

        {/* Filtered Moments Grid (6 cards per page) */}
        {paginatedMoments.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMoments.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setActivePhoto(photo)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      {photo.event} • {photo.year}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
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
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Camera size={44} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No photos found</h3>
            <p className="text-sm text-slate-500 mt-1">
              No photos currently listed under this category.
            </p>
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X size={20} weight="bold" />
            </button>

            {/* Prev / Next Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <CaretLeft size={22} weight="bold" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <CaretRight size={22} weight="bold" />
            </button>

            {/* Photo View */}
            <div className="relative aspect-16/10 sm:aspect-16/9 bg-black flex items-center justify-center">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {/* Caption & Metadata */}
            <div className="p-6 bg-slate-950/80 border-t border-slate-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-900 text-blue-100">
                  {activePhoto.event}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{activePhoto.year}</span>
              </div>
              <h3 className="font-bold text-base text-white">{activePhoto.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{activePhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
