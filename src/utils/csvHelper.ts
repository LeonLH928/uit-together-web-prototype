import type { Paper, Member } from '../types'

/**
 * Robust RFC 4180-compliant quote-aware CSV parser
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []

  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  }

  const rawHeaders = parseLine(lines[0])
  const headers = rawHeaders.map((h) =>
    h
      .toLowerCase()
      .trim()
      .replace(/^"|"$/g, '')
      .replace(/[^a-z0-9]/g, '')
  )

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    // skip empty row
    if (values.every((v) => !v.trim())) continue

    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      let val = values[idx] || ''
      // strip enclosing quotes if present
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"')
      }
      row[header] = val.trim()
    })
    rows.push(row)
  }

  return rows
}

/**
 * Clean a DOI string by removing prefixes like "https://doi.org/", "doi:", etc.
 */
export function cleanDoiString(doi: string): string {
  let cleaned = doi.trim()
  cleaned = cleaned.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
  cleaned = cleaned.replace(/^doi:\s*/i, '')
  return cleaned.trim()
}

/**
 * Query Crossref REST API for a single DOI and convert to Paper metadata
 */
export async function fetchCrossrefMetadata(rawDoi: string): Promise<Omit<Paper, 'id'>> {
  const doi = cleanDoiString(rawDoi)
  if (!doi) {
    throw new Error('Empty DOI provided')
  }

  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: {
      Accept: 'application/json'
    }
  })

  if (!res.ok) {
    throw new Error(`Crossref lookup failed for DOI ${doi} (Status: ${res.status})`)
  }

  const data = await res.json()
  const msg = data.message || {}

  const title = Array.isArray(msg.title) && msg.title.length > 0 ? msg.title[0] : 'Untitled Publication'

  // Authors
  let authors = 'UIT-Together Research Group'
  if (Array.isArray(msg.author) && msg.author.length > 0) {
    authors = msg.author
      .map((a: { given?: string; family?: string; name?: string }) => {
        if (a.given && a.family) return `${a.given} ${a.family}`
        if (a.family) return a.family
        if (a.name) return a.name
        return ''
      })
      .filter(Boolean)
      .join(', ')
  }

  // Venue
  const venue =
    Array.isArray(msg['container-title']) && msg['container-title'].length > 0
      ? msg['container-title'][0]
      : msg.publisher || 'Scientific Publication'

  // Year
  let year = new Date().getFullYear()
  const dateParts = msg.published?.['date-parts'] || msg['issued']?.['date-parts']
  if (Array.isArray(dateParts) && dateParts[0] && dateParts[0][0]) {
    year = Number(dateParts[0][0])
  }

  // Type
  const crossrefType = String(msg.type || '').toLowerCase()
  const isConf = crossrefType.includes('proceeding') || crossrefType.includes('conference')
  const type: 'journal' | 'conference' = isConf ? 'conference' : 'journal'

  const url = msg.URL || `https://doi.org/${doi}`

  return {
    title,
    authors,
    venue,
    year,
    type,
    quartile: 'SCIE',
    url,
    doi,
    tags: ['Computer Vision', 'Deep Learning']
  }
}

/**
 * Batch resolve a list of DOIs with progress callback
 */
export async function batchResolveDOIs(
  rawDoiList: string[],
  onProgress?: (done: number, total: number) => void
): Promise<{ successful: Omit<Paper, 'id'>[]; failed: { doi: string; reason: string }[] }> {
  const cleanList = rawDoiList
    .map(cleanDoiString)
    .filter((d) => d.length > 0 && d.includes('/'))

  const successful: Omit<Paper, 'id'>[] = []
  const failed: { doi: string; reason: string }[] = []

  for (let i = 0; i < cleanList.length; i++) {
    const doi = cleanList[i]
    try {
      const paper = await fetchCrossrefMetadata(doi)
      successful.push(paper)
    } catch (err: unknown) {
      failed.push({
        doi,
        reason: err instanceof Error ? err.message : 'Unknown network error'
      })
      // Fallback stub row so the user doesn't lose the paper entry
      successful.push({
        title: `Publication (DOI: ${doi})`,
        authors: 'UIT-Together Researcher',
        venue: 'Pending Indexing',
        year: new Date().getFullYear(),
        type: 'journal',
        quartile: 'SCIE',
        url: `https://doi.org/${doi}`,
        doi,
        tags: ['Computer Vision']
      })
    }

    if (onProgress) {
      onProgress(i + 1, cleanList.length)
    }
  }

  return { successful, failed }
}

/**
 * Parse Format 2 CSV: Full fields for accepted papers published publicly
 */
export function parseFullFieldsCSV(csvContent: string): Omit<Paper, 'id'>[] {
  const rows = parseCSV(csvContent)
  const results: Omit<Paper, 'id'>[] = []

  for (const row of rows) {
    const title = row['title'] || row['papertitle'] || ''
    const authors = row['authors'] || row['author'] || ''

    if (!title && !authors) continue

    const venue = row['venue'] || row['journal'] || row['booktitle'] || 'Scientific Publication'
    const rawYear = Number(row['year'])
    const year = !isNaN(rawYear) && rawYear > 1990 ? rawYear : new Date().getFullYear()

    const rawType = (row['type'] || '').toLowerCase()
    const type: 'journal' | 'conference' = rawType.includes('conf') ? 'conference' : 'journal'

    const quartile = row['quartile'] || row['indexing'] || 'SCIE, Q1'
    const url = row['url'] || row['doi'] || ''
    const pdfUrl = row['pdfurl'] || row['pdf'] || ''
    const codeUrl = row['codeurl'] || row['code'] || row['github'] || ''
    const thumbnail = row['thumbnail'] || row['image'] || ''

    const rawTags = row['tags'] || row['keywords'] || 'Computer Vision'
    const tags = rawTags
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean)

    results.push({
      title,
      authors: authors || 'UIT-Together Researcher',
      venue,
      year,
      type,
      quartile,
      url: url.startsWith('http') ? url : url ? `https://doi.org/${url}` : undefined,
      pdfUrl: pdfUrl || undefined,
      codeUrl: codeUrl || undefined,
      thumbnail: thumbnail || undefined,
      tags: tags.length > 0 ? tags : ['Computer Vision']
    })
  }

  return results
}

