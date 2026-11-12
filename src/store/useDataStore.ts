import { create } from 'zustand'
import initialPapers from '../data/papers.json'
import initialMembers from '../data/members.json'
import initialNews from '../data/news.json'
import initialDatasets from '../data/datasets.json'
import initialTutorials from '../data/tutorials.json'
import initialProjects from '../data/projects.json'
import initialGallery from '../data/gallery.json'
import initialSiteConfig from '../data/siteConfig.json'
import initialConferences from '../data/conferences.json'
import type { Paper, Member, NewsItem, Dataset, Tutorial, ResearchProject, GalleryItem, SiteConfig, Conference } from '../types'

interface DataStoreState {
  papers: Paper[]
  members: Member[]
  news: NewsItem[]
  datasets: Dataset[]
  tutorials: Tutorial[]
  projects: ResearchProject[]
  gallery: GalleryItem[]
  galleryCategories: string[]
  siteConfig: SiteConfig
  conferences: Conference[]
  conferencesUpdatedAt: string
  
  // Paper Actions
  addPaper: (paper: Omit<Paper, 'id'>) => Paper
  updatePaper: (id: string, paper: Partial<Paper>) => void
  deletePaper: (id: string) => void
  addPapersBatch: (newPapers: Omit<Paper, 'id'>[]) => number

  // Member Actions
  addMember: (member: Omit<Member, 'id'>) => Member
  updateMember: (id: string, member: Partial<Member>) => void
  deleteMember: (id: string) => void
  addMembersBatch: (newMembers: Omit<Member, 'id'>[]) => number

  // Gallery Actions
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => GalleryItem
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void
  deleteGalleryItem: (id: string) => void
  addGalleryCategory: (category: string) => void
  updateGalleryCategory: (oldCategory: string, newCategory: string) => void
  deleteGalleryCategory: (category: string) => void
  
  // News Actions
  addNews: (news: Omit<NewsItem, 'id'>) => NewsItem
  updateNews: (id: string, news: Partial<NewsItem>) => void
  deleteNews: (id: string) => void
  
  // Tutorial Actions
  addTutorial: (tutorial: Omit<Tutorial, 'id'>) => Tutorial
  updateTutorial: (id: string, tutorial: Partial<Tutorial>) => void
  deleteTutorial: (id: string) => void
  
  // Dataset Actions
  addDataset: (dataset: Omit<Dataset, 'id'>) => Dataset
  updateDataset: (id: string, dataset: Partial<Dataset>) => void
  deleteDataset: (id: string) => void

  // Research Project / Direction Actions
  addProject: (project: Omit<ResearchProject, 'id'>) => ResearchProject
  updateProject: (id: string, project: Partial<ResearchProject>) => void
  deleteProject: (id: string) => void
  exportProjectsJson: () => string

  // Conference Actions
  addConference: (conf: Omit<Conference, 'id'>) => Conference
  updateConference: (id: string, conf: Partial<Conference>) => void
  deleteConference: (id: string) => void
  exportConferencesJson: () => string
  syncConferencesFromLive: () => Promise<boolean>

  // Site Config Actions
  updateSiteConfig: (config: Partial<SiteConfig>) => void

  // Global & Export Actions
  resetToDefaults: () => void
  exportPapersJson: () => string
  exportMembersJson: () => string
  exportGalleryJson: () => string
  exportDatasetsJson: () => string
  exportNewsJson: () => string
  exportTutorialsJson: () => string
  exportSiteConfigJson: () => string
}

// LocalStorage Keys
const PAPERS_KEY = 'uit_together_papers'
const MEMBERS_KEY = 'uit_together_members'
const NEWS_KEY = 'uit_together_news'
const TUTORIALS_KEY = 'uit_together_tutorials'
const GALLERY_KEY = 'uit_together_gallery'
const DATASETS_KEY = 'uit_together_datasets'
const PROJECTS_KEY = 'uit_together_projects'
const SITE_CONFIG_KEY = 'uit_together_site_config'
const CONFERENCES_KEY = 'uit_together_conferences'
const GALLERY_CATEGORIES_KEY = 'uit_together_gallery_categories'
const DEFAULT_GALLERY_CATEGORIES = ['Lab Activities', 'Conference', 'Graduation 2022', 'Graduation 2015', 'Celebration']

const loadStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

const saveStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage', e)
  }
}

const loadStorageMembers = (): Member[] => {
  const loaded = loadStorage(MEMBERS_KEY, initialMembers as Member[])
  // Ensure Bùi Cao Doanh in K2019 is included even if user has previous localStorage session
  const k2019Doanh = (initialMembers as Member[]).find((m) => m.id === 'student-k2019-1-bicaodoanh')
  if (k2019Doanh && !loaded.some((m) => m.id === 'student-k2019-1-bicaodoanh')) {
    loaded.push(k2019Doanh)
    saveStorage(MEMBERS_KEY, loaded)
  }
  // Ensure name consistency for Bùi Cao Doanh across cached sessions
  let modified = false
  loaded.forEach((m) => {
    if (m.id === 'doanh-bui' && m.name !== 'TS. Bùi Cao Doanh') {
      m.name = 'TS. Bùi Cao Doanh'
      modified = true
    }
    if (m.id === 'student-k2019-1-bicaodoanh' && m.name !== 'Bùi Cao Doanh') {
      m.name = 'Bùi Cao Doanh'
      modified = true
    }
  })
  if (modified) {
    saveStorage(MEMBERS_KEY, loaded)
  }
  return loaded
}

const loadStorageProjects = (): ResearchProject[] => {
  const loaded = loadStorage(PROJECTS_KEY, initialProjects as ResearchProject[])
  // If stored projects is using old dummy data (without mediaUrl), reload from updated initialProjects
  if (!loaded || loaded.length === 0 || loaded.some((p) => p.id === 'aerial-vision' || !p.mediaUrl)) {
    saveStorage(PROJECTS_KEY, initialProjects)
    return initialProjects as ResearchProject[]
  }
  return loaded
}

const loadStorageSiteConfig = (): SiteConfig => {
  const loaded = loadStorage(SITE_CONFIG_KEY, initialSiteConfig as SiteConfig)
  if (!loaded?.home?.heroImage || loaded.home.heroImage === '/images/projects/uit-drone21.png') {
    loaded.home.heroImage = '/images/team/team0.jpg'
    loaded.home.heroImageCaption = 'UIT Together research group meeting and discussion session'
    saveStorage(SITE_CONFIG_KEY, loaded)
  }
  return loaded
}

const loadStorageConferences = (): Conference[] => {
  const fallback = ((initialConferences as unknown) as { conferences: Conference[] }).conferences || []
  const loaded = loadStorage(CONFERENCES_KEY, fallback)
  if (!loaded || loaded.length === 0) {
    saveStorage(CONFERENCES_KEY, fallback)
    return fallback
  }
  return loaded
}

const loadStorageGallery = (): GalleryItem[] => {
  const loaded = loadStorage(GALLERY_KEY, initialGallery as GalleryItem[])
  // Ensure all authentic gallery items (including LeTN2022 graduation items) are present in cached sessions
  let modified = false
  const initialList = initialGallery as GalleryItem[]
  initialList.forEach((item) => {
    if (!loaded.some((g) => g.id === item.id)) {
      loaded.push(item)
      modified = true
    }
  })
  if (modified) {
    saveStorage(GALLERY_KEY, loaded)
  }
  return loaded
}

const loadStorageGalleryCategories = (): string[] => {
  const loaded = loadStorage(GALLERY_CATEGORIES_KEY, DEFAULT_GALLERY_CATEGORIES)
  // Ensure Graduation 2022 is present in category list
  if (!loaded.includes('Graduation 2022')) {
    loaded.push('Graduation 2022')
    saveStorage(GALLERY_CATEGORIES_KEY, loaded)
  }
  return loaded.length > 0 ? loaded : DEFAULT_GALLERY_CATEGORIES
}

