import React, { useState } from 'react'
import { X, Copy, Check } from '@phosphor-icons/react'
import type { Paper } from '../types'

interface BibtexModalProps {
  paper: Paper | null
  onClose: () => void
}

export const generateBibtex = (paper: Paper): string => {
  if (paper.bibtex) return paper.bibtex

  const firstAuthor = paper.authors.split(',')[0].trim().split(' ').pop() || 'author'
  const key = `${firstAuthor.toLowerCase()}${paper.year}${paper.title.slice(0, 10).replace(/[^a-zA-Z]/g, '').toLowerCase()}`
  const entryType = paper.type === 'journal' ? 'article' : 'inproceedings'

  return `@${entryType}{${key},
  title = {${paper.title}},
  author = {${paper.authors}},
  ${paper.type === 'journal' ? 'journal' : 'booktitle'} = {${paper.venue}},
  year = {${paper.year}}${paper.doi ? `,\n  doi = {${paper.doi}}` : ''}${paper.url ? `,\n  url = {${paper.url}}` : ''}
}`
}

export const BibtexModal: React.FC<BibtexModalProps> = ({ paper, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!paper) return null

  const bibtex = generateBibtex(paper)

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">BibTeX Citation</h3>
            <p className="text-xs text-slate-500 truncate max-w-md">{paper.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="relative">
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-800">
              <code>{bibtex}</code>
            </pre>
            <button
              onClick={handleCopy}
              className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy BibTeX'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
