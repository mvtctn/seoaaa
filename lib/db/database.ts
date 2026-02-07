import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'db.json')

// Interfaces for our JSON DB structure
interface DBStructure {
  brands: any[]
  keywords: any[]
  research: any[]
  articles: any[]
  batch_jobs: any[]
}

// Ensure data directory exists and init DB
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(DB_PATH)) {
  const initialData: DBStructure = {
    brands: [],
    keywords: [],
    research: [],
    articles: [],
    batch_jobs: []
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2))
}

// Helper to read DB
const readDB = (): DBStructure => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { brands: [], keywords: [], research: [], articles: [], batch_jobs: [] }
  }
}

// Helper to write DB
const writeDB = (data: DBStructure) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// Mock better-sqlite3 RunResult
interface RunResult {
  lastInsertRowid: number | bigint
  changes: number
}

// --- Brands ---

export const getBrandById = (id: number) => {
  const db = readDB()
  return db.brands.find(b => b.id === Number(id))
}

export const getAllBrands = () => {
  const db = readDB()
  // Sort by created_at desc
  return [...db.brands].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const createBrand = (data: {
  name: string
  core_values?: string
  tone_of_voice?: string
  article_template?: string
  internal_links?: string
}): RunResult => {
  const db = readDB()
  const id = db.brands.length > 0 ? Math.max(...db.brands.map(b => b.id)) + 1 : 1
  const newBrand = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.brands.push(newBrand)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const updateBrand = (id: number, data: Partial<{
  name: string
  core_values: string
  tone_of_voice: string
  article_template: string
  internal_links: string
}>): RunResult => {
  const db = readDB()
  const index = db.brands.findIndex(b => b.id === Number(id))
  if (index !== -1) {
    db.brands[index] = {
      ...db.brands[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    writeDB(db)
    return { lastInsertRowid: id, changes: 1 }
  }
  return { lastInsertRowid: 0, changes: 0 }
}

// --- Keywords ---

export const createKeyword = (data: {
  keyword: string
  brand_id?: number
  status?: string
}): RunResult => {
  const db = readDB()
  const id = db.keywords.length > 0 ? Math.max(...db.keywords.map(k => k.id)) + 1 : 1
  const newKeyword = {
    id,
    keyword: data.keyword,
    brand_id: data.brand_id || null,
    status: data.status || 'pending',
    created_at: new Date().toISOString()
  }
  db.keywords.push(newKeyword)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getKeywordById = (id: number) => {
  const db = readDB()
  return db.keywords.find(k => k.id === Number(id))
}

export const updateKeywordStatus = (id: number, status: string): RunResult => {
  const db = readDB()
  const index = db.keywords.findIndex(k => k.id === Number(id))
  if (index !== -1) {
    db.keywords[index].status = status
    writeDB(db)
    return { lastInsertRowid: id, changes: 1 }
  }
  return { lastInsertRowid: 0, changes: 0 }
}

export const getAllKeywords = () => {
  const db = readDB()
  return [...db.keywords].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// --- Research ---

export const createResearch = (data: {
  keyword_id: number
  serp_data?: string
  competitor_analysis?: string
  content_gaps?: string
  strategic_positioning?: string
  gemini_brief?: string
}): RunResult => {
  const db = readDB()
  const id = db.research.length > 0 ? Math.max(...db.research.map(r => r.id)) + 1 : 1
  const newResearch = {
    id,
    keyword_id: data.keyword_id,
    serp_data: data.serp_data || null,
    competitor_analysis: data.competitor_analysis || null,
    content_gaps: data.content_gaps || null,
    strategic_positioning: data.strategic_positioning || null,
    gemini_brief: data.gemini_brief || null,
    created_at: new Date().toISOString()
  }
  db.research.push(newResearch)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getResearchByKeywordId = (keywordId: number) => {
  const db = readDB()
  return db.research.find(r => r.keyword_id === Number(keywordId))
}

export const getResearchById = (id: number) => {
  const db = readDB()
  return db.research.find(r => r.id === Number(id))
}

// --- Articles ---

export const createArticle = (data: {
  keyword_id: number
  research_id?: number
  title: string
  slug: string
  meta_title?: string
  meta_description?: string
  content: string
  thumbnail_url?: string
  images?: string
  status?: string
}): RunResult => {
  const db = readDB()
  const id = db.articles.length > 0 ? Math.max(...db.articles.map(a => a.id)) + 1 : 1
  const newArticle = {
    id,
    keyword_id: data.keyword_id,
    research_id: data.research_id || null,
    title: data.title,
    slug: data.slug,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    content: data.content,
    thumbnail_url: data.thumbnail_url || null,
    images: data.images || null,
    status: data.status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.articles.push(newArticle)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getArticleById = (id: number) => {
  const db = readDB()
  return db.articles.find(a => a.id === Number(id))
}

export const getArticleBySlug = (slug: string) => {
  const db = readDB()
  return db.articles.find(a => a.slug === slug)
}

export const getAllArticles = () => {
  const db = readDB()
  return [...db.articles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export const updateArticle = (id: number, data: Partial<{
  title: string
  slug: string
  meta_title: string
  meta_description: string
  content: string
  thumbnail_url: string
  images: string
  status: string
}>): RunResult => {
  const db = readDB()
  const index = db.articles.findIndex(a => a.id === Number(id))
  if (index !== -1) {
    db.articles[index] = {
      ...db.articles[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    writeDB(db)
    return { lastInsertRowid: id, changes: 1 }
  }
  return { lastInsertRowid: 0, changes: 0 }
}

export const updateArticleImage = (id: number, imageUrl: string): RunResult => {
  return updateArticle(id, { thumbnail_url: imageUrl })
}

export const deleteArticle = (id: number): RunResult => {
  const db = readDB()
  const index = db.articles.findIndex((a: any) => a.id === Number(id))
  if (index !== -1) {
    db.articles.splice(index, 1)
    writeDB(db)
    return { lastInsertRowid: 0, changes: 1 }
  }
  return { lastInsertRowid: 0, changes: 0 }
}

// --- Batch Jobs ---

export const createBatchJob = (data: {
  brand_id: number
  keywords: string // JSON
  status?: string
  progress?: string
}): RunResult => {
  const db = readDB()
  const id = db.batch_jobs.length > 0 ? Math.max(...db.batch_jobs.map(j => j.id)) + 1 : 1
  const newJob = {
    id,
    brand_id: data.brand_id,
    keywords: data.keywords,
    status: data.status || 'pending',
    progress: data.progress || null,
    created_at: new Date().toISOString()
  }
  db.batch_jobs.push(newJob)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getBatchJobById = (id: number) => {
  const db = readDB()
  return db.batch_jobs.find(j => j.id === Number(id))
}

export const updateBatchJob = (id: number, data: Partial<{
  status: string
  progress: string
  completed_at: string
}>): RunResult => {
  const db = readDB()
  const index = db.batch_jobs.findIndex(j => j.id === Number(id))
  if (index !== -1) {
    db.batch_jobs[index] = {
      ...db.batch_jobs[index],
      ...data
    }
    writeDB(db)
    return { lastInsertRowid: id, changes: 1 }
  }
  return { lastInsertRowid: 0, changes: 0 }
}

// Helper function for creating articles from rewrite (no keyword_id needed)
export const createArticleFromRewrite = (data: {
  title: string
  content: string
  status?: string
  source_url?: string | null
  meta_title?: string
  meta_description?: string
  thumbnail_url?: string
}) => {
  const db = readDB()
  const id = db.articles.length > 0 ? Math.max(...db.articles.map(a => a.id)) + 1 : 1

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const newArticle = {
    id,
    keyword_id: null, // No keyword association for rewrite
    research_id: null,
    title: data.title,
    slug,
    meta_title: data.meta_title || data.title,
    meta_description: data.meta_description || null,
    content: data.content,
    thumbnail_url: data.thumbnail_url || null,
    images: null,
    status: data.status || 'draft',
    source_url: data.source_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  db.articles.push(newArticle)
  writeDB(db)

  // Return the created article object
  return newArticle
}

// --- Articles Helpers ---

// Export a default object checking existence mostly for backward compat if any code imported default
const db = {
  prepare: () => ({ get: () => { }, run: () => { }, all: () => { } })
}
export default db
