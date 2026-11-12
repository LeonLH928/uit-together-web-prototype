import React from 'react'
import { ArrowSquareOut, Quotes, FilePdf, GithubLogo } from '@phosphor-icons/react'
import type { Paper } from '../types'

interface PaperCardProps {
  paper: Paper
  onOpenBibtex: (paper: Paper) => void
  layout?: 'auto' | 'stacked' | 'horizontal'
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onOpenBibtex, layout = 'auto' }) => {
  const isStacked = layout === 'stacked'

  return (
    <article className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between gap-4 group overflow-hidden">
      <div
        className={
          isStacked
            ? 'flex flex-col items-start gap-4'
            : 'flex flex-col md:flex-row items-start gap-6 justify-between'
        }
      >
        <div className="space-y-2.5 flex-1 min-w-0 w-full">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-white shrink-0">
              {paper.year}
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0 ${
                paper.type === 'journal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {paper.type}
            </span>

            {paper.quartile && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                {paper.quartile}
              </span>
            )}

            {paper.tags && paper.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors break-words">
            {paper.url ? (
              <a
                href={paper.url}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-start gap-1"
              >
                <span>{paper.title}</span>
                <ArrowSquareOut size={16} className="shrink-0 mt-1 text-slate-400 group-hover:text-blue-900" />
              </a>
            ) : (
              paper.title
            )}
          </h3>

          {/* Authors */}
          <p className="text-sm text-slate-600 font-medium break-words">
            {paper.authors}
          </p>

          {/* Venue */}
          <p className="text-xs sm:text-sm text-slate-500 italic break-words">
            {paper.venue}
          </p>
        </div>

        {paper.thumbnail && (
          <div
            className={
              isStacked
                ? 'w-full h-48 sm:h-56 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 bg-slate-100 relative group/thumb shadow-xs'
                : 'w-full md:w-72 lg:w-80 xl:w-96 h-52 sm:h-52 md:h-56 rounded-xl overflow-hidden shrink-0 border border-slate-200/90 bg-slate-100 relative group/thumb shadow-xs'
            }
          >
            <a
              href={paper.url || paper.pdfUrl || '#'}
              target={paper.url || paper.pdfUrl ? '_blank' : undefined}
              rel="noreferrer"
              className="block w-full h-full cursor-pointer relative"
              title={`View ${paper.title}`}
            >
              <img
                src={paper.thumbnail}
                alt={paper.title}
                className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-white font-medium shadow-xs">
                Paper Preview
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        {paper.url && (
          <a
            href={paper.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowSquareOut size={14} />
            <span>DOI / Link</span>
          </a>
        )}

        {paper.pdfUrl && (
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
          >
            <FilePdf size={14} />
            <span>PDF</span>
          </a>
        )}

        {paper.codeUrl && (
          <a
            href={paper.codeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <GithubLogo size={14} />
            <span>Code</span>
          </a>
        )}

        <button
          onClick={() => onOpenBibtex(paper)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 transition-colors ml-auto"
        >
          <Quotes size={14} weight="bold" />
          <span>BibTeX</span>
        </button>
      </div>
    </article>
  )
}