export const useDataStore = create<DataStoreState>((set, get) => ({
  papers: loadStorage(PAPERS_KEY, initialPapers as Paper[]),
  members: loadStorageMembers(),
  news: loadStorage(NEWS_KEY, initialNews as NewsItem[]),
  datasets: loadStorage(DATASETS_KEY, initialDatasets as Dataset[]),
  tutorials: loadStorage(TUTORIALS_KEY, initialTutorials as Tutorial[]),
  projects: loadStorageProjects(),
  gallery: loadStorageGallery(),
  galleryCategories: loadStorageGalleryCategories(),
  siteConfig: loadStorageSiteConfig(),
  conferences: loadStorageConferences(),
  conferencesUpdatedAt: (initialConferences as unknown as { updated_at?: string }).updated_at || new Date().toISOString(),

  addPaper: (paperData) => {
    const newPaper: Paper = {
      ...paperData,
      id: `paper-${Date.now()}`
    }
    const updated = [newPaper, ...get().papers]
    set({ papers: updated })
    saveStorage(PAPERS_KEY, updated)
    return newPaper
  },

  updatePaper: (id, paperData) => {
    const updated = get().papers.map((p) => (p.id === id ? { ...p, ...paperData } : p))
    set({ papers: updated })
    saveStorage(PAPERS_KEY, updated)
  },

  deletePaper: (id) => {
    const updated = get().papers.filter((p) => p.id !== id)
    set({ papers: updated })
    saveStorage(PAPERS_KEY, updated)
  },

  addPapersBatch: (newPapers) => {
    const timestamp = Date.now()
    const mapped: Paper[] = newPapers.map((p, idx) => ({
      ...p,
      id: `paper-batch-${timestamp}-${idx}`
    }))
    const updated = [...mapped, ...get().papers]
    set({ papers: updated })
    saveStorage(PAPERS_KEY, updated)
    return mapped.length
  },

  addMember: (memberData) => {
    const newMember: Member = {
      ...memberData,
      id: `member-${Date.now()}`
    }
    const updated = [newMember, ...get().members]
    set({ members: updated })
    saveStorage(MEMBERS_KEY, updated)
    return newMember
  },

  updateMember: (id, memberData) => {
    const updated = get().members.map((m) => (m.id === id ? { ...m, ...memberData } : m))
    set({ members: updated })
    saveStorage(MEMBERS_KEY, updated)
  },

  deleteMember: (id) => {
    const updated = get().members.filter((m) => m.id !== id)
    set({ members: updated })
    saveStorage(MEMBERS_KEY, updated)
  },

  addMembersBatch: (newMembers) => {
    const timestamp = Date.now()
    const mapped: Member[] = newMembers.map((m, idx) => ({
      ...m,
      id: `member-batch-${timestamp}-${idx}`
    }))
    const updated = [...mapped, ...get().members]
    set({ members: updated })
    saveStorage(MEMBERS_KEY, updated)
    return mapped.length
  },

  addGalleryItem: (itemData) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gallery-${Date.now()}`
    }
    const updated = [newItem, ...get().gallery]
    set({ gallery: updated })
    saveStorage(GALLERY_KEY, updated)
    return newItem
  },

  updateGalleryItem: (id, itemData) => {
    const updated = get().gallery.map((g) => (g.id === id ? { ...g, ...itemData } : g))
    set({ gallery: updated })
    saveStorage(GALLERY_KEY, updated)
  },

  deleteGalleryItem: (id) => {
    const updated = get().gallery.filter((g) => g.id !== id)
    set({ gallery: updated })
    saveStorage(GALLERY_KEY, updated)
  },

  addGalleryCategory: (category) => {
    const trimmed = category.trim()
    if (!trimmed || get().galleryCategories.includes(trimmed)) return
    const updated = [...get().galleryCategories, trimmed]
    set({ galleryCategories: updated })
    saveStorage(GALLERY_CATEGORIES_KEY, updated)
  },

  updateGalleryCategory: (oldCategory, newCategory) => {
    const trimmedNew = newCategory.trim()
    if (!trimmedNew || oldCategory === trimmedNew) return
    const updatedCats = get().galleryCategories.map((c) => (c === oldCategory ? trimmedNew : c))
    // Also update any gallery photos that used oldCategory
    const updatedGallery = get().gallery.map((item) =>
      item.event === oldCategory ? { ...item, event: trimmedNew } : item
    )
    set({ galleryCategories: updatedCats, gallery: updatedGallery })
    saveStorage(GALLERY_CATEGORIES_KEY, updatedCats)
    saveStorage(GALLERY_KEY, updatedGallery)
  },

  deleteGalleryCategory: (category) => {
    const updatedCats = get().galleryCategories.filter((c) => c !== category)
    const fallbackCategory = updatedCats[0] || 'Lab Activities'
    const updatedGallery = get().gallery.map((item) =>
      item.event === category ? { ...item, event: fallbackCategory } : item
    )
    set({ galleryCategories: updatedCats, gallery: updatedGallery })
    saveStorage(GALLERY_CATEGORIES_KEY, updatedCats)
    saveStorage(GALLERY_KEY, updatedGallery)
  },

  addNews: (newsData) => {
    const newItem: NewsItem = {
      ...newsData,
      id: `news-${Date.now()}`
    }
    const updated = [newItem, ...get().news]
    set({ news: updated })
    saveStorage(NEWS_KEY, updated)
    return newItem
  },

  updateNews: (id, newsData) => {
    const updated = get().news.map((n) => (n.id === id ? { ...n, ...newsData } : n))
    set({ news: updated })
    saveStorage(NEWS_KEY, updated)
  },

  deleteNews: (id) => {
    const updated = get().news.filter((n) => n.id !== id)
    set({ news: updated })
    saveStorage(NEWS_KEY, updated)
  },

  addTutorial: (tutData) => {
    const newTut: Tutorial = {
      ...tutData,
      id: `tut-${Date.now()}`
    }
    const updated = [newTut, ...get().tutorials]
    set({ tutorials: updated })
    saveStorage(TUTORIALS_KEY, updated)
    return newTut
  },

  updateTutorial: (id, tutData) => {
    const updated = get().tutorials.map((t) => (t.id === id ? { ...t, ...tutData } : t))
    set({ tutorials: updated })
    saveStorage(TUTORIALS_KEY, updated)
  },

  deleteTutorial: (id) => {
    const updated = get().tutorials.filter((t) => t.id !== id)
    set({ tutorials: updated })
    saveStorage(TUTORIALS_KEY, updated)
  },

  addDataset: (datasetData) => {
    const newDataset: Dataset = {
      ...datasetData,
      id: `dataset-${Date.now()}`
    }
    const updated = [newDataset, ...get().datasets]
    set({ datasets: updated })
    saveStorage(DATASETS_KEY, updated)
    return newDataset
  },

  updateDataset: (id, datasetData) => {
    const updated = get().datasets.map((d) => (d.id === id ? { ...d, ...datasetData } : d))
    set({ datasets: updated })
    saveStorage(DATASETS_KEY, updated)
  },

  deleteDataset: (id) => {
    const updated = get().datasets.filter((d) => d.id !== id)
    set({ datasets: updated })
    saveStorage(DATASETS_KEY, updated)
  },

  addProject: (projectData) => {
    const newProj: ResearchProject = {
      ...projectData,
      id: `project-${Date.now()}`
    }
    const updated = [newProj, ...get().projects]
    set({ projects: updated })
    saveStorage(PROJECTS_KEY, updated)
    return newProj
  },

  updateProject: (id, projectData) => {
    const updated = get().projects.map((p) => (p.id === id ? { ...p, ...projectData } : p))
    set({ projects: updated })
    saveStorage(PROJECTS_KEY, updated)
  },

  deleteProject: (id) => {
    const updated = get().projects.filter((p) => p.id !== id)
    set({ projects: updated })
    saveStorage(PROJECTS_KEY, updated)
  },

  addConference: (confData) => {
    const newConf: Conference = {
      ...confData,
      id: confData.acronym ? confData.acronym.toLowerCase().replace(/[^a-z0-9]/g, '-') : `conf-${Date.now()}`
    }
    const updated = [newConf, ...get().conferences]
    set({ conferences: updated })
    saveStorage(CONFERENCES_KEY, updated)
    return newConf
  },

  updateConference: (id, confData) => {
    const updated = get().conferences.map((c) => (c.id === id ? { ...c, ...confData } : c))
    set({ conferences: updated })
    saveStorage(CONFERENCES_KEY, updated)
  },

  deleteConference: (id) => {
    const updated = get().conferences.filter((c) => c.id !== id)
    set({ conferences: updated })
    saveStorage(CONFERENCES_KEY, updated)
  },

  exportConferencesJson: () => {
    const output = {
      updated_at: new Date().toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
      live_url: 'https://raw.githubusercontent.com/leducthanh041/UIT-Together/refs/heads/main/src/data/conferences.json',
      conferences: get().conferences
    }
    return JSON.stringify(output, null, 2)
  },

  syncConferencesFromLive: async () => {
    const liveUrl = 'https://raw.githubusercontent.com/leducthanh041/UIT-Together/refs/heads/main/src/data/conferences.json'
    try {
      const res = await fetch(liveUrl, { cache: 'no-store' })
      if (!res.ok) return false
      const data = await res.json()
      if (data && Array.isArray(data.conferences) && data.conferences.length > 0) {
        set({ conferences: data.conferences, conferencesUpdatedAt: data.updated_at || new Date().toISOString() })
        saveStorage(CONFERENCES_KEY, data.conferences)
        return true
      }
      return false
    } catch (e) {
      console.warn('Failed to fetch live conferences from GitHub raw endpoint', e)
      return false
    }
  },

  updateSiteConfig: (partialConfig) => {
    const updated: SiteConfig = {
      home: { ...get().siteConfig.home, ...(partialConfig.home || {}) },
      about: { ...get().siteConfig.about, ...(partialConfig.about || {}) },
      footer: { ...get().siteConfig.footer, ...(partialConfig.footer || {}) }
    }
    set({ siteConfig: updated })
    saveStorage(SITE_CONFIG_KEY, updated)
  },

  resetToDefaults: () => {
    localStorage.removeItem(PAPERS_KEY)
    localStorage.removeItem(MEMBERS_KEY)
    localStorage.removeItem(NEWS_KEY)
    localStorage.removeItem(TUTORIALS_KEY)
    localStorage.removeItem(GALLERY_KEY)
    localStorage.removeItem(DATASETS_KEY)
    localStorage.removeItem(PROJECTS_KEY)
    localStorage.removeItem(SITE_CONFIG_KEY)
    localStorage.removeItem(CONFERENCES_KEY)
    localStorage.removeItem(GALLERY_CATEGORIES_KEY)
    set({
      papers: initialPapers as Paper[],
      members: initialMembers as Member[],
      news: initialNews as NewsItem[],
      datasets: initialDatasets as Dataset[],
      tutorials: initialTutorials as Tutorial[],
      projects: initialProjects as ResearchProject[],
      gallery: initialGallery as GalleryItem[],
      galleryCategories: DEFAULT_GALLERY_CATEGORIES,
      siteConfig: initialSiteConfig as SiteConfig,
      conferences: ((initialConferences as unknown as { conferences: Conference[] }).conferences || []),
      conferencesUpdatedAt: (initialConferences as unknown as { updated_at?: string }).updated_at || new Date().toISOString()
    })
  },

  exportPapersJson: () => JSON.stringify(get().papers, null, 2),
  exportMembersJson: () => JSON.stringify(get().members, null, 2),
  exportGalleryJson: () => JSON.stringify(get().gallery, null, 2),
  exportDatasetsJson: () => JSON.stringify(get().datasets, null, 2),
  exportProjectsJson: () => JSON.stringify(get().projects, null, 2),
  exportNewsJson: () => JSON.stringify(get().news, null, 2),
  exportTutorialsJson: () => JSON.stringify(get().tutorials, null, 2),
  exportSiteConfigJson: () => JSON.stringify(get().siteConfig, null, 2)
}))
