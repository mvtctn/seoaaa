import { supabase } from './supabase-client'

export interface RunResult {
    lastInsertRowid: number | bigint
    changes: number
}

// --- Brands ---

export const getBrandById = async (id: number) => {
    const { data } = await supabase.from('brands').select('*').eq('id', id).maybeSingle()
    return data
}

export const getAllBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('created_at', { ascending: false })
    return data || []
}

export const createBrand = async (data: {
    name: string
    core_values?: string
    tone_of_voice?: string
    article_template?: string
    internal_links?: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('brands').insert([{
        name: data.name,
        core_values: data.core_values ? JSON.parse(data.core_values) : [],
        tone_of_voice: data.tone_of_voice ? JSON.parse(data.tone_of_voice) : {},
        article_template: data.article_template,
        internal_links: data.internal_links ? JSON.parse(data.internal_links) : []
    }]).select().single()

    if (error) throw error
    return { lastInsertRowid: record.id, changes: 1 }
}

export const updateBrand = async (id: number, data: Partial<{
    name: string
    core_values: string
    tone_of_voice: string
    article_template: string
    internal_links: string
}>): Promise<RunResult> => {
    const updateData: any = { ...data }
    if (data.core_values) updateData.core_values = JSON.parse(data.core_values)
    if (data.tone_of_voice) updateData.tone_of_voice = JSON.parse(data.tone_of_voice)
    if (data.internal_links) updateData.internal_links = JSON.parse(data.internal_links)
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from('brands').update(updateData).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

// --- Keywords ---

export const createKeyword = async (data: {
    keyword: string
    brand_id?: number
    status?: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('keywords').insert([{
        keyword: data.keyword,
        brand_id: data.brand_id || null,
        status: data.status || 'pending'
    }]).select().single()

    if (error) {
        console.error('Supabase Error (createKeyword):', error)
        throw error
    }
    return { lastInsertRowid: record.id, changes: 1 }
}

export const getKeywordById = async (id: number) => {
    const { data } = await supabase.from('keywords').select('*').eq('id', id).maybeSingle()
    return data
}

export const updateKeywordStatus = async (id: number, status: string): Promise<RunResult> => {
    const { error } = await supabase.from('keywords').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const getAllKeywords = async () => {
    const { data } = await supabase.from('keywords').select('*').order('created_at', { ascending: false })
    return data || []
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
    const { data: record, error } = await supabase.from('research').insert([{
        keyword_id: data.keyword_id,
        serp_data: data.serp_data ? JSON.parse(data.serp_data) : null,
        competitor_analysis: data.competitor_analysis,
        content_gaps: data.content_gaps,
        strategic_positioning: data.strategic_positioning,
        gemini_brief: data.gemini_brief ? JSON.parse(data.gemini_brief) : null
    }]).select().single()

    if (error) {
        console.error('Supabase Error (createResearch):', error)
        throw error
    }
    return { lastInsertRowid: record.id, changes: 1 }
}

export const getResearchByKeywordId = async (keywordId: number) => {
    const { data } = await supabase.from('research').select('*').eq('keyword_id', keywordId).maybeSingle()
    return data
}

export const getResearchById = async (id: number) => {
    const { data } = await supabase.from('research').select('*').eq('id', id).maybeSingle()
    return data
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
    const { data: record, error } = await supabase.from('articles').insert([{
        keyword_id: data.keyword_id || null,
        research_id: data.research_id || null,
        title: data.title,
        slug: data.slug,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        content: data.content,
        thumbnail_url: data.thumbnail_url,
        images: data.images ? JSON.parse(data.images) : null,
        status: data.status || 'draft'
    }]).select().single()

    if (error) {
        console.error('Supabase Error (createArticle):', error)
        throw error
    }
    return { lastInsertRowid: record.id, changes: 1 }
}

export const getArticleById = async (id: number) => {
    const { data } = await supabase.from('articles').select('*').eq('id', id).maybeSingle()
    return data
}

export const getArticleBySlug = async (slug: string) => {
    const { data } = await supabase.from('articles').select('*').eq('slug', slug).maybeSingle()
    return data
}

export const getAllArticles = async () => {
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
    return data || []
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
    const updateData: any = { ...data }
    if (data.images) updateData.images = JSON.parse(data.images)
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from('articles').update(updateData).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const updateArticleImage = async (id: number, imageUrl: string): Promise<RunResult> => {
    const { error } = await supabase.from('articles').update({ thumbnail_url: imageUrl, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const deleteArticle = async (id: number): Promise<RunResult> => {
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

// --- Batch Jobs ---

export const createBatchJob = async (data: {
    brand_id: number
    keywords: string
    status?: string
    progress?: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('batch_jobs').insert([{
        brand_id: data.brand_id,
        keywords: JSON.parse(data.keywords),
        status: data.status || 'pending',
        progress: data.progress ? JSON.parse(data.progress) : { total: 0, completed: 0, current: '' }
    }]).select().single()

    if (error) throw error
    return { lastInsertRowid: record.id, changes: 1 }
}

export const getBatchJobById = async (id: number) => {
    const { data } = await supabase.from('batch_jobs').select('*').eq('id', id).maybeSingle()
    return data
}

export const updateBatchJob = async (id: number, data: Partial<{
    status: string
    progress: string
    completed_at: string
}>): Promise<RunResult> => {
    const updateData: any = { ...data }
    if (data.progress) updateData.progress = JSON.parse(data.progress)
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from('batch_jobs').update(updateData).eq('id', id)
    if (error) throw error
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
    const { data: record, error } = await supabase.from('articles').insert([{
        title: data.title,
        content: data.content,
        status: data.status || 'draft',
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        thumbnail_url: data.thumbnail_url,
        slug: data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
    }]).select().single()

    if (error) throw error
    return { lastInsertRowid: record.id, changes: 1 }
}