/**
 * Helper to download sample CSV template files
 */
export function downloadSampleCsv(format: 'doi' | 'full') {
  let content = ''
  let filename = ''

  if (format === 'doi') {
    filename = 'sample_publications_doi_list.csv'
    content = `doi
10.3390/jimaging8120323
10.1109/ACCESS.2023.3289000
https://doi.org/10.1016/j.patrec.2023.01.015
`
  } else {
    filename = 'sample_publications_full_fields.csv'
    content = `title,authors,venue,year,type,quartile,url,pdfUrl,codeUrl,tags,thumbnail
"A Robust Framework for Aerial Drone Surveillance","Nguyen D. Vo, Khang Nguyen, Toan Le","IEEE Access",2024,journal,"SCIE, Q1","https://doi.org/10.1109/...","https://arxiv.org/pdf/...","https://github.com/UIT-Together/...","Computer Vision, Aerial Imagery","/images/projects/uit-drone21.png"
"Adverse Weather Video Anomaly Detection","Le T. Nguyen, Dr. Khang Nguyen","Pattern Recognition Letters",2023,journal,"SCIE, Q2","https://doi.org/10.1016/...","","https://github.com/UIT-Together/...","Video Anomaly, Deep Learning",""
"Medical Radiography Synthesis via Multi-Doctor Consultation","Kim Anh Phung, Khang Nguyen","MICCAI Workshop",2022,conference,"CORE A","https://doi.org/10.3390/jimaging8120323","https://arxiv.org/...","","Medical Imaging, X-Ray",""
`
  }

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Parse Format 1: CSV for batch member import
 * Columns: name,role,position,cohort,email,bio,github,scholar,alum
 */
export function parseMembersCSV(csvContent: string): Omit<Member, 'id'>[] {
  const rows = parseCSV(csvContent)
  const results: Omit<Member, 'id'>[] = []

  for (const row of rows) {
    const name = row['name'] || row['fullname'] || row['membername'] || ''
    if (!name.trim()) continue

    const role = row['role'] || 'Undergraduate Student'
    const position = row['position'] || row['title'] || 'Research Assistant'
    const cohort = row['cohort'] || ''
    const email = row['email'] || ''
    const bio = row['bio'] || row['biography'] || row['description'] || ''
    const github = row['github'] || ''
    const scholar = row['scholar'] || row['googlescholar'] || ''
    const image = row['image'] || row['photo'] || row['avatar'] || ''
    const rawAlum = (row['alum'] || row['alumnus'] || '').toLowerCase()
    const alum = ['true', 'yes', '1', 'alum', 'alumni'].includes(rawAlum)

    results.push({
      name: name.trim(),
      role: role.trim(),
      position: position.trim(),
      cohort: cohort.trim() || undefined,
      email: email.trim() || undefined,
      bio: bio.trim() || undefined,
      github: github.trim() || undefined,
      scholar: scholar.trim() || undefined,
      image: image.trim() || undefined,
      alum
    })
  }

  return results
}

/**
 * Parse Format 2: Quick Cohort Roster Name Paste
 * Parses raw text lines of student names and assigns given cohort and defaults
 */
export function parseQuickRosterText(
  text: string,
  cohort: string,
  defaultRole = 'Undergraduate Student',
  defaultPosition = 'Research Assistant'
): Omit<Member, 'id'>[] {
  const lines = text.split(/\r?\n/)
  const results: Omit<Member, 'id'>[] = []

  for (const rawLine of lines) {
    let line = rawLine.trim()
    if (!line) continue

    // Strip common line prefixes like "1. ", "1/ ", "- ", "* ", "• "
    line = line.replace(/^(\d+[\.\/\)-]|\*|-|•)\s*/, '').trim()
    if (!line) continue

    results.push({
      name: line,
      role: defaultRole,
      position: defaultPosition,
      cohort: cohort.trim() || undefined,
      alum: false
    })
  }

  return results
}

/**
 * Helper to download sample CSV template for members
 */
export function downloadSampleMembersCsv() {
  const filename = 'sample_members_batch.csv'
  const content = `name,role,position,cohort,email,bio,github,scholar,alum
"Le Duc Thanh","Undergraduate Student","Research Assistant","Cohort K2023","thanhld@uit.edu.vn","Undergraduate researcher focusing on Deep Learning and Computer Vision","https://github.com/leducthanh041","",false
"Nguyen Ngoc Thanh Phuong","Undergraduate Student","Research Assistant","Cohort K2023","","Undergraduate researcher working on Video Anomaly Detection","","",false
"Tran Minh Vu","Undergraduate Student","Research Assistant","Cohort K2023","","Undergraduate researcher in Machine Learning & Medical Image Processing","","",false
"Dr. Nguyen Van A","Faculty / PI","Associate Professor","","vana@uit.edu.vn","Principal Investigator in Computer Vision & Multimedia Analysis","https://github.com/vana","https://scholar.google.com/...",false
`
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
