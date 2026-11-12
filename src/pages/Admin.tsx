import React, { useState, useRef } from 'react'
import {
  Key,
  SignOut,
  PlusCircle,
  Trash,
  GithubLogo,
  DownloadSimple,
  CheckCircle,
  WarningCircle,
  Sparkle,
  Article,
  Megaphone,
  BookOpen,
  Eye,
  FloppyDisk,
  Users,
  Camera,
  PencilSimple,
  Database,
  SlidersHorizontal,
  UploadSimple,
  FileCsv,
  ArrowSquareOut,
  X,
  MagnifyingGlass,
  Check,
  Flask,
  VideoCamera,
  CalendarCheck,
  CalendarBlank,
  MapPin,
  Globe,
  Clock
} from '@phosphor-icons/react'
import { useDataStore } from '../store/useDataStore'
import { PaperCard } from '../components/PaperCard'
import { MemberCard } from '../components/MemberCard'
import { ConferenceCard } from '../components/ConferenceCard'
import type { Paper, Member, NewsItem, Tutorial, GalleryItem, Dataset, SiteConfig, ResearchProject, Conference } from '../types'
import {
  parseCSV,
  batchResolveDOIs,
  parseFullFieldsCSV,
  downloadSampleCsv,
  parseMembersCSV,
  parseQuickRosterText,
  downloadSampleMembersCsv
} from '../utils/csvHelper'

const DEFAULT_PASSCODE = 'uit-admin'

/**
 * Reusable Image Upload Field Component
 * File-picker upload button only (Base64 Data URL) - zero manual path inputs.
 */
interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  required?: boolean
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  helperText,
  required
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Notice: Image is larger than 3MB. Resizing or compressing is recommended for optimal page speed.')
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onChange(event.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-16 h-12 rounded-lg border border-slate-200 bg-slate-200 overflow-hidden shrink-0 relative shadow-2xs">
              <img
                src={value}
                alt="Uploaded thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = '0.3'
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle size={13} weight="fill" className="text-emerald-600" />
                <span>Image Attached</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">Ready to save</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <UploadSimple size={13} weight="bold" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove image"
            >
              <Trash size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50/80 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 font-semibold text-xs transition-all flex items-center gap-2 group cursor-pointer"
          >
            <UploadSimple size={16} weight="bold" className="text-slate-400 group-hover:text-blue-900 transition-colors" />
            <span>Upload Image</span>
          </button>
        </div>
      )}

      {helperText && <span className="text-[11px] text-slate-400 block">{helperText}</span>}
    </div>
  )
}

/**
 * Reusable Media (Image or Video) Upload Field Component
 * Supports both high-res images and video clips (MP4/WebM) with preview player.
 */
interface MediaUploadFieldProps {
  label: string
  value: string
  mediaType: 'image' | 'video'
  onChange: (value: string, detectedType?: 'image' | 'video') => void
  helperText?: string
  required?: boolean
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  label,
  value,
  mediaType,
  onChange,
  helperText,
  required
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isVid = file.type.startsWith('video') || file.name.endsWith('.mp4') || file.name.endsWith('.webm')
      const detected: 'image' | 'video' = isVid ? 'video' : 'image'

      const reader = new FileReader()
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onChange(event.target.result, detected)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const isVideo = mediaType === 'video' || (value && (value.startsWith('data:video') || value.endsWith('.mp4')))

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/mp4,video/webm"
        className="hidden"
      />

