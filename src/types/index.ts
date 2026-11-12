export interface Paper {
  id: string
  title: string
  authors: string
  venue: string
  year: number
  month?: string
  type: 'journal' | 'conference'
  quartile?: string
  url?: string
  doi?: string
  pdfUrl?: string
  codeUrl?: string
  abstract?: string
  tags?: string[]
  bibtex?: string
  thumbnail?: string
}

export interface Member {
  id: string
  name: string
  role: string
  position: string
  cohort?: string
  email?: string
  image?: string
  bio?: string
  scholar?: string
  github?: string
  orcid?: string
  alum: boolean
}

export interface NewsItem {
  id: string
  title: string
  date: string
  summary: string
  category: 'Publication' | 'Dataset' | 'Award' | 'Defense' | 'General'
  url?: string
}

export interface Dataset {
  id: string
  title: string
  year: number
  description: string
  paper?: string
  paperUrl?: string
  githubUrl?: string
  image?: string
  highlights?: string[]
  tags: string[]
}

export interface Tutorial {
  id: string
  title: string
  description: string
  url: string
  isExternal: boolean
  category: string
  tags: string[]
}

export interface ResearchProject {
  id: string
  title: string
  description: string
  icon?: string
  tags: string[]
  mediaType?: 'image' | 'video'
  mediaUrl?: string
  caption?: string
}

export interface GalleryItem {
  id: string
  title: string
  event: string
  year: number
  image: string
  caption: string
}

export interface SiteConfig {
  home: {
    heroBadge: string
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    heroImageCaption?: string
    statsPublications: string
    statsJournals: string
    statsDatasets: string
    statsLabLocation: string
  }
  about: {
    facilityTitle: string
    facilityRoom: string
    facilityBuilding: string
    facilityAddress: string
    facilityDescription: string
    leadershipTitle: string
    leadershipDescription: string
  }
  footer: {
    brandName: string
    tagline: string
    address: string
    email: string
    phone: string
    copyright: string
  }
}

export interface ConferenceDeadline {
  label: string
  date: string
  zone?: string | null
  at?: string | null
  status?: 'confirmed' | 'tentative' | 'unannounced'
  source?: string
}

export interface Conference {
  id: string
  acronym: string
  year: number
  name: string
  topics: string[]
  website: string
  source_urls?: string[]
  location: string
  starts_on: string | null
  ends_on: string | null
  date_status?: 'confirmed' | 'tentative' | 'unannounced' | 'conflicting'
  deadlines: ConferenceDeadline[]
  checked_at?: string
  last_success_at?: string
  sync_status?: string
  notes_en?: string
  notes_vi?: string
  series_url?: string
  source_template?: string
  rolled_over?: boolean
}

export interface ConferenceSchedule {
  updated_at: string
  timezone: string
  live_url?: string
  conferences: Conference[]
}
