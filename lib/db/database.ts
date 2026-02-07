import path from 'path'
import fs from 'fs'

// Helper to keep the same return structure as better-sqlite3 for compatibility
export interface RunResult {
  lastInsertRowid: number | bigint
  changes: number
}

// Use environment variable to determine which database to use
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// JSON File Database Implementation
const DEFAULT_LOCAL_PATH = path.join(process.cwd(), 'data', 'database.json')
const DB_PATH = process.env.DATABASE_PATH || DEFAULT_LOCAL_PATH

interface DBStructure {
  brands: any[]
  keywords: any[]
  research: any[]
  articles: any[]
  batch_jobs: any[]
}

// Ensure data directory exists for JSON mode
if (!USE_SUPABASE) {
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
}

// Helper to read JSON DB
const readDB = (): DBStructure => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return { brands: [], keywords: [], research: [], articles: [], batch_jobs: [] }
  }
}

// Helper to write JSON DB
const writeDB = (data: DBStructure) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

// Import Supabase functions dynamically only if needed
let supabaseFunctions: any = null
if (USE_SUPABASE) {
  supabaseFunctions = require('./database-supabase')
}

// --- Brands ---

export const getBrandById = async (id: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getBrandById(id)
  const db = readDB()
  return db.brands.find(b => b.id === Number(id))
}

export const getAllBrands = async () => {
  if (USE_SUPABASE) return supabaseFunctions.getAllBrands()
  const db = readDB()
  return db.brands
}

export const createBrand = async (data: {
  name: string
  core_values?: string
  tone_of_voice?: string
  article_template?: string
  internal_links?: string
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createBrand(data)

  const db = readDB()
  const id = db.brands.length > 0 ? Math.max(...db.brands.map(b => b.id)) + 1 : 1
  const newBrand = {
    id,
    name: data.name,
    core_values: data.core_values || null,
    tone_of_voice: data.tone_of_voice || null,
    article_template: data.article_template || null,
    internal_links: data.internal_links || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.brands.push(newBrand)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const updateBrand = async (id: number, data: Partial<{
  name: string
  core_values: string
  tone_of_voice: string
  article_template: string
  internal_links: string
}>): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.updateBrand(id, data)

  const db = readDB()
  const index = db.brands.findIndex(b => b.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.brands[index] = { ...db.brands[index], ...data, updated_at: new Date().toISOString() }
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

// --- Keywords ---

export const createKeyword = async (data: {
  keyword: string
  brand_id?: number
  status?: string
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createKeyword(data)

  const db = readDB()
  const id = db.keywords.length > 0 ? Math.max(...db.keywords.map(k => k.id)) + 1 : 1
  const newKeyword = {
    id,
    keyword: data.keyword,
    brand_id: data.brand_id || null,
    status: data.status || 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.keywords.push(newKeyword)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getKeywordById = async (id: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getKeywordById(id)
  const db = readDB()
  return db.keywords.find(k => k.id === Number(id))
}

export const updateKeywordStatus = async (id: number, status: string): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.updateKeywordStatus(id, status)

  const db = readDB()
  const index = db.keywords.findIndex(k => k.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.keywords[index].status = status
  db.keywords[index].updated_at = new Date().toISOString()
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getAllKeywords = async () => {
  if (USE_SUPABASE) return supabaseFunctions.getAllKeywords()
  const db = readDB()
  return db.keywords
}

// --- Research ---

export const createResearch = async (data: {
  keyword_id: number
  serp_data?: string
  competitor_analysis?: string
  content_gaps?: string
  strategic_positioning?: string
  gemini_brief?: string
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createResearch(data)

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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.research.push(newResearch)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getResearchByKeywordId = async (keywordId: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getResearchByKeywordId(keywordId)
  const db = readDB()
  return db.research.find(r => r.keyword_id === Number(keywordId))
}

export const getResearchById = async (id: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getResearchById(id)
  const db = readDB()
  return db.research.find(r => r.id === Number(id))
}

// --- Articles ---

export const createArticle = async (data: {
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
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createArticle(data)

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

export const getArticleById = async (id: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getArticleById(id)
  const db = readDB()
  return db.articles.find(a => a.id === Number(id))
}

export const getArticleBySlug = async (slug: string) => {
  if (USE_SUPABASE) return supabaseFunctions.getArticleBySlug(slug)
  const db = readDB()
  return db.articles.find(a => a.slug === slug)
}

export const getAllArticles = async () => {
  if (USE_SUPABASE) return supabaseFunctions.getAllArticles()
  const db = readDB()
  return db.articles
}

export const updateArticle = async (id: number, data: Partial<{
  title: string
  slug: string
  meta_title: string
  meta_description: string
  content: string
  thumbnail_url: string
  images: string
  status: string
}>): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.updateArticle(id, data)

  const db = readDB()
  const index = db.articles.findIndex(a => a.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.articles[index] = { ...db.articles[index], ...data, updated_at: new Date().toISOString() }
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const updateArticleImage = async (id: number, imageUrl: string): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.updateArticleImage(id, imageUrl)

  const db = readDB()
  const index = db.articles.findIndex(a => a.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.articles[index].thumbnail_url = imageUrl
  db.articles[index].updated_at = new Date().toISOString()
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const deleteArticle = async (id: number): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.deleteArticle(id)

  const db = readDB()
  const index = db.articles.findIndex(a => a.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.articles.splice(index, 1)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

// --- Batch Jobs ---

export const createBatchJob = async (data: {
  brand_id: number
  keywords: string
  status?: string
  progress?: string
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createBatchJob(data)

  const db = readDB()
  const id = db.batch_jobs.length > 0 ? Math.max(...db.batch_jobs.map(j => j.id)) + 1 : 1
  const newJob = {
    id,
    brand_id: data.brand_id,
    keywords: data.keywords,
    status: data.status || 'pending',
    progress: data.progress || null,
    created_at: new Date().toISOString(),
    completed_at: null,
    updated_at: new Date().toISOString()
  }
  db.batch_jobs.push(newJob)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const getBatchJobById = async (id: number) => {
  if (USE_SUPABASE) return supabaseFunctions.getBatchJobById(id)
  const db = readDB()
  return db.batch_jobs.find(j => j.id === Number(id))
}

export const updateBatchJob = async (id: number, data: Partial<{
  status: string
  progress: string
  completed_at: string
}>): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.updateBatchJob(id, data)

  const db = readDB()
  const index = db.batch_jobs.findIndex(j => j.id === Number(id))
  if (index === -1) return { lastInsertRowid: id, changes: 0 }

  db.batch_jobs[index] = { ...db.batch_jobs[index], ...data, updated_at: new Date().toISOString() }
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}

export const createArticleFromRewrite = async (data: {
  title: string
  content: string
  status?: string
  source_url?: string | null
  meta_title?: string
  meta_description?: string
  thumbnail_url?: string
}): Promise<RunResult> => {
  if (USE_SUPABASE) return supabaseFunctions.createArticleFromRewrite(data)

  const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
  const db = readDB()
  const id = db.articles.length > 0 ? Math.max(...db.articles.map(a => a.id)) + 1 : 1
  const newArticle = {
    id,
    keyword_id: null,
    research_id: null,
    title: data.title,
    slug,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    content: data.content,
    thumbnail_url: data.thumbnail_url || null,
    images: null,
    status: data.status || 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  db.articles.push(newArticle)
  writeDB(db)
  return { lastInsertRowid: id, changes: 1 }
}