      {value ? (
        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-20 h-14 rounded-lg border border-slate-200 bg-slate-900 overflow-hidden shrink-0 relative shadow-2xs flex items-center justify-center">
              {isVideo ? (
                <video src={value} className="w-full h-full object-cover" muted autoPlay loop playsInline />
              ) : (
                <img
                  src={value}
                  alt="Media preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.3'
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle size={13} weight="fill" className="text-emerald-600" />
                <span>{isVideo ? 'Video Attached' : 'Image Attached'}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">Ready to save</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <UploadSimple size={13} weight="bold" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('')
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove media"
            >
              <Trash size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-700 bg-slate-50/80 hover:bg-blue-50/50 text-slate-700 hover:text-blue-900 font-semibold text-xs transition-all flex items-center gap-2 group cursor-pointer"
          >
            <UploadSimple size={16} weight="bold" className="text-slate-400 group-hover:text-blue-900 transition-colors" />
            <span>Upload Media File (Image / Video)</span>
          </button>
        </div>
      )}

      {helperText && <span className="text-[11px] text-slate-400 block">{helperText}</span>}
    </div>
  )
}

export const Admin: React.FC = () => {
  const {
    papers,
    members,
    gallery,
    news,
    tutorials,
    datasets,
    projects,
    siteConfig,
    addPaper,
    updatePaper,
    deletePaper,
    addPapersBatch,
    addMember,
    updateMember,
    deleteMember,
    addMembersBatch,
    addProject,
    updateProject,
    deleteProject,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    addNews,
    updateNews,
    deleteNews,
    addTutorial,
    updateTutorial,
    deleteTutorial,
    addDataset,
    updateDataset,
    deleteDataset,
    updateSiteConfig,
    conferences,
    addConference,
    updateConference,
    deleteConference,
    exportConferencesJson,
    resetToDefaults,
    exportPapersJson,
    exportMembersJson,
    exportGalleryJson,
    exportDatasetsJson,
    exportProjectsJson,
    exportNewsJson,
    exportTutorialsJson,
    exportSiteConfigJson
  } = useDataStore()

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('uit_admin_auth') === 'true'
  })
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'papers' | 'conferences' | 'research' | 'datasets' | 'members' | 'gallery' | 'news' | 'site-config' | 'publish'
  >('papers')

  // ==========================================
  // 1. PAPERS STATE & HANDLERS
  // ==========================================
  const [paperEntryMode, setPaperEntryMode] = useState<'single' | 'batch'>('single')
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null)
  const [paperForm, setPaperForm] = useState({
    title: '',
    authors: '',
    venue: '',
    year: new Date().getFullYear(),
    type: 'journal' as 'journal' | 'conference',
    quartile: 'SCIE, Q1',
    url: '',
    pdfUrl: '',
    codeUrl: '',
    thumbnail: '',
    tags: 'Computer Vision, Deep Learning'
  })
  const [bibtexInput, setBibtexInput] = useState('')
  const [paperSaveSuccess, setPaperSaveSuccess] = useState(false)
  const [paperError, setPaperError] = useState<string | null>(null)
  const [paperSearchQuery, setPaperSearchQuery] = useState('')

  // Batch CSV Publications Import State
  const [batchFormat, setBatchFormat] = useState<'doi' | 'full'>('full')
  const [batchRawText, setBatchRawText] = useState('')
  const [parsedBatchPapers, setParsedBatchPapers] = useState<Omit<Paper, 'id'>[]>([])
  const [isResolvingDoi, setIsResolvingDoi] = useState(false)
  const [doiProgress, setDoiProgress] = useState<{ done: number; total: number } | null>(null)
  const [batchImportSuccess, setBatchImportSuccess] = useState<string | null>(null)
  const batchFileInputRef = useRef<HTMLInputElement>(null)

  // ==========================================
  // RESEARCH AREAS & DIRECTIONS STATE
  // ==========================================
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: 'Medical Imaging, Deep Learning',
    mediaType: 'video' as 'image' | 'video',
    mediaUrl: '',
    caption: '',
    icon: 'Atom'
  })
  const [projectSaveSuccess, setProjectSaveSuccess] = useState(false)
  const [projectError, setProjectError] = useState<string | null>(null)
  const [projectSearchQuery, setProjectSearchQuery] = useState('')

  // ==========================================
  // CONFERENCES STATE
  // ==========================================
  const [editingConferenceId, setEditingConferenceId] = useState<string | null>(null)
  const [conferenceForm, setConferenceForm] = useState({
    acronym: '',
    year: new Date().getFullYear() + 1,
    name: '',
    topics: 'vision, machine-learning',
    website: '',
    source_urls: '',
    location: '',
    starts_on: '',
    ends_on: '',
    date_status: 'confirmed' as 'confirmed' | 'tentative' | 'unannounced',
    deadlines: [
      {
        label: 'Main Paper',
        date: '',
        zone: 'AoE',
        at: '',
        status: 'confirmed' as 'confirmed' | 'tentative' | 'unannounced',
        source: ''
      }
    ],
    notes_en: '',
    notes_vi: '',
    series_url: ''
  })
  const [conferenceSaveSuccess, setConferenceSaveSuccess] = useState(false)
  const [conferenceError, setConferenceError] = useState<string | null>(null)
  const [conferenceSearchQuery, setConferenceSearchQuery] = useState('')

  // ==========================================
  // 2. DATASETS STATE & HANDLERS
  // ==========================================
  const [editingDatasetId, setEditingDatasetId] = useState<string | null>(null)
  const [datasetForm, setDatasetForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    description: '',
    highlights: '',
    paper: '',
    paperUrl: '',
    githubUrl: '',
    image: '',
    tags: 'Benchmark, Computer Vision'
  })
  const [datasetSaveSuccess, setDatasetSaveSuccess] = useState(false)
  const [datasetError, setDatasetError] = useState<string | null>(null)
  const [datasetSearchQuery, setDatasetSearchQuery] = useState('')

  // ==========================================
  // 3. SITE CONFIG STATE & HANDLERS
  // ==========================================
  const [siteForm, setSiteForm] = useState<SiteConfig>(siteConfig)
  const [siteSaveSuccess, setSiteSaveSuccess] = useState(false)

  // ==========================================
  // 4. MEMBERS STATE & HANDLERS
  // ==========================================
  const [memberEntryMode, setMemberEntryMode] = useState<'single' | 'batch'>('single')
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: 'Undergraduate Student',
    position: 'Research Assistant',
    cohort: 'Cohort K2023',
    email: '',
    image: '',
    bio: '',
    scholar: '',
    github: '',
    alum: false
  })
  const [memberSaveSuccess, setMemberSaveSuccess] = useState(false)
  const [memberError, setMemberError] = useState<string | null>(null)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [memberFilterRole, setMemberFilterRole] = useState<'All' | 'Student' | 'Faculty' | 'Alum'>('All')

  // Batch Members Import State
  const [batchMemberFormat, setBatchMemberFormat] = useState<'roster' | 'csv'>('roster')
  const [batchMemberCohort, setBatchMemberCohort] = useState('Cohort K2023')
  const [batchMemberRole, setBatchMemberRole] = useState('Undergraduate Student')
  const [batchMemberPosition, setBatchMemberPosition] = useState('Research Assistant')
  const [batchMemberRawText, setBatchMemberRawText] = useState('')
  const [parsedBatchMembers, setParsedBatchMembers] = useState<Omit<Member, 'id'>[]>([])
  const [batchMemberImportSuccess, setBatchMemberImportSuccess] = useState<string | null>(null)
  const batchMemberFileInputRef = useRef<HTMLInputElement>(null)

  // ==========================================
  // 5. GALLERY STATE & HANDLERS
  // ==========================================
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null)
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    event: 'Lab Activities',
    year: new Date().getFullYear(),
    image: '',
    caption: ''
  })
  const [gallerySaveSuccess, setGallerySaveSuccess] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [gallerySearchQuery, setGallerySearchQuery] = useState('')
  const [galleryFilterEvent, setGalleryFilterEvent] = useState<string>('All')

  // ==========================================
  // 6. NEWS STATE & HANDLERS
  // ==========================================
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [newsForm, setNewsForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    category: 'Publication' as NewsItem['category'],
    url: ''
  })
  const [newsSaveSuccess, setNewsSaveSuccess] = useState(false)

  // ==========================================
  // 7. TUTORIALS STATE & HANDLERS
  // ==========================================
  const [editingTutId, setEditingTutId] = useState<string | null>(null)
  const [tutForm, setTutForm] = useState({
    title: '',
    description: '',
    url: '',
    category: 'Framework & Tools',
    tags: 'PyTorch, Setup'
  })
  const [tutSaveSuccess, setTutSaveSuccess] = useState(false)

  // ==========================================
  // 8. GITHUB PUBLISHING STATE
  // ==========================================
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('uit_gh_token') || ''
  })
  const [repoName, setRepoName] = useState('UIT-Together/UIT-Together.github.io')
  const [commitMessage, setCommitMessage] = useState('Update research data via Admin Portal')
  const [targetFile, setTargetFile] = useState<
    'all' | 'papers' | 'conferences' | 'research' | 'datasets' | 'members' | 'gallery' | 'news' | 'siteConfig'
  >('all')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  // ==========================================
  // AUTHENTICATION LOGIC
  // ==========================================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode === DEFAULT_PASSCODE || passcode === 'uit2024') {
      setIsAuthenticated(true)
      sessionStorage.setItem('uit_admin_auth', 'true')
      setAuthError('')
    } else {
      setAuthError('Invalid passcode. Default prototype code is: uit-admin')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('uit_admin_auth')
  }

  // ==========================================
  // PUBLICATIONS HANDLERS
  // ==========================================
  const handleParseBibtex = () => {
    if (!bibtexInput.trim()) return

    try {
      const titleMatch = bibtexInput.match(/title\s*=\s*[{"]([^}"]+)[}"]/i)
      const authorMatch = bibtexInput.match(/author\s*=\s*[{"]([^}"]+)[}"]/i)
      const journalMatch = bibtexInput.match(/(?:journal|booktitle)\s*=\s*[{"]([^}"]+)[}"]/i)
      const yearMatch = bibtexInput.match(/year\s*=\s*[{"]?(\d{4})[}"]?/i)
      const doiMatch = bibtexInput.match(/doi\s*=\s*[{"]([^}"]+)[}"]/i)
      const urlMatch = bibtexInput.match(/url\s*=\s*[{"]([^}"]+)[}"]/i)

      const isConf = /@inproceedings/i.test(bibtexInput)

      setPaperForm((prev) => ({
        ...prev,
        title: titleMatch ? titleMatch[1].trim() : prev.title,
        authors: authorMatch ? authorMatch[1].replace(/\s+and\s+/g, ', ').trim() : prev.authors,
        venue: journalMatch ? journalMatch[1].trim() : prev.venue,
        year: yearMatch ? parseInt(yearMatch[1]) : prev.year,
        type: isConf ? 'conference' : 'journal',
        url: doiMatch ? `https://doi.org/${doiMatch[1].trim()}` : urlMatch ? urlMatch[1].trim() : prev.url
      }))
    } catch {
      alert('Could not parse BibTeX format automatically. Please check syntax.')
    }
  }

  const isValidUrl = (str: string) => {
    try {
      const u = new URL(str, window.location.origin)
      return u.protocol === 'http:' || u.protocol === 'https:' || str.startsWith('/')
    } catch {
      return false
    }
  }

  const handleAddOrUpdatePaper = (e: React.FormEvent) => {
    e.preventDefault()

    if (!paperForm.title.trim()) {
      setPaperError('Publication title is required.')
      return
    }
    if (!paperForm.authors.trim()) {
      setPaperError('Author list is required.')
      return
    }
    const pubYear = Number(paperForm.year)
    if (isNaN(pubYear) || pubYear < 1990 || pubYear > new Date().getFullYear() + 2) {
      setPaperError(`Please enter a valid publication year (1990 - ${new Date().getFullYear() + 2}).`)
      return
    }
    if (!paperForm.venue.trim()) {
      setPaperError('Conference or journal venue is required.')
      return
    }
    if (paperForm.url.trim() && !isValidUrl(paperForm.url.trim())) {
      setPaperError('Publication DOI / Web URL must be a valid http:// or https:// link.')
      return
    }
    if (paperForm.pdfUrl.trim() && !isValidUrl(paperForm.pdfUrl.trim())) {
      setPaperError('PDF URL must be a valid link.')
      return
    }
    if (paperForm.codeUrl.trim() && !isValidUrl(paperForm.codeUrl.trim())) {
      setPaperError('Code repository URL must be a valid link.')
      return
    }

    setPaperError(null)

    const paperPayload: Omit<Paper, 'id'> = {
      title: paperForm.title.trim(),
      authors: paperForm.authors.trim(),
      venue: paperForm.venue.trim() || 'Scientific Publication',
      year: Number(paperForm.year) || new Date().getFullYear(),
      type: paperForm.type,
      quartile: paperForm.quartile.trim() || undefined,
      url: paperForm.url.trim() || undefined,
      pdfUrl: paperForm.pdfUrl.trim() || undefined,
      codeUrl: paperForm.codeUrl.trim() || undefined,
      thumbnail: paperForm.thumbnail.trim() || undefined,
      tags: paperForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }

    if (editingPaperId) {
      updatePaper(editingPaperId, paperPayload)
      setEditingPaperId(null)
    } else {
      addPaper(paperPayload)
    }

    setPaperSaveSuccess(true)
    setTimeout(() => setPaperSaveSuccess(false), 3000)

    setPaperForm({
      title: '',
      authors: '',
      venue: '',
      year: new Date().getFullYear(),
      type: 'journal',
      quartile: 'SCIE, Q1',
      url: '',
      pdfUrl: '',
      codeUrl: '',
      thumbnail: '',
      tags: 'Computer Vision, Deep Learning'
    })
    setBibtexInput('')
  }

  const handleStartEditPaper = (p: Paper) => {
    setEditingPaperId(p.id)
    setPaperForm({
      title: p.title,
      authors: p.authors,
      venue: p.venue,
      year: p.year,
      type: p.type,
      quartile: p.quartile || 'SCIE, Q1',
      url: p.url || '',
      pdfUrl: p.pdfUrl || '',
      codeUrl: p.codeUrl || '',
      thumbnail: p.thumbnail || '',
      tags: p.tags ? p.tags.join(', ') : 'Computer Vision, Deep Learning'
    })
    const elem = document.getElementById('paper-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditPaper = () => {
    setEditingPaperId(null)
    setPaperForm({
      title: '',
      authors: '',
      venue: '',
      year: new Date().getFullYear(),
      type: 'journal',
      quartile: 'SCIE, Q1',
      url: '',
      pdfUrl: '',
      codeUrl: '',
      thumbnail: '',
      tags: 'Computer Vision, Deep Learning'
    })
    setBibtexInput('')
  }

  // Handle Batch CSV File Upload
  const handleBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = String(event.target?.result || '')
      setBatchRawText(content)
      processBatchContent(content, batchFormat)
    }
    reader.readAsText(file)
  }

  const processBatchContent = async (text: string, format: 'doi' | 'full') => {
    if (!text.trim()) {
      setParsedBatchPapers([])
      return
    }

    if (format === 'full') {
      const parsed = parseFullFieldsCSV(text)
      setParsedBatchPapers(parsed)
    } else {
      // Format 1: DOI list
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.toLowerCase().startsWith('doi'))

      if (lines.length === 0) {
        setParsedBatchPapers([])
        return
      }

      setIsResolvingDoi(true)
      setDoiProgress({ done: 0, total: lines.length })

      try {
        const { successful } = await batchResolveDOIs(lines, (done, total) => {
          setDoiProgress({ done, total })
        })
        setParsedBatchPapers(successful)
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Error resolving DOIs via Crossref')
      } finally {
        setIsResolvingDoi(false)
        setDoiProgress(null)
      }
    }
  }

  const handleExecuteBatchImport = () => {
    if (parsedBatchPapers.length === 0) return

    const count = addPapersBatch(parsedBatchPapers)
    setBatchImportSuccess(`Successfully imported ${count} publications into the repository!`)
    setTimeout(() => setBatchImportSuccess(null), 4000)

    setParsedBatchPapers([])
    setBatchRawText('')
    if (batchFileInputRef.current) batchFileInputRef.current.value = ''
  }

  // ==========================================
  // RESEARCH DIRECTIONS HANDLERS
  // ==========================================
  const handleAddOrUpdateProject = (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectForm.title.trim()) {
      setProjectError('Research direction title is required.')
      return
    }
    if (!projectForm.description.trim() || projectForm.description.trim().length < 10) {
      setProjectError('Please provide a descriptive overview (at least 10 characters) of this research direction.')
      return
    }
    if (!projectForm.mediaUrl.trim()) {
      setProjectError('Please upload or provide a media preview (image or MP4/WebM video).')
      return
    }

    setProjectError(null)

    const projectPayload: Omit<ResearchProject, 'id'> = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      tags: projectForm.tags
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean),
      mediaType: projectForm.mediaType,
      mediaUrl: projectForm.mediaUrl.trim() || undefined,
      caption: projectForm.caption.trim() || undefined,
      icon: projectForm.icon.trim() || undefined
    }

    if (editingProjectId) {
      updateProject(editingProjectId, projectPayload)
      setEditingProjectId(null)
    } else {
      addProject(projectPayload)
    }

    setProjectSaveSuccess(true)
    setTimeout(() => setProjectSaveSuccess(false), 3000)

    setProjectForm({
      title: '',
      description: '',
      tags: 'Medical Imaging, Deep Learning',
      mediaType: 'video',
      mediaUrl: '',
      caption: '',
      icon: 'Atom'
    })
  }

  const handleStartEditProject = (proj: ResearchProject) => {
    setEditingProjectId(proj.id)
    setProjectForm({
      title: proj.title,
      description: proj.description,
      tags: proj.tags ? proj.tags.join(', ') : '',
      mediaType: proj.mediaType || 'image',
      mediaUrl: proj.mediaUrl || '',
      caption: proj.caption || '',
      icon: proj.icon || 'Atom'
    })
    const elem = document.getElementById('project-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditProject = () => {
    setEditingProjectId(null)
    setProjectForm({
      title: '',
      description: '',
      tags: 'Medical Imaging, Deep Learning',
      mediaType: 'video',
      mediaUrl: '',
      caption: '',
      icon: 'Atom'
    })
  }

  // ==========================================
  // CONFERENCES HANDLERS
  // ==========================================
  const handleAddDeadlineRow = () => {
    setConferenceForm((prev) => ({
      ...prev,
      deadlines: [
        ...prev.deadlines,
        {
          label: 'Short Paper',
          date: '',
          zone: 'AoE',
          at: '',
          status: 'confirmed',
          source: ''
        }
      ]
    }))
  }

  const handleRemoveDeadlineRow = (index: number) => {
    setConferenceForm((prev) => ({
      ...prev,
      deadlines: prev.deadlines.filter((_, idx) => idx !== index)
    }))
  }

  const handleDeadlineChange = (
    index: number,
    field: 'label' | 'date' | 'zone' | 'at' | 'status' | 'source',
    value: string
  ) => {
    setConferenceForm((prev) => {
      const updated = [...prev.deadlines]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, deadlines: updated }
    })
  }

  const handleAddOrUpdateConference = (e: React.FormEvent) => {
    e.preventDefault()

    if (!conferenceForm.acronym.trim()) {
      setConferenceError('Conference acronym is required (e.g. CVPR, ICCV, ECCV).')
      return
    }
    if (!conferenceForm.name.trim()) {
      setConferenceError('Conference full name is required.')
      return
    }
    const confYear = Number(conferenceForm.year)
    if (isNaN(confYear) || confYear < 2000 || confYear > 2100) {
      setConferenceError('Please enter a valid 4-digit conference year (e.g. 2026).')
      return
    }
    if (conferenceForm.starts_on && conferenceForm.ends_on) {
      if (conferenceForm.starts_on > conferenceForm.ends_on) {
        setConferenceError(
          `Conference Start Date (${conferenceForm.starts_on}) cannot be after End Date (${conferenceForm.ends_on}).`
        )
        return
      }
    }
    if (conferenceForm.website.trim() && !isValidUrl(conferenceForm.website.trim())) {
      setConferenceError('Conference website must be a valid URL starting with http:// or https://')
      return
    }
    for (const d of conferenceForm.deadlines) {
      if (d.date.trim()) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date.trim())) {
          setConferenceError(`Deadline for "${d.label || 'Submission'}" must follow YYYY-MM-DD format (received "${d.date}").`)
          return
        }
        if (conferenceForm.starts_on && d.date.trim() > conferenceForm.starts_on) {
          setConferenceError(`Deadline "${d.label || 'Submission'}" (${d.date}) cannot be later than Conference Start Date (${conferenceForm.starts_on}).`)
          return
        }
      }
    }

    setConferenceError(null)

    const topicsArr = conferenceForm.topics
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean)

    const sourceUrlsArr = conferenceForm.source_urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)

    const conferencePayload: Omit<Conference, 'id'> = {
      acronym: conferenceForm.acronym.trim(),
      year: Number(conferenceForm.year),
      name: conferenceForm.name.trim(),
      topics: topicsArr.length > 0 ? topicsArr : ['vision', 'machine-learning'],
      website: conferenceForm.website.trim(),
      source_urls: sourceUrlsArr.length > 0 ? sourceUrlsArr : (conferenceForm.website ? [conferenceForm.website.trim()] : []),
      location: conferenceForm.location.trim(),
      starts_on: conferenceForm.starts_on ? conferenceForm.starts_on.trim() : null,
      ends_on: conferenceForm.ends_on ? conferenceForm.ends_on.trim() : null,
      date_status: conferenceForm.date_status,
      deadlines: conferenceForm.deadlines
        .filter((d) => d.label.trim())
        .map((d) => ({
          label: d.label.trim(),
          date: d.date.trim(),
          zone: d.zone ? d.zone.trim() : null,
          at: d.at ? d.at.trim() : null,
          status: d.status,
          source: d.source ? d.source.trim() : undefined
        })),
      notes_en: conferenceForm.notes_en.trim() || undefined,
      notes_vi: conferenceForm.notes_vi.trim() || undefined,
      series_url: conferenceForm.series_url.trim() || undefined
    }

    if (editingConferenceId) {
      updateConference(editingConferenceId, conferencePayload)
      setEditingConferenceId(null)
    } else {
      addConference(conferencePayload)
    }

    setConferenceSaveSuccess(true)
    setTimeout(() => setConferenceSaveSuccess(false), 3000)

    setConferenceForm({
      acronym: '',
      year: new Date().getFullYear() + 1,
      name: '',
      topics: 'vision, machine-learning',
      website: '',
      source_urls: '',
      location: '',
      starts_on: '',
      ends_on: '',
      date_status: 'confirmed',
      deadlines: [
        {
          label: 'Main Paper',
          date: '',
          zone: 'AoE',
          at: '',
          status: 'confirmed',
          source: ''
        }
      ],
      notes_en: '',
      notes_vi: '',
      series_url: ''
    })
  }

  const handleStartEditConference = (conf: Conference) => {
    setEditingConferenceId(conf.id)
    setConferenceForm({
      acronym: conf.acronym,
      year: conf.year,
      name: conf.name,
      topics: (conf.topics || []).join(', '),
      website: conf.website || '',
      source_urls: (conf.source_urls || []).join('\n'),
      location: conf.location || '',
      starts_on: conf.starts_on || '',
      ends_on: conf.ends_on || '',
      date_status: (conf.date_status as 'confirmed' | 'tentative' | 'unannounced') || 'confirmed',
      deadlines:
        conf.deadlines && conf.deadlines.length > 0
          ? conf.deadlines.map((d) => ({
              label: d.label || '',
              date: d.date || '',
              zone: d.zone || 'AoE',
              at: d.at || '',
              status: d.status || 'confirmed',
              source: d.source || ''
            }))
          : [
              {
                label: 'Main Paper',
                date: '',
                zone: 'AoE',
                at: '',
                status: 'confirmed',
                source: ''
              }
            ],
      notes_en: conf.notes_en || '',
      notes_vi: conf.notes_vi || '',
      series_url: conf.series_url || ''
    })
    const elem = document.getElementById('conference-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditConference = () => {
    setEditingConferenceId(null)
    setConferenceForm({
      acronym: '',
      year: new Date().getFullYear() + 1,
      name: '',
      topics: 'vision, machine-learning',
      website: '',
      source_urls: '',
      location: '',
      starts_on: '',
      ends_on: '',
      date_status: 'confirmed',
      deadlines: [
        {
          label: 'Main Paper',
          date: '',
          zone: 'AoE',
          at: '',
          status: 'confirmed',
          source: ''
        }
      ],
      notes_en: '',
      notes_vi: '',
      series_url: ''
    })
  }

  const previewConference: Conference = {
    id: editingConferenceId || 'preview-conf',
    acronym: conferenceForm.acronym || 'CONF',
    year: Number(conferenceForm.year) || new Date().getFullYear() + 1,
    name: conferenceForm.name || 'International Conference on Computer Vision and Machine Learning',
    topics: conferenceForm.topics.split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
    website: conferenceForm.website || 'https://example.org',
    location: conferenceForm.location || 'Location, Country',
    starts_on: conferenceForm.starts_on || '2027-06-20',
    ends_on: conferenceForm.ends_on || '2027-06-25',
    date_status: conferenceForm.date_status,
    deadlines: conferenceForm.deadlines
      .filter((d) => d.label.trim())
      .map((d) => ({
        label: d.label,
        date: d.date || '2026-11-15',
        zone: d.zone || 'AoE',
        at: d.at || null,
        status: d.status
      })),
    notes_en: conferenceForm.notes_en,
    notes_vi: conferenceForm.notes_vi
  }

  // ==========================================
  // DATASETS HANDLERS
  // ==========================================
  const handleAddOrUpdateDataset = (e: React.FormEvent) => {
    e.preventDefault()

    if (!datasetForm.title.trim()) {
      setDatasetError('Dataset title is required.')
      return
    }
    if (!datasetForm.description.trim()) {
      setDatasetError('Dataset description is required.')
      return
    }
    const dsYear = Number(datasetForm.year)
    if (isNaN(dsYear) || dsYear < 2000 || dsYear > new Date().getFullYear() + 2) {
      setDatasetError(`Please enter a valid dataset release year (2000 - ${new Date().getFullYear() + 2}).`)
      return
    }
    if (!datasetForm.image.trim()) {
      setDatasetError('Please upload a preview/benchmark teaser image for the dataset.')
      return
    }
    if (datasetForm.githubUrl.trim() && !isValidUrl(datasetForm.githubUrl.trim())) {
      setDatasetError('Dataset GitHub / download URL must be a valid link.')
      return
    }
    if (datasetForm.paperUrl.trim() && !isValidUrl(datasetForm.paperUrl.trim())) {
      setDatasetError('Documentation / Paper URL must be a valid link.')
      return
    }

    setDatasetError(null)

    const datasetPayload: Omit<Dataset, 'id'> = {
      title: datasetForm.title.trim(),
      year: Number(datasetForm.year) || new Date().getFullYear(),
      description: datasetForm.description.trim(),
      highlights: datasetForm.highlights
        ? datasetForm.highlights
            .split(/\r?\n/)
            .map((h) => h.replace(/^[•*-]\s*/, '').trim())
            .filter(Boolean)
        : undefined,
      paper: datasetForm.paper.trim() || undefined,
      paperUrl: datasetForm.paperUrl.trim() || undefined,
      githubUrl: datasetForm.githubUrl.trim() || undefined,
      image: datasetForm.image.trim() || undefined,
      tags: datasetForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }

    if (editingDatasetId) {
      updateDataset(editingDatasetId, datasetPayload)
      setEditingDatasetId(null)
    } else {
      addDataset(datasetPayload)
    }

    setDatasetSaveSuccess(true)
    setTimeout(() => setDatasetSaveSuccess(false), 3000)

    setDatasetForm({
      title: '',
      year: new Date().getFullYear(),
      description: '',
      highlights: '',
      paper: '',
      paperUrl: '',
      githubUrl: '',
      image: '',
      tags: 'Benchmark, Computer Vision'
    })
  }

  const handleStartEditDataset = (d: Dataset) => {
    setEditingDatasetId(d.id)
    setDatasetForm({
      title: d.title,
      year: d.year,
      description: d.description,
      highlights: d.highlights ? d.highlights.join('\n') : '',
      paper: d.paper || '',
      paperUrl: d.paperUrl || '',
      githubUrl: d.githubUrl || '',
      image: d.image || '',
      tags: d.tags.join(', ')
    })
    const elem = document.getElementById('dataset-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditDataset = () => {
    setEditingDatasetId(null)
    setDatasetForm({
      title: '',
      year: new Date().getFullYear(),
      description: '',
      highlights: '',
      paper: '',
      paperUrl: '',
      githubUrl: '',
      image: '',
      tags: 'Benchmark, Computer Vision'
    })
  }

  // ==========================================
  // SITE CONFIG HANDLERS
  // ==========================================
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault()
    updateSiteConfig(siteForm)
    setSiteSaveSuccess(true)
    setTimeout(() => setSiteSaveSuccess(false), 3000)
  }

  // ==========================================
  // MEMBERS HANDLERS
  // ==========================================
  const handleAddOrUpdateMember = (e: React.FormEvent) => {
    e.preventDefault()

    if (!memberForm.name.trim()) {
      setMemberError('Member full name is required.')
      return
    }
    if (!memberForm.position.trim()) {
      setMemberError('Position or research role is required.')
      return
    }
    if (memberForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email.trim())) {
      setMemberError('Please enter a valid email address (e.g. name@uit.edu.vn).')
      return
    }
    if (memberForm.scholar.trim() && !isValidUrl(memberForm.scholar.trim())) {
      setMemberError('Google Scholar URL must be a valid link.')
      return
    }
    if (memberForm.github.trim() && !isValidUrl(memberForm.github.trim())) {
      setMemberError('GitHub profile URL must be a valid link.')
      return
    }

    setMemberError(null)

    const memberPayload = {
      name: memberForm.name.trim(),
      role: memberForm.role,
      position: memberForm.position.trim() || 'Research Assistant',
      cohort: memberForm.cohort.trim() || undefined,
      email: memberForm.email.trim() || undefined,
      image: memberForm.image.trim() || undefined,
      bio: memberForm.bio.trim() || undefined,
      scholar: memberForm.scholar.trim() || undefined,
      github: memberForm.github.trim() || undefined,
      alum: memberForm.alum
    }

    if (editingMemberId) {
      updateMember(editingMemberId, memberPayload)
      setEditingMemberId(null)
    } else {
      addMember(memberPayload)
    }

    setMemberSaveSuccess(true)
    setTimeout(() => setMemberSaveSuccess(false), 3000)

    setMemberForm({
      name: '',
      role: 'Undergraduate Student',
      position: 'Research Assistant',
      cohort: 'Cohort K2022',
      email: '',
      image: '',
      bio: '',
      scholar: '',
      github: '',
      alum: false
    })
  }

  const handleStartEditMember = (m: Member) => {
    setEditingMemberId(m.id)
    setMemberForm({
      name: m.name,
      role: m.role,
      position: m.position,
      cohort: m.cohort || '',
      email: m.email || '',
      image: m.image || '',
      bio: m.bio || '',
      scholar: m.scholar || '',
      github: m.github || '',
      alum: m.alum
    })
    const elem = document.getElementById('member-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditMember = () => {
    setEditingMemberId(null)
    setMemberForm({
      name: '',
      role: 'Undergraduate Student',
      position: 'Research Assistant',
      cohort: 'Cohort K2023',
      email: '',
      image: '',
      bio: '',
      scholar: '',
      github: '',
      alum: false
    })
  }

  // Handle Batch Member File Upload
  const handleBatchMemberFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = String(event.target?.result || '')
      setBatchMemberRawText(content)
      processBatchMemberContent(content, batchMemberFormat, batchMemberCohort, batchMemberRole, batchMemberPosition)
    }
    reader.readAsText(file)
  }

  const processBatchMemberContent = (
    text: string,
    format: 'roster' | 'csv',
    cohort: string,
    role = batchMemberRole,
    position = batchMemberPosition
  ) => {
    if (!text.trim()) {
      setParsedBatchMembers([])
      return
    }

    if (format === 'csv') {
      const parsed = parseMembersCSV(text)
      setParsedBatchMembers(parsed)
    } else {
      const parsed = parseQuickRosterText(text, cohort, role, position)
      setParsedBatchMembers(parsed)
    }
  }

  const handleExecuteBatchMemberImport = () => {
    if (parsedBatchMembers.length === 0) return

    const count = addMembersBatch(parsedBatchMembers)
    setBatchMemberImportSuccess(`Successfully imported ${count} researchers to the directory!`)
    setTimeout(() => setBatchMemberImportSuccess(null), 4000)

    setParsedBatchMembers([])
    setBatchMemberRawText('')
    if (batchMemberFileInputRef.current) batchMemberFileInputRef.current.value = ''
  }

  // ==========================================
  // GALLERY HANDLERS & CATEGORY CRUD
  // ==========================================
  const handleAddOrUpdateGallery = (e: React.FormEvent) => {
    e.preventDefault()

    if (!galleryForm.title.trim()) {
      setGalleryError('Photo title is required.')
      return
    }
    if (!galleryForm.event.trim()) {
      setGalleryError('Event category is required.')
      return
    }
    const galYear = Number(galleryForm.year)
    if (isNaN(galYear) || galYear < 2000 || galYear > new Date().getFullYear() + 2) {
      setGalleryError(`Please enter a valid event year (2000 - ${new Date().getFullYear() + 2}).`)
      return
    }
    if (!galleryForm.image.trim()) {
      setGalleryError('Please upload an event photo image.')
      return
    }

    setGalleryError(null)

    const galleryPayload = {
      title: galleryForm.title.trim(),
      event: galleryForm.event.trim() || 'Lab Activities',
      year: Number(galleryForm.year) || new Date().getFullYear(),
      image: galleryForm.image.trim(),
      caption: galleryForm.caption.trim()
    }

    if (editingGalleryId) {
      updateGalleryItem(editingGalleryId, galleryPayload)
      setEditingGalleryId(null)
    } else {
      addGalleryItem(galleryPayload)
    }

    setGallerySaveSuccess(true)
    setTimeout(() => setGallerySaveSuccess(false), 3000)

    setGalleryForm({
      title: '',
      event: 'Lab Activities',
      year: new Date().getFullYear(),
      image: '',
      caption: ''
    })
  }

  const handleStartEditGallery = (g: GalleryItem) => {
    setEditingGalleryId(g.id)
    setGalleryForm({
      title: g.title,
      event: g.event,
      year: g.year,
      image: g.image,
      caption: g.caption
    })
    const elem = document.getElementById('gallery-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditGallery = () => {
    setEditingGalleryId(null)
    setGalleryError(null)
    setGalleryForm({
      title: '',
      event: 'Lab Activities',
      year: new Date().getFullYear(),
      image: '',
      caption: ''
    })
  }

  // ==========================================
  // NEWS HANDLERS
  // ==========================================
  const handleAddOrUpdateNews = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsForm.title || !newsForm.summary) return

    const newsPayload = {
      title: newsForm.title.trim(),
      date: newsForm.date,
      summary: newsForm.summary.trim(),
      category: newsForm.category,
      url: newsForm.url.trim() || undefined
    }

    if (editingNewsId) {
      updateNews(editingNewsId, newsPayload)
      setEditingNewsId(null)
    } else {
      addNews(newsPayload)
    }

    setNewsSaveSuccess(true)
    setTimeout(() => setNewsSaveSuccess(false), 3000)

    setNewsForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      category: 'Publication',
      url: ''
    })
  }

  const handleStartEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id)
    setNewsForm({
      title: item.title,
      date: item.date,
      summary: item.summary,
      category: item.category,
      url: item.url || ''
    })
    const elem = document.getElementById('news-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditNews = () => {
    setEditingNewsId(null)
    setNewsForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      category: 'Publication',
      url: ''
    })
  }

  // ==========================================
  // TUTORIALS HANDLERS
  // ==========================================
  const handleAddOrUpdateTutorial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tutForm.title || !tutForm.url) return

    const tutPayload = {
      title: tutForm.title.trim(),
      description: tutForm.description.trim(),
      url: tutForm.url.trim(),
      isExternal: true,
      category: tutForm.category.trim() || 'Framework & Tools',
      tags: tutForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }

    if (editingTutId) {
      updateTutorial(editingTutId, tutPayload)
      setEditingTutId(null)
    } else {
      addTutorial(tutPayload)
    }

    setTutSaveSuccess(true)
    setTimeout(() => setTutSaveSuccess(false), 3000)

    setTutForm({
      title: '',
      description: '',
      url: '',
      category: 'Framework & Tools',
      tags: 'PyTorch, Setup'
    })
  }

  const handleStartEditTutorial = (item: Tutorial) => {
    setEditingTutId(item.id)
    setTutForm({
      title: item.title,
      description: item.description,
      url: item.url,
      category: item.category,
      tags: item.tags.join(', ')
    })
    const elem = document.getElementById('tut-form-top')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEditTutorial = () => {
    setEditingTutId(null)
    setTutForm({
      title: '',
      description: '',
      url: '',
      category: 'Framework & Tools',
      tags: 'PyTorch, Setup'
    })
  }

  // ==========================================
  // GITHUB PUBLISHING & EXPORT
  // ==========================================
  const handleDownloadFile = (getContent: () => string, filename: string) => {
    const jsonStr = getContent()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCommitToGitHub = async () => {
    if (!githubToken) {
      setPublishStatus({
        success: false,
        message: 'Please provide a GitHub Personal Access Token (PAT) with repo write scope.'
      })
      return
    }

    setIsPublishing(true)
    setPublishStatus(null)
    localStorage.setItem('uit_gh_token', githubToken)

    try {
      const filesToCommit: { path: string; getContent: () => string; name: string }[] = []

      if (targetFile === 'all' || targetFile === 'papers') {
        filesToCommit.push({ path: 'src/data/papers.json', getContent: exportPapersJson, name: 'papers.json' })
      }
      if (targetFile === 'all' || targetFile === 'conferences') {
        filesToCommit.push({ path: 'src/data/conferences.json', getContent: exportConferencesJson, name: 'conferences.json' })
      }
      if (targetFile === 'all' || targetFile === 'research') {
        filesToCommit.push({ path: 'src/data/projects.json', getContent: exportProjectsJson, name: 'projects.json' })
      }
      if (targetFile === 'all' || targetFile === 'datasets') {
        filesToCommit.push({ path: 'src/data/datasets.json', getContent: exportDatasetsJson, name: 'datasets.json' })
      }
      if (targetFile === 'all' || targetFile === 'members') {
        filesToCommit.push({ path: 'src/data/members.json', getContent: exportMembersJson, name: 'members.json' })
      }
      if (targetFile === 'all' || targetFile === 'gallery') {
        filesToCommit.push({ path: 'src/data/gallery.json', getContent: exportGalleryJson, name: 'gallery.json' })
      }
      if (targetFile === 'all' || targetFile === 'news') {
        filesToCommit.push({ path: 'src/data/news.json', getContent: exportNewsJson, name: 'news.json' })
      }
      if (targetFile === 'all' || targetFile === 'siteConfig') {
        filesToCommit.push({ path: 'src/data/siteConfig.json', getContent: exportSiteConfigJson, name: 'siteConfig.json' })
      }

      const committedNames: string[] = []

      for (const file of filesToCommit) {
        let actualPath = file.path
        let getFileRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${actualPath}`, {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        })

        if (!getFileRes.ok) {
          const altRes = await fetch(`https://api.github.com/repos/${repoName}/contents/prototype/${actualPath}`, {
            headers: {
              Authorization: `token ${githubToken}`,
              Accept: 'application/vnd.github.v3+json'
            }
          })
          if (altRes.ok) {
            getFileRes = altRes
            actualPath = `prototype/${actualPath}`
          }
        }

        let currentSha = ''
        if (getFileRes.ok) {
          const fileData = await getFileRes.json()
          currentSha = fileData.sha
        }

        const contentBase64 = btoa(unescape(encodeURIComponent(file.getContent())))
        const putRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${actualPath}`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${githubToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: commitMessage || `Update ${file.name} via UIT Admin Portal`,
            content: contentBase64,
            ...(currentSha ? { sha: currentSha } : {})
          })
        })

        if (!putRes.ok) {
          const errData = await putRes.json()
          throw new Error(`Failed to commit ${file.name}: ${errData.message || 'Check repository write permissions'}`)
        }

        committedNames.push(file.name)
      }

      setPublishStatus({
        success: true,
        message: `Successfully committed ${committedNames.join(', ')} to GitHub! Vercel automated deployment has been triggered.`
      })
    } catch (err: unknown) {
      setPublishStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Network error communicating with GitHub API'
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Previews
  const previewPaper: Paper = {
    id: 'preview',
    title: paperForm.title || 'Publication Title Preview',
    authors: paperForm.authors || 'First Author, Second Author, Dr. Khang Nguyen',
    venue: paperForm.venue || 'IEEE Transactions / CVPR (2024)',
    year: Number(paperForm.year) || new Date().getFullYear(),
    type: paperForm.type,
    quartile: paperForm.quartile,
    url: paperForm.url || '#',
    pdfUrl: paperForm.pdfUrl,
    codeUrl: paperForm.codeUrl,
    thumbnail: paperForm.thumbnail,
    tags: paperForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
  }

  const previewMember: Member = {
    id: 'preview',
    name: memberForm.name || 'Member Full Name',
    role: memberForm.role,
    position: memberForm.position || 'Research Position',
    cohort: memberForm.cohort || undefined,
    email: memberForm.email || undefined,
    image: memberForm.image || undefined,
    bio: memberForm.bio || 'Brief research interests and background preview...',
    scholar: memberForm.scholar || undefined,
    github: memberForm.github || undefined,
    alum: memberForm.alum
  }

  const previewGallery: GalleryItem = {
    id: 'preview-gallery',
    title: galleryForm.title || 'Tiêu đề hình ảnh kỷ niệm',
    event: galleryForm.event || 'Lab Activities',
    year: Number(galleryForm.year) || new Date().getFullYear(),
    image: galleryForm.image || '',
    caption: galleryForm.caption || 'Chú thích ảnh và bối cảnh sự kiện sẽ hiển thị tại đây...'
  }

  // PASSCODE UNLOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 flex items-center justify-center mx-auto shadow-md border border-slate-100">
            <img src="/uit-together-logo.png" alt="UIT-Together Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lab Admin Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              Authentication required for content management and updates.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Admin Passcode
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Default prototype code: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-900">uit-admin</code>
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                <WarningCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors"
            >
              Unlock Admin Portal
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-1 border border-emerald-200">
            <CheckCircle size={12} weight="fill" />
            <span>Authenticated Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Content Management Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full CRUD administration for Publications, Datasets, Team, Gallery, Announcements, and Site Texts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Reload default seeded dataset"
          >
            Reset Seed Data
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <SignOut size={14} weight="bold" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'papers', label: `Publications (${papers.length})`, icon: Article },
          { id: 'conferences', label: `Conferences (${conferences.length})`, icon: CalendarCheck },
          { id: 'research', label: `Research Areas (${projects.length})`, icon: Flask },
          { id: 'datasets', label: `Datasets (${datasets.length})`, icon: Database },
          { id: 'members', label: `Team & Students (${members.length})`, icon: Users },
          { id: 'gallery', label: `About & Gallery (${gallery.length})`, icon: Camera },
          { id: 'site-config', label: 'Site Texts & Content', icon: SlidersHorizontal },
          { id: 'news', label: `Announcements (${news.length})`, icon: Megaphone },
          { id: 'publish', label: 'GitHub Sync & Export', icon: GithubLogo }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-900 text-blue-900 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ========================================== */}
      {/* TAB 1: PUBLICATIONS (SINGLE & BATCH CSV)  */}
      {/* ========================================== */}
      {activeTab === 'papers' && (
        <div className="space-y-6">
          {/* Sub-mode Toggle Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaperEntryMode('single')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  paperEntryMode === 'single'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {editingPaperId ? 'Edit Publication' : 'Single Publication Entry'}
              </button>
              <button
                onClick={() => setPaperEntryMode('batch')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  paperEntryMode === 'batch'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCsv size={16} weight="bold" />
                <span>Batch CSV Import (DOI or Fields)</span>
              </button>
            </div>

            {paperEntryMode === 'batch' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleCsv('doi')}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Sample DOI CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleCsv('full')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Sample Full-Fields CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Sub-view: SINGLE ENTRY / EDIT */}
          {paperEntryMode === 'single' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add / Edit Form (Left) */}
              <div id="paper-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <PlusCircle size={22} className="text-blue-900" />
                      <span>{editingPaperId ? 'Edit Publication' : 'Add New Publication'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {editingPaperId
                        ? 'Update paper metadata, DOI link, authors, and optional card thumbnail.'
                        : 'Enter paper metadata manually or paste a BibTeX citation to auto-fill fields.'}
                    </p>
                  </div>
                  {editingPaperId && (
                    <button
                      type="button"
                      onClick={handleCancelEditPaper}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* BibTeX Quick Importer (only when adding) */}
                {!editingPaperId && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkle size={14} className="text-amber-500" />
                        <span>Auto-Fill from BibTeX</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleParseBibtex}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 transition-colors"
                      >
                        Parse & Auto-Fill
                      </button>
                    </div>
                    <textarea
                      value={bibtexInput}
                      onChange={(e) => setBibtexInput(e.target.value)}
                      placeholder="@article{... title = {...}, author = {...}, journal = {...}, year = {2024} }"
                      rows={3}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleAddOrUpdatePaper} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Publication Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={paperForm.title}
                      onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                      placeholder="e.g. Aerial Data Exploration: An In-Depth Study"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Authors * (comma-separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={paperForm.authors}
                      onChange={(e) => setPaperForm({ ...paperForm, authors: e.target.value })}
                      placeholder="e.g. Nguyen D. Vo, Khang Nguyen, Toan Le"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Journal / Conference Venue *
                      </label>
                      <input
                        type="text"
                        required
                        value={paperForm.venue}
                        onChange={(e) => setPaperForm({ ...paperForm, venue: e.target.value })}
                        placeholder="e.g. IEEE Access / Pattern Recognition Letters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        required
                        value={paperForm.year}
                        onChange={(e) => setPaperForm({ ...paperForm, year: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Type
                      </label>
                      <select
                        value={paperForm.type}
                        onChange={(e) => setPaperForm({ ...paperForm, type: e.target.value as 'journal' | 'conference' })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="journal">Journal Article</option>
                        <option value="conference">Conference Proceeding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quartile / Indexing
                      </label>
                      <input
                        type="text"
                        value={paperForm.quartile}
                        onChange={(e) => setPaperForm({ ...paperForm, quartile: e.target.value })}
                        placeholder="e.g. SCIE, Q1, IF: 5.1"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Upload for Publication */}
                  <ImageUploadField
                    label="Publication Thumbnail (Optional)"
                    value={paperForm.thumbnail}
                    onChange={(val) => setPaperForm({ ...paperForm, thumbnail: val })}
                    helperText="Upload visual illustration or graphical abstract displayed on publication cards."
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      DOI or Paper URL
                    </label>
                    <input
                      type="url"
                      value={paperForm.url}
                      onChange={(e) => setPaperForm({ ...paperForm, url: e.target.value })}
                      placeholder="https://doi.org/10.1109/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        PDF Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={paperForm.pdfUrl}
                        onChange={(e) => setPaperForm({ ...paperForm, pdfUrl: e.target.value })}
                        placeholder="https://arxiv.org/pdf/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Code / Dataset URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={paperForm.codeUrl}
                        onChange={(e) => setPaperForm({ ...paperForm, codeUrl: e.target.value })}
                        placeholder="https://github.com/UIT-Together/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={paperForm.tags}
                      onChange={(e) => setPaperForm({ ...paperForm, tags: e.target.value })}
                      placeholder="Computer Vision, Aerial Imagery, Deep Learning"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {paperError && (
                    <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                      <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                      <span>{paperError}</span>
                    </div>
                  )}

                  {paperSaveSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                      <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                      <span>{editingPaperId ? 'Publication updated successfully!' : 'Publication saved successfully!'}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={18} weight="bold" />
                    <span>{editingPaperId ? 'Update Publication' : 'Save Publication'}</span>
                  </button>
                </form>
              </div>

              {/* Live Preview & Existing Publications List (Right) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Eye size={16} />
                    <span>Live Card Preview</span>
                  </div>
                  <PaperCard paper={previewPaper} onOpenBibtex={() => {}} layout="stacked" />
                </div>

                {/* Existing Publications Roster with Edit & Delete */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">
                      Existing Publications ({papers.length})
                    </h3>
                  </div>

                  <div className="relative">
                    <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={paperSearchQuery}
                      onChange={(e) => setPaperSearchQuery(e.target.value)}
                      placeholder="Search publications..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                    {papers
                      .filter(
                        (p) =>
                          !paperSearchQuery ||
                          p.title.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
                          p.authors.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
                          p.venue.toLowerCase().includes(paperSearchQuery.toLowerCase())
                      )
                      .map((paper) => (
                        <div
                          key={paper.id}
                          className="flex items-start justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <span className="font-bold text-blue-900">[{paper.year}]</span>{' '}
                            <span className="font-semibold text-slate-800 line-clamp-1">{paper.title}</span>
                            <p className="text-slate-500 line-clamp-1">{paper.venue}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEditPaper(paper)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit publication"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete publication: "${paper.title}"?`)) {
                                  deletePaper(paper.id)
                                }
                              }}
                              className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete publication"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-view: BATCH CSV IMPORT */}
          {paperEntryMode === 'batch' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileCsv size={24} className="text-blue-900" />
                    <span>Batch CSV Publications Importer</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload or paste multiple publications at once. Choose between automated DOI resolution or full metadata fields for accepted papers.
                  </p>
                </div>

                {/* Format Selector Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => {
                      setBatchFormat('full')
                      processBatchContent(batchRawText, 'full')
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      batchFormat === 'full'
                        ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Format 1: Full Fields CSV (Recommended)</span>
                      {batchFormat === 'full' && <Check size={16} weight="bold" className="text-blue-900" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      For accepted papers and preprints. Columns: <code className="text-blue-900 font-mono">title,authors,venue,year,type,quartile,url,pdfUrl,codeUrl,tags,thumbnail</code>.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setBatchFormat('doi')
                      processBatchContent(batchRawText, 'doi')
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      batchFormat === 'doi'
                        ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Format 2: DOI List (Automated Crossref)</span>
                      {batchFormat === 'doi' && <Check size={16} weight="bold" className="text-blue-900" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Provide a column or list of DOIs. Our system queries the Crossref API to auto-fetch official title, author list, journal, and year.
                    </p>
                  </div>
                </div>

                {/* File Upload & Text Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Upload .CSV / .TXT File or Paste Content Below:
                    </label>
                    <input
                      type="file"
                      ref={batchFileInputRef}
                      onChange={handleBatchFileUpload}
                      accept=".csv,.txt"
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>

                  <textarea
                    rows={6}
                    value={batchRawText}
                    onChange={(e) => {
                      setBatchRawText(e.target.value)
                      processBatchContent(e.target.value, batchFormat)
                    }}
                    placeholder={
                      batchFormat === 'full'
                        ? `title,authors,venue,year,type,quartile,url,pdfUrl,codeUrl,tags,thumbnail\n"Adverse Weather Object Detection","Nguyen D. Vo, Khang Nguyen","IEEE Access",2024,journal,"SCIE, Q1","https://doi.org/...","","","Computer Vision",""`
                        : `doi\n10.3390/jimaging8120323\n10.1109/ACCESS.2023.3289000`
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
                  />
                </div>

                {isResolvingDoi && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>
                      Resolving DOIs via Crossref REST API... {doiProgress ? `(${doiProgress.done} of ${doiProgress.total})` : ''}
                    </span>
                  </div>
                )}

                {batchImportSuccess && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                    <span>{batchImportSuccess}</span>
                  </div>
                )}

                {/* Parsed Preview Table */}
                {parsedBatchPapers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Parsed Publications Ready for Import ({parsedBatchPapers.length}):
                      </span>
                      <button
                        type="button"
                        onClick={handleExecuteBatchImport}
                        className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                      >
                        <PlusCircle size={16} weight="bold" />
                        <span>Import {parsedBatchPapers.length} Publications</span>
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Year</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Title</th>
                            <th className="p-2.5">Authors</th>
                            <th className="p-2.5">Venue</th>
                            <th className="p-2.5">Quartile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsedBatchPapers.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-blue-900 whitespace-nowrap">{p.year}</td>
                              <td className="p-2.5 capitalize whitespace-nowrap">{p.type}</td>
                              <td className="p-2.5 font-semibold text-slate-900 max-w-xs truncate">{p.title}</td>
                              <td className="p-2.5 text-slate-600 max-w-xs truncate">{p.authors}</td>
                              <td className="p-2.5 text-slate-500 max-w-xs truncate">{p.venue}</td>
                              <td className="p-2.5 whitespace-nowrap">{p.quartile || 'SCIE'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: CONFERENCES & SUBMISSION DEADLINES    */}
      {/* ========================================== */}
      {activeTab === 'conferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Conference Form (Left Column) */}
          <div id="conference-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={22} className="text-blue-900" />
                  <span>{editingConferenceId ? 'Edit Conference' : 'Add New Conference'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingConferenceId
                    ? 'Update conference edition dates, submission deadlines, and official links.'
                    : 'Add a new conference venue, paper submission deadline, and tracking details.'}
                </p>
              </div>
              {editingConferenceId && (
                <button
                  type="button"
                  onClick={handleCancelEditConference}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateConference} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acronym *
                  </label>
                  <input
                    type="text"
                    required
                    value={conferenceForm.acronym}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, acronym: e.target.value })}
                    placeholder="e.g. CVPR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Edition Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={conferenceForm.year}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date Status *
                  </label>
                  <select
                    value={conferenceForm.date_status}
                    onChange={(e) =>
                      setConferenceForm({
                        ...conferenceForm,
                        date_status: e.target.value as 'confirmed' | 'tentative' | 'unannounced'
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="confirmed">Official Dates (Confirmed)</option>
                    <option value="tentative">Tentative (Estimated)</option>
                    <option value="unannounced">To Be Announced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Conference Name *
                </label>
                <input
                  type="text"
                  required
                  value={conferenceForm.name}
                  onChange={(e) => setConferenceForm({ ...conferenceForm, name: e.target.value })}
                  placeholder="e.g. IEEE/CVF Conference on Computer Vision and Pattern Recognition"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conference Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={conferenceForm.location}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, location: e.target.value })}
                    placeholder="e.g. Seattle, Washington, USA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Research Topics (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={conferenceForm.topics}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, topics: e.target.value })}
                    placeholder="vision, machine-learning, medical"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conference Start Date
                  </label>
                  <input
                    type="date"
                    value={conferenceForm.starts_on}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, starts_on: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conference End Date
                  </label>
                  <input
                    type="date"
                    value={conferenceForm.ends_on}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, ends_on: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Website URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={conferenceForm.website}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, website: e.target.value })}
                    placeholder="https://cvpr.thecvf.com/Conferences/2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Persistent Series URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={conferenceForm.series_url}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, series_url: e.target.value })}
                    placeholder="https://cvpr.thecvf.com/"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Dynamic Submission Deadlines Section */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                      <Clock size={15} weight="bold" />
                      <span>Submission Deadlines</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Specify all paper deadlines (Main Paper, Short Paper, Round 1). AoE is automatically converted.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDeadlineRow}
                    className="px-3 py-1 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} weight="bold" />
                    <span>Add Deadline</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {conferenceForm.deadlines.map((dl, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          Deadline #{idx + 1}
                        </span>
                        {conferenceForm.deadlines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDeadlineRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Remove this deadline"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Label
                          </label>
                          <input
                            type="text"
                            required
                            value={dl.label}
                            onChange={(e) => handleDeadlineChange(idx, 'label', e.target.value)}
                            placeholder="Main Paper"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Date (YYYY-MM-DD)
                          </label>
                          <input
                            type="date"
                            required
                            value={dl.date}
                            onChange={(e) => handleDeadlineChange(idx, 'date', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Zone / Mode
                          </label>
                          <select
                            value={dl.zone || ''}
                            onChange={(e) => handleDeadlineChange(idx, 'zone', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="AoE">AoE (UTC−12)</option>
                            <option value="">Local / Calendar</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Status
                          </label>
                          <select
                            value={dl.status}
                            onChange={(e) =>
                              handleDeadlineChange(
                                idx,
                                'status',
                                e.target.value as 'confirmed' | 'tentative' | 'unannounced'
                              )
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-blue-600"
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="tentative">Tentative</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dates Source URLs (one URL per line)
                </label>
                <textarea
                  rows={2}
                  value={conferenceForm.source_urls}
                  onChange={(e) => setConferenceForm({ ...conferenceForm, source_urls: e.target.value })}
                  placeholder="https://cvpr.thecvf.com/Conferences/2027/Dates"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    English Notes / Workshop Schedule
                  </label>
                  <input
                    type="text"
                    value={conferenceForm.notes_en}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, notes_en: e.target.value })}
                    placeholder="Workshops June 20–21; main sessions June 22–25."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vietnamese Notes
                  </label>
                  <input
                    type="text"
                    value={conferenceForm.notes_vi}
                    onChange={(e) => setConferenceForm({ ...conferenceForm, notes_vi: e.target.value })}
                    placeholder="Workshop ngày 20–21/6; phiên chính ngày 22–25/6."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {conferenceError && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                  <span>{conferenceError}</span>
                </div>
              )}

              {conferenceSaveSuccess && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                  <span>
                    {editingConferenceId
                      ? 'Conference updated successfully in schedule!'
                      : 'Conference added successfully to schedule!'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>
                  {editingConferenceId ? 'Update Conference in Schedule' : 'Save Conference to Schedule'}
                </span>
              </button>
            </form>
          </div>

          {/* Live Preview & Conference Roster (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Preview */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Eye size={16} />
                <span>Live Conference Card Preview</span>
              </div>
              <ConferenceCard
                conference={previewConference}
                currentTime={Date.now()}
                isNearest={true}
              />
            </div>

            {/* Existing Conferences Directory */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Tracked Conferences ({conferences.length})
                </h3>
              </div>

              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={conferenceSearchQuery}
                  onChange={(e) => setConferenceSearchQuery(e.target.value)}
                  placeholder="Search by acronym, name, or city..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {conferences
                  .filter(
                    (c) =>
                      !conferenceSearchQuery ||
                      c.acronym.toLowerCase().includes(conferenceSearchQuery.toLowerCase()) ||
                      c.name.toLowerCase().includes(conferenceSearchQuery.toLowerCase()) ||
                      c.location.toLowerCase().includes(conferenceSearchQuery.toLowerCase())
                  )
                  .map((conf) => (
                    <div
                      key={conf.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-900 font-mono text-sm">
                            {conf.acronym} {conf.year}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                            {conf.deadlines?.length || 0} deadlines
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium truncate">{conf.name}</p>
                        <p className="text-slate-400 text-[11px] truncate">📍 {conf.location}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditConference(conf)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit conference"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete conference "${conf.acronym} ${conf.year}" from schedule?`)) {
                              deleteConference(conf.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete conference"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: RESEARCH AREAS & DIRECTIONS CRUD      */}
      {/* ========================================== */}
      {activeTab === 'research' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Research Direction Form (Left) */}
          <div id="project-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Flask size={22} className="text-blue-900" />
                  <span>{editingProjectId ? 'Edit Research Direction' : 'Add Research Direction'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingProjectId
                    ? 'Update research topic title, description, uploaded media (video/image), and captions.'
                    : 'Add a new research direction to display on the Research and Home tabs.'}
                </p>
              </div>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={handleCancelEditProject}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Research Direction Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  placeholder="e.g. Sparse-View CT Reconstruction"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Research Description & Methodology *
                </label>
                <textarea
                  rows={6}
                  required
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Describe the research motivation, mathematical/physics formulation, deep learning architecture, and clinical or real-world goals (separate paragraphs with blank lines)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Media Type
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="projectMediaType"
                      value="video"
                      checked={projectForm.mediaType === 'video'}
                      onChange={() => setProjectForm({ ...projectForm, mediaType: 'video' })}
                      className="text-blue-900 focus:ring-blue-600"
                    />
                    <span>Video Clip (MP4 / WebM)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="projectMediaType"
                      value="image"
                      checked={projectForm.mediaType === 'image'}
                      onChange={() => setProjectForm({ ...projectForm, mediaType: 'image' })}
                      className="text-blue-900 focus:ring-blue-600"
                    />
                    <span>Figure Image (PNG / JPG)</span>
                  </label>
                </div>
              </div>

              {/* Media File Upload */}
              <MediaUploadField
                label="Research Media Demonstration (File Upload)"
                value={projectForm.mediaUrl}
                mediaType={projectForm.mediaType}
                onChange={(value, detectedType) => {
                  setProjectForm((prev) => ({
                    ...prev,
                    mediaUrl: value,
                    mediaType: detectedType || prev.mediaType
                  }))
                }}
                helperText="Upload an animated video demonstration (e.g. sinogram or anomaly video) or a high-res pathology/model diagram image."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Media Caption (Optional)
                </label>
                <input
                  type="text"
                  value={projectForm.caption}
                  onChange={(e) => setProjectForm({ ...projectForm, caption: e.target.value })}
                  placeholder="e.g. Sinogram · Projection data used as input for CT reconstruction"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keywords & Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  placeholder="e.g. Medical Imaging, CT Reconstruction, Sinogram, Deep Learning"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {projectError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                  <span>{projectError}</span>
                </div>
              )}

              {projectSaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600" />
                  <span>Research Direction saved successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>{editingProjectId ? 'Update Research Direction' : 'Save Research Direction'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Live Preview & Directory List */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Preview Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Eye size={16} />
                <span>Live Research Card Preview</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                    {projectForm.mediaType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Direction Preview</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {projectForm.title || 'Sparse-View CT Reconstruction'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {projectForm.description || 'Starting from a sinogram measured at a limited number of projection angles...'}
                </p>

                {projectForm.mediaUrl ? (
                  <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    {projectForm.mediaType === 'video' || projectForm.mediaUrl.endsWith('.mp4') ? (
                      <video src={projectForm.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : (
                      <img src={projectForm.mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                    Media File Preview Area
                  </div>
                )}

                {projectForm.caption && (
                  <p className="text-[11px] text-slate-500 italic">
                    {projectForm.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Existing Research Directions List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Research Directions ({projects.length})
                </h3>
              </div>

              <input
                type="text"
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                placeholder="Search research topics..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {projects
                  .filter((p) =>
                    projectSearchQuery === '' ||
                    p.title.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                    p.tags.some((t) => t.toLowerCase().includes(projectSearchQuery.toLowerCase()))
                  )
                  .map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{proj.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold uppercase">
                            {proj.mediaType || 'Image'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {proj.tags.join(' • ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditProject(proj)}
                          className="text-blue-900 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit research direction"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete research direction "${proj.title}"?`)) {
                              deleteProject(proj.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete research direction"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: DATASETS CRUD MANAGER              */}
      {/* ========================================== */}
      {activeTab === 'datasets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Dataset Form (Left) */}
          <div id="dataset-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Database size={22} className="text-blue-900" />
                  <span>{editingDatasetId ? 'Edit Benchmark Dataset' : 'Add New Benchmark Dataset'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage the lab's open benchmark datasets, preview imagery, research highlights, and GitHub links.
                </p>
              </div>
              {editingDatasetId && (
                <button
                  type="button"
                  onClick={handleCancelEditDataset}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateDataset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dataset Benchmark Title *
                </label>
                <input
                  type="text"
                  required
                  value={datasetForm.title}
                  onChange={(e) => setDatasetForm({ ...datasetForm, title: e.target.value })}
                  placeholder="e.g. UIT-DODV or VNAnomaly"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Release Year *
                  </label>
                  <input
                    type="number"
                    required
                    value={datasetForm.year}
                    onChange={(e) => setDatasetForm({ ...datasetForm, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={datasetForm.tags}
                    onChange={(e) => setDatasetForm({ ...datasetForm, tags: e.target.value })}
                    placeholder="Document AI, Table Recognition, Benchmarking"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={datasetForm.description}
                  onChange={(e) => setDatasetForm({ ...datasetForm, description: e.target.value })}
                  placeholder="Detailed description of dataset domain, annotations, and benchmarks..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Highlights / Bullet Points (one per line)
                </label>
                <textarea
                  rows={2}
                  value={datasetForm.highlights}
                  onChange={(e) => setDatasetForm({ ...datasetForm, highlights: e.target.value })}
                  placeholder="• 50,000+ high-resolution annotated frames&#10;• Ground truth verified by domain experts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
                />
              </div>

              {/* Dataset Image Uploader */}
              <ImageUploadField
                label="Dataset Thumbnail / Sample Preview Image"
                value={datasetForm.image}
                onChange={(val) => setDatasetForm({ ...datasetForm, image: val })}
                helperText="Upload sample dataset frames or benchmark preview image."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub Repository URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={datasetForm.githubUrl}
                    onChange={(e) => setDatasetForm({ ...datasetForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/UIT-Together/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paper DOI / Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={datasetForm.paperUrl}
                    onChange={(e) => setDatasetForm({ ...datasetForm, paperUrl: e.target.value })}
                    placeholder="https://doi.org/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associated Paper Citation Title (Optional)
                </label>
                <input
                  type="text"
                  value={datasetForm.paper}
                  onChange={(e) => setDatasetForm({ ...datasetForm, paper: e.target.value })}
                  placeholder="e.g. Published in Pattern Recognition Letters 2024"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {datasetError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                  <span>{datasetError}</span>
                </div>
              )}

              {datasetSaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{editingDatasetId ? 'Dataset updated successfully!' : 'Dataset saved successfully!'}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>{editingDatasetId ? 'Update Dataset' : 'Save Dataset'}</span>
              </button>
            </form>
          </div>

          {/* Datasets Roster (Right) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Available Benchmarks ({datasets.length})
                </h3>
              </div>

              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={datasetSearchQuery}
                  onChange={(e) => setDatasetSearchQuery(e.target.value)}
                  placeholder="Search datasets by name, tags..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="max-h-[550px] overflow-y-auto space-y-2 pr-1">
                {datasets
                  .filter(
                    (d) =>
                      !datasetSearchQuery ||
                      d.title.toLowerCase().includes(datasetSearchQuery.toLowerCase()) ||
                      d.tags.some((t) => t.toLowerCase().includes(datasetSearchQuery.toLowerCase()))
                  )
                  .map((dataset) => (
                    <div
                      key={dataset.id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {dataset.image ? (
                          <div className="w-12 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                            <img src={dataset.image} alt={dataset.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {dataset.year}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{dataset.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{dataset.tags.join(', ')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditDataset(dataset)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit dataset"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete dataset benchmark: "${dataset.title}"?`)) {
                              deleteDataset(dataset.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete dataset"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: SITE TEXTS & CONTENT CONFIG         */}
      {/* ========================================== */}
      {activeTab === 'site-config' && (
        <form onSubmit={handleSaveSiteConfig} className="space-y-8 max-w-4xl mx-auto">
          {/* Section A: Home Tab Hero & Stats */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={22} className="text-blue-900" />
                <span>Home Page Hero & Lab Overview</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize the hero text, the hero image displayed alongside "Advancing Computer Vision & Machine Learning", and key lab stats.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hero Pill / Badge
                </label>
                <input
                  type="text"
                  value={siteForm.home.heroBadge}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      home: { ...siteForm.home, heroBadge: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hero Main Heading
                </label>
                <input
                  type="text"
                  value={siteForm.home.heroTitle}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      home: { ...siteForm.home, heroTitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hero Subtitle / Mission Statement
                </label>
                <textarea
                  rows={3}
                  value={siteForm.home.heroSubtitle}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      home: { ...siteForm.home, heroSubtitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Hero Image (Next to title) Uploader */}
              <ImageUploadField
                label="Home Hero Graphic / Image (Next to 'Advancing Computer Vision & Machine Learning')"
                value={siteForm.home.heroImage}
                onChange={(val) =>
                  setSiteForm({
                    ...siteForm,
                    home: { ...siteForm.home, heroImage: val }
                  })
                }
                helperText="Upload the hero image displayed alongside the main heading on the homepage."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hero Image Caption
                </label>
                <input
                  type="text"
                  value={siteForm.home.heroImageCaption || ''}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      home: { ...siteForm.home, heroImageCaption: e.target.value }
                    })
                  }
                  placeholder="e.g. Computer Vision & Deep Learning Research"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stat: Publications</label>
                  <input
                    type="text"
                    value={siteForm.home.statsPublications}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        home: { ...siteForm.home, statsPublications: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stat: Journals</label>
                  <input
                    type="text"
                    value={siteForm.home.statsJournals}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        home: { ...siteForm.home, statsJournals: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stat: Datasets</label>
                  <input
                    type="text"
                    value={siteForm.home.statsDatasets}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        home: { ...siteForm.home, statsDatasets: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stat: Lab Location</label>
                  <input
                    type="text"
                    value={siteForm.home.statsLabLocation}
                    onChange={(e) =>
                      setSiteForm({
                        ...siteForm,
                        home: { ...siteForm.home, statsLabLocation: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-blue-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section B: About Tab Facilities & Leadership */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">About Page Facilities & Leadership</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={siteForm.about.facilityTitle}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, facilityTitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Room</label>
                <input
                  type="text"
                  value={siteForm.about.facilityRoom}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, facilityRoom: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Building</label>
                <input
                  type="text"
                  value={siteForm.about.facilityBuilding}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, facilityBuilding: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={siteForm.about.facilityAddress}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, facilityAddress: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Environment & Facility Description</label>
                <textarea
                  rows={3}
                  value={siteForm.about.facilityDescription}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, facilityDescription: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leadership Section Title</label>
                <input
                  type="text"
                  value={siteForm.about.leadershipTitle}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, leadershipTitle: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Leadership & Advisor Vision Statement</label>
                <textarea
                  rows={2}
                  value={siteForm.about.leadershipDescription}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      about: { ...siteForm.about, leadershipDescription: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section C: Footer Branding & Contacts */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Footer Branding & Lab Contacts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lab Brand Name</label>
                <input
                  type="text"
                  value={siteForm.footer.brandName}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      footer: { ...siteForm.footer, brandName: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteForm.footer.email}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      footer: { ...siteForm.footer, email: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lab Tagline</label>
                <input
                  type="text"
                  value={siteForm.footer.tagline}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      footer: { ...siteForm.footer, tagline: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Address</label>
                <input
                  type="text"
                  value={siteForm.footer.address}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      footer: { ...siteForm.footer, address: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Copyright Notice</label>
                <input
                  type="text"
                  value={siteForm.footer.copyright}
                  onChange={(e) =>
                    setSiteForm({
                      ...siteForm,
                      footer: { ...siteForm.footer, copyright: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          {siteSaveSuccess && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
              <span>Site texts and configurations updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <FloppyDisk size={18} weight="bold" />
            <span>Save All Site Configurations</span>
          </button>
        </form>
      )}

      {/* ========================================== */}
      {/* TAB 4: TEAM & STUDENTS CRUD MANAGER        */}
      {/* ========================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Sub-mode Toggle Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMemberEntryMode('single')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  memberEntryMode === 'single'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {editingMemberId ? 'Edit Team Member' : 'Single Member Entry'}
              </button>
              <button
                onClick={() => setMemberEntryMode('batch')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  memberEntryMode === 'batch'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileCsv size={16} weight="bold" />
                <span>Batch Member Import (CSV / Roster)</span>
              </button>
            </div>

            {memberEntryMode === 'batch' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleMembersCsv}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                >
                  <DownloadSimple size={14} weight="bold" />
                  <span>Download Sample CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Sub-view: SINGLE MEMBER ENTRY / EDIT */}
          {memberEntryMode === 'single' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div id="member-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle size={22} className="text-blue-900" />
                  <span>{editingMemberId ? 'Edit Team Member or Student' : 'Add Team Member or Student'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {editingMemberId ? 'Update details, research bio, and cohort information for this member.' : 'Add undergraduate research assistants, graduate students, or faculty to the lab directory.'}
                </p>
              </div>
              {editingMemberId && (
                <button
                  type="button"
                  onClick={handleCancelEditMember}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="e.g. Bùi Cao Doanh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Category *
                  </label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Undergraduate Student">Undergraduate Student</option>
                    <option value="Graduate Researcher">Graduate Researcher</option>
                    <option value="Researcher">Researcher / Lecturer</option>
                    <option value="Faculty / PI">Faculty / Principal Investigator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.position}
                    onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                    placeholder="e.g. Research Assistant / Lecturer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cohort (for Students)
                  </label>
                  <input
                    type="text"
                    value={memberForm.cohort}
                    onChange={(e) => setMemberForm({ ...memberForm, cohort: e.target.value })}
                    placeholder="e.g. Cohort K2020, Cohort 2022"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    placeholder="e.g. student@uit.edu.vn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Avatar Image Uploader */}
              <ImageUploadField
                label="Avatar Image (Optional)"
                value={memberForm.image}
                onChange={(val) => setMemberForm({ ...memberForm, image: val })}
                helperText="Upload avatar photo. Leave empty to use the default neutral avatar."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Research Topic / Bio (Optional)
                </label>
                <textarea
                  rows={2}
                  value={memberForm.bio}
                  onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                  placeholder="e.g. Adverse weather object detection, Aerial tracking..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Scholar URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={memberForm.scholar}
                    onChange={(e) => setMemberForm({ ...memberForm, scholar: e.target.value })}
                    placeholder="https://scholar.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={memberForm.github}
                    onChange={(e) => setMemberForm({ ...memberForm, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="alum-check"
                  checked={memberForm.alum}
                  onChange={(e) => setMemberForm({ ...memberForm, alum: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="alum-check" className="text-xs font-semibold text-slate-700">
                  Mark as Alumni (graduated / former member)
                </label>
              </div>

              {memberError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                  <span>{memberError}</span>
                </div>
              )}

              {memberSaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>Team member saved successfully to data store!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>{editingMemberId ? 'Update Member in Roster' : 'Save Member to Roster'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Eye size={16} />
                <span>Live Member Card Preview</span>
              </div>
              <div className="max-w-xs mx-auto">
                <MemberCard member={previewMember} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Roster Directory ({members.length})
                </h3>
              </div>

              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search roster by name, cohort..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['All', 'Student', 'Faculty', 'Alum'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setMemberFilterRole(filter)}
                    className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                      memberFilterRole === filter
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {filter === 'All' ? 'All Roles' : filter}
                  </button>
                ))}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {members
                  .filter((m) => {
                    const matchesSearch =
                      memberSearchQuery === '' ||
                      m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                      (m.cohort && m.cohort.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                    const matchesFilter =
                      memberFilterRole === 'All' ||
                      (memberFilterRole === 'Student' && m.role.toLowerCase().includes('student')) ||
                      (memberFilterRole === 'Faculty' && (m.role.includes('Faculty') || m.role.includes('Researcher'))) ||
                      (memberFilterRole === 'Alum' && m.alum)
                    return matchesSearch && matchesFilter
                  })
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {member.image ? (
                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[10px] text-slate-500">{member.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{member.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{member.cohort || member.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditMember(member)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit member"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${member.name}" from team roster?`)) {
                              deleteMember(member.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete member"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-view: BATCH MEMBER IMPORT */}
      {memberEntryMode === 'batch' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users size={24} className="text-blue-900" />
                <span>Batch Members & Cohort Roster Importer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload or paste multiple students and lab members at once. Choose between a quick student name list for cohort onboarding or a full-field CSV.
              </p>
            </div>

            {/* Format Selector Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  setBatchMemberFormat('roster')
                  processBatchMemberContent(batchMemberRawText, 'roster', batchMemberCohort, batchMemberRole, batchMemberPosition)
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  batchMemberFormat === 'roster'
                    ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Format 1: Quick Cohort Roster (Name List)</span>
                  {batchMemberFormat === 'roster' && <Check size={16} weight="bold" className="text-blue-900" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Paste student names directly (one per line). Auto-assigns the selected cohort, role, and position without needing CSV formatting.
                </p>
              </div>

              <div
                onClick={() => {
                  setBatchMemberFormat('csv')
                  processBatchMemberContent(batchMemberRawText, 'csv', batchMemberCohort, batchMemberRole, batchMemberPosition)
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  batchMemberFormat === 'csv'
                    ? 'border-blue-900 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Format 2: Full Fields CSV</span>
                  {batchMemberFormat === 'csv' && <Check size={16} weight="bold" className="text-blue-900" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  For detailed directory entries with bios and links. Columns: <code className="text-blue-900 font-mono">name,role,position,cohort,email,bio,github,scholar,alum</code>.
                </p>
              </div>
            </div>

            {/* Quick Roster Config Options (when in roster mode) */}
            {batchMemberFormat === 'roster' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Cohort
                  </label>
                  <input
                    type="text"
                    value={batchMemberCohort}
                    onChange={(e) => {
                      setBatchMemberCohort(e.target.value)
                      processBatchMemberContent(batchMemberRawText, 'roster', e.target.value, batchMemberRole, batchMemberPosition)
                    }}
                    placeholder="e.g. Cohort K2023"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Cohort K2024', 'Cohort K2023', 'Cohort 2022', 'Cohort K2020'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setBatchMemberCohort(c)
                          processBatchMemberContent(batchMemberRawText, 'roster', c, batchMemberRole, batchMemberPosition)
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                      >
                        {c.replace('Cohort ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Category
                  </label>
                  <select
                    value={batchMemberRole}
                    onChange={(e) => {
                      setBatchMemberRole(e.target.value)
                      processBatchMemberContent(batchMemberRawText, 'roster', batchMemberCohort, e.target.value, batchMemberPosition)
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Undergraduate Student">Undergraduate Student</option>
                    <option value="Graduate Researcher">Graduate Researcher</option>
                    <option value="Researcher">Researcher / Lecturer</option>
                    <option value="Faculty / PI">Faculty / Principal Investigator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Position
                  </label>
                  <input
                    type="text"
                    value={batchMemberPosition}
                    onChange={(e) => {
                      setBatchMemberPosition(e.target.value)
                      processBatchMemberContent(batchMemberRawText, 'roster', batchMemberCohort, batchMemberRole, e.target.value)
                    }}
                    placeholder="e.g. Research Assistant"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>
            )}

            {/* File Upload & Text Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload .CSV / .TXT File or Paste Content Below:
                </label>
                <input
                  type="file"
                  ref={batchMemberFileInputRef}
                  onChange={handleBatchMemberFileUpload}
                  accept=".csv,.txt"
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <textarea
                rows={8}
                value={batchMemberRawText}
                onChange={(e) => {
                  setBatchMemberRawText(e.target.value)
                  processBatchMemberContent(e.target.value, batchMemberFormat, batchMemberCohort, batchMemberRole, batchMemberPosition)
                }}
                placeholder={
                  batchMemberFormat === 'roster'
                    ? `Lê Đức Thành\nNguyễn Ngọc Thanh Phương\nTrần Minh Vũ\nHuỳnh Diên Thục\nPhạm Trần Xuân Tiến\nHuỳnh Nhật Thanh\nĐỗ Minh Dũng`
                    : `name,role,position,cohort,email,bio,github,scholar,alum\n"Le Duc Thanh","Undergraduate Student","Research Assistant","Cohort K2023","thanhld@uit.edu.vn","Deep learning researcher","https://github.com/leducthanh041","",false`
                }
                className="w-full p-3 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            {batchMemberImportSuccess && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                <span>{batchMemberImportSuccess}</span>
              </div>
            )}

            {/* Parsed Preview Table */}
            {parsedBatchMembers.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Parsed Researchers Ready for Import ({parsedBatchMembers.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleExecuteBatchMemberImport}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle size={16} weight="bold" />
                    <span>Import {parsedBatchMembers.length} Researchers to Directory</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Role Category</th>
                        <th className="p-2.5">Position</th>
                        <th className="p-2.5">Cohort</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Alum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedBatchMembers.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {m.name.charAt(0)}
                              </div>
                              <span>{m.name}</span>
                            </div>
                          </td>
                          <td className="p-2.5 whitespace-nowrap">{m.role}</td>
                          <td className="p-2.5 text-slate-600 whitespace-nowrap">{m.position}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium text-[11px]">
                              {m.cohort || 'General'}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 whitespace-nowrap">{m.email || '—'}</td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.alum ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {m.alum ? 'Alum' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================== */}
      {/* TAB 5: ABOUT & GALLERY CRUD                */}
      {/* ========================================== */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div id="gallery-form-top" className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Camera size={22} className="text-blue-900" />
                  <span>{editingGalleryId ? 'Edit Gallery Photo' : 'Add Photo to About & Gallery'}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage research group moments, conference visits, graduation archives, and event categories.
                </p>
              </div>
              {editingGalleryId && (
                <button
                  type="button"
                  onClick={handleCancelEditGallery}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Lễ Tốt Nghiệp Khóa 2022 - Khoảnh khắc nhận bằng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Event Category *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.event}
                    onChange={(e) => setGalleryForm({ ...galleryForm, event: e.target.value })}
                    placeholder="e.g. Lab Activities, Graduation 2022, Conference, Celebration"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={galleryForm.year}
                    onChange={(e) => setGalleryForm({ ...galleryForm, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Gallery Image Uploader */}
              <ImageUploadField
                label="Photo Image *"
                value={galleryForm.image}
                onChange={(val) => setGalleryForm({ ...galleryForm, image: val })}
                required
                helperText="Upload event photo for the gallery."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Caption / Description</label>
                <textarea
                  rows={3}
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  placeholder="Chú thích ảnh và bối cảnh sự kiện..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {galleryError && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                  <WarningCircle size={18} weight="fill" className="text-rose-600 shrink-0" />
                  <span>{galleryError}</span>
                </div>
              )}

              {gallerySaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>Gallery photo saved successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>{editingGalleryId ? 'Update Photo in Gallery' : 'Save Photo to Gallery'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Eye size={16} />
                <span>Live Card Preview</span>
              </div>
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                {galleryForm.image ? (
                  <div className="aspect-16/10 bg-slate-900 overflow-hidden relative">
                    <img
                      src={galleryForm.image}
                      alt={galleryForm.title || 'Preview'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.5'
                      }}
                    />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white">
                      {galleryForm.event || 'Lab Activities'} • {galleryForm.year || new Date().getFullYear()}
                    </span>
                  </div>
                ) : (
                  <div className="aspect-16/10 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-medium border-b border-slate-200">
                    Media File Preview Area
                  </div>
                )}
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{galleryForm.title || 'Tiêu đề hình ảnh kỷ niệm'}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{galleryForm.caption || 'Chú thích ảnh và bối cảnh sự kiện sẽ hiển thị tại đây...'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Gallery Directory ({gallery.length})</h3>
              </div>

              <input
                type="text"
                value={gallerySearchQuery}
                onChange={(e) => setGallerySearchQuery(e.target.value)}
                placeholder="Search photos by title, event, caption..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', ...Array.from(new Set(gallery.map((g) => g.event).filter(Boolean)))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilterEvent(cat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                      galleryFilterEvent === cat ? 'bg-blue-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {gallery
                  .filter((item) => {
                    const matchesSearch =
                      gallerySearchQuery === '' ||
                      item.title.toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
                      item.caption.toLowerCase().includes(gallerySearchQuery.toLowerCase())
                    const matchesFilter = galleryFilterEvent === 'All' || item.event === galleryFilterEvent
                    return matchesSearch && matchesFilter
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.event} • {item.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditGallery(item)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit photo"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete photo: "${item.title}"?`)) {
                              deleteGalleryItem(item.id)
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete photo"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 6: ANNOUNCEMENTS CRUD                  */}
      {/* ========================================== */}
      {activeTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div id="news-form-top" className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Megaphone size={22} className="text-blue-900" />
                <span>{editingNewsId ? 'Edit Announcement' : 'Create Announcement'}</span>
              </h2>
              {editingNewsId && (
                <button
                  type="button"
                  onClick={handleCancelEditNews}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateNews} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="e.g. Paper Accepted in IEEE Access"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newsForm.date}
                    onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as NewsItem['category'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="Publication">Publication</option>
                    <option value="Dataset">Dataset</option>
                    <option value="Award">Award</option>
                    <option value="Defense">Defense</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary Content *</label>
                <textarea
                  rows={4}
                  required
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  placeholder="Brief summary of the announcement..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link (Optional)</label>
                <input
                  type="url"
                  value={newsForm.url}
                  onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {newsSaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
                  <span>{editingNewsId ? 'Announcement updated successfully!' : 'Announcement added successfully!'}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <FloppyDisk size={18} weight="bold" />
                <span>{editingNewsId ? 'Update Announcement' : 'Save Announcement'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Active Announcements ({news.length})</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{item.date}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditNews(item)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit announcement"
                    >
                      <PencilSimple size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete announcement: "${item.title}"?`)) {
                          deleteNews(item.id)
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                      title="Delete announcement"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB: GITHUB PUBLISHING & OFFLINE EXPORT    */}
      {/* ========================================== */}
      {activeTab === 'publish' && (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <GithubLogo size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Direct GitHub API Publishing</h2>
                <p className="text-xs text-slate-500">
                  Commit updated data straight to GitHub from your browser — zero terminal needed.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs text-blue-900 space-y-1 leading-relaxed">
              <p className="font-bold">How this works with Vercel & GitOps:</p>
              <p>
                When you click <strong>Publish & Commit to GitHub</strong>, your browser connects directly to GitHub via its REST API, creating a new commit with the updated JSON files. This Git push automatically triggers Vercel to rebuild and deploy your site in ~20 seconds globally.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Requires <code>repo</code> write permissions. Stored safely in your local browser session.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repository (Owner/Repo)
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Data File(s)
                  </label>
                  <select
                    value={targetFile}
                    onChange={(e) => setTargetFile(e.target.value as typeof targetFile)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="all">All Data Files (Full Repository Sync)</option>
                    <option value="papers">papers.json only (Publications)</option>
                    <option value="conferences">conferences.json only (Conferences & Deadlines)</option>
                    <option value="research">projects.json only (Research Areas & Media)</option>
                    <option value="datasets">datasets.json only (Benchmarks)</option>
                    <option value="members">members.json only (Team & Students)</option>
                    <option value="siteConfig">siteConfig.json only (Site Texts & Home Image)</option>
                    <option value="gallery">gallery.json only (About & Graduation)</option>
                    <option value="news">news.json only (Announcements)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {publishStatus && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                    publishStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {publishStatus.success ? (
                    <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <WarningCircle size={18} weight="fill" className="text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{publishStatus.message}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleCommitToGitHub}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <GithubLogo size={18} />
                <span>{isPublishing ? 'Publishing to GitHub...' : 'Publish & Commit to GitHub'}</span>
              </button>
            </div>
          </div>

          {/* Direct JSON Offline Downloads */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Direct JSON Files Download</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prefer to commit changes locally via git CLI? Download the latest JSON data files directly to your machine:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleDownloadFile(exportPapersJson, 'papers.json')}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-blue-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>papers.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportConferencesJson, 'conferences.json')}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-teal-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>conferences.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportProjectsJson, 'projects.json')}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-indigo-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>projects.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportDatasetsJson, 'datasets.json')}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-cyan-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>datasets.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportMembersJson, 'members.json')}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-emerald-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>members.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportSiteConfigJson, 'siteConfig.json')}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-amber-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>siteConfig.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportGalleryJson, 'gallery.json')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-purple-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>gallery.json</span>
              </button>
              <button
                onClick={() => handleDownloadFile(exportNewsJson, 'news.json')}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-rose-200"
              >
                <DownloadSimple size={15} weight="bold" />
                <span>news.json</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
