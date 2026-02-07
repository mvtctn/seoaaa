import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize database
const db = new Database(DB_PATH)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
const initializeDatabase = () => {
    // Brands table
    db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      core_values TEXT, -- JSON
      tone_of_voice TEXT, -- JSON
      article_template TEXT,
      internal_links TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

    // Keywords table
    db.exec(`
    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      brand_id INTEGER,
      status TEXT DEFAULT 'pending', -- pending, researching, writing, completed, failed
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    )
  `)

    // Research table
    db.exec(`
    CREATE TABLE IF NOT EXISTS research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_id INTEGER NOT NULL,
      serp_data TEXT, -- JSON
      competitor_analysis TEXT, -- JSON
      content_gaps TEXT, -- JSON
      strategic_positioning TEXT,
      gemini_brief TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE
    )
  `)

    // Articles table
    db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword_id INTEGER NOT NULL,
      research_id INTEGER,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      meta_title TEXT,
      meta_description TEXT,
      content TEXT, -- Markdown
      thumbnail_url TEXT,
      images TEXT, -- JSON
      status TEXT DEFAULT 'draft', -- draft, published
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
      FOREIGN KEY (research_id) REFERENCES research(id) ON DELETE SET NULL
    )
  `)

    // Batch jobs table
    db.exec(`
    CREATE TABLE IF NOT EXISTS batch_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_id INTEGER NOT NULL,
      keywords TEXT NOT NULL, -- JSON array
      status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
      progress TEXT, -- JSON
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
    )
  `)

    console.log('✅ Database initialized successfully')
}

// Initialize on import
initializeDatabase()

export default db

// Helper functions
export const getBrandById = (id: number) => {
    return db.prepare('SELECT * FROM brands WHERE id = ?').get(id)
}

export const getAllBrands = () => {
    return db.prepare('SELECT * FROM brands ORDER BY created_at DESC').all()
}

export const createBrand = (data: {
    name: string
    core_values?: string
    tone_of_voice?: string
    article_template?: string
    internal_links?: string
}) => {
    const stmt = db.prepare(`
    INSERT INTO brands (name, core_values, tone_of_voice, article_template, internal_links)
    VALUES (?, ?, ?, ?, ?)
  `)
    return stmt.run(
        data.name,
        data.core_values,
        data.tone_of_voice,
        data.article_template,
        data.internal_links
    )
}

export const updateBrand = (id: number, data: Partial<{
    name: string
    core_values: string
    tone_of_voice: string
    article_template: string
    internal_links: string
}>) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(data), id]

    const stmt = db.prepare(`
    UPDATE brands 
    SET ${fields}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    return stmt.run(...values)
}

export const createKeyword = (data: {
    keyword: string
    brand_id?: number
    status?: string
}) => {
    const stmt = db.prepare(`
    INSERT INTO keywords (keyword, brand_id, status)
    VALUES (?, ?, ?)
  `)
    return stmt.run(data.keyword, data.brand_id || null, data.status || 'pending')
}

export const getKeywordById = (id: number) => {
    return db.prepare('SELECT * FROM keywords WHERE id = ?').get(id)
}

export const updateKeywordStatus = (id: number, status: string) => {
    const stmt = db.prepare('UPDATE keywords SET status = ? WHERE id = ?')
    return stmt.run(status, id)
}

export const createResearch = (data: {
    keyword_id: number
    serp_data?: string
    competitor_analysis?: string
    content_gaps?: string
    strategic_positioning?: string
    gemini_brief?: string
}) => {
    const stmt = db.prepare(`
    INSERT INTO research 
    (keyword_id, serp_data, competitor_analysis, content_gaps, strategic_positioning, gemini_brief)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
    return stmt.run(
        data.keyword_id,
        data.serp_data || null,
        data.competitor_analysis || null,
        data.content_gaps || null,
        data.strategic_positioning || null,
        data.gemini_brief || null
    )
}

export const getResearchByKeywordId = (keywordId: number) => {
    return db.prepare('SELECT * FROM research WHERE keyword_id = ?').get(keywordId)
}

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
}) => {
    const stmt = db.prepare(`
    INSERT INTO articles 
    (keyword_id, research_id, title, slug, meta_title, meta_description, content, thumbnail_url, images, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    return stmt.run(
        data.keyword_id,
        data.research_id || null,
        data.title,
        data.slug,
        data.meta_title || null,
        data.meta_description || null,
        data.content,
        data.thumbnail_url || null,
        data.images || null,
        data.status || 'draft'
    )
}

export const getArticleById = (id: number) => {
    return db.prepare('SELECT * FROM articles WHERE id = ?').get(id)
}

export const getArticleBySlug = (slug: string) => {
    return db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug)
}

export const getAllArticles = () => {
    return db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all()
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
}>) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(data), id]

    const stmt = db.prepare(`
    UPDATE articles 
    SET ${fields}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    return stmt.run(...values)
}

export const createBatchJob = (data: {
    brand_id: number
    keywords: string // JSON
    status?: string
    progress?: string
}) => {
    const stmt = db.prepare(`
    INSERT INTO batch_jobs (brand_id, keywords, status, progress)
    VALUES (?, ?, ?, ?)
  `)
    return stmt.run(
        data.brand_id,
        data.keywords,
        data.status || 'pending',
        data.progress || null
    )
}

export const getBatchJobById = (id: number) => {
    return db.prepare('SELECT * FROM batch_jobs WHERE id = ?').get(id)
}

export const updateBatchJob = (id: number, data: Partial<{
    status: string
    progress: string
    completed_at: string
}>) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ')
    const values = [...Object.values(data), id]

    const stmt = db.prepare(`
    UPDATE batch_jobs 
    SET ${fields}
    WHERE id = ?
  `)
    return stmt.run(...values)
}
