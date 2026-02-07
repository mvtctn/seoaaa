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

export const getDefaultBrand = async () => {
    // Try to get the one marked as default
    const { data } = await supabase.from('brands').select('*').eq('is_default', true).maybeSingle()
    if (data) return data

    // Fallback: Get the most recent one if no default exists
    const { data: latestBrand } = await supabase.from('brands').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    return latestBrand || null
}

export const createBrand = async (data: {
    name: string
    core_values?: string
    tone_of_voice?: string
    article_template?: string
    internal_links?: string
    is_default?: boolean
    wp_url?: string
    wp_username?: string
    wp_password?: string
}): Promise<RunResult> => {
    if (data.is_default) {
        await supabase.from('brands').update({ is_default: false }).neq('id', 0)
    }

    const { data: record, error } = await supabase.from('brands').insert([{
        name: data.name,
        core_values: data.core_values ? JSON.parse(data.core_values) : [],
        tone_of_voice: data.tone_of_voice ? JSON.parse(data.tone_of_voice) : {},
        article_template: data.article_template,
        internal_links: data.internal_links ? JSON.parse(data.internal_links) : [],
        is_default: data.is_default || false,
        wp_url: data.wp_url,
        wp_username: data.wp_username,
        wp_password: data.wp_password
    }]).select().single()

    if (error) {
        console.error('[Supabase Brand] Create Error:', error)
        throw error
    }
    return { lastInsertRowid: record.id, changes: 1 }
}

export const updateBrand = async (id: number, data: Partial<{
    name: string
    core_values: string
    tone_of_voice: string
    article_template: string
    internal_links: string
    is_default: boolean
    wp_url: string
    wp_username: string
    wp_password: string
}>): Promise<RunResult> => {
    try {
        if (data.is_default) {
            await supabase.from('brands').update({ is_default: false }).neq('id', id)
        }

        const updateData: any = { ...data }
        if (data.core_values) updateData.core_values = JSON.parse(data.core_values)
        if (data.tone_of_voice) updateData.tone_of_voice = JSON.parse(data.tone_of_voice)
        if (data.internal_links) updateData.internal_links = JSON.parse(data.internal_links)
        updateData.updated_at = new Date().toISOString()

        const { error } = await supabase.from('brands').update(updateData).eq('id', id)
        if (error) {
            console.error('[Supabase Brand] Update Error:', error)
            throw error
        }
        return { lastInsertRowid: id, changes: 1 }
    } catch (err: any) {
        console.error('[Supabase Brand] Logic Error:', err)
        throw err
    }
}

export const setDefaultBrand = async (id: number): Promise<RunResult> => {
    // Unset all first
    await supabase.from('brands').update({ is_default: false }).neq('id', id)
    // Set current as default
    const { error } = await supabase.from('brands').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const deleteBrand = async (id: number): Promise<RunResult> => {
    const { error } = await supabase.from('brands').delete().eq('id', id)
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
        serp_data: typeof data.serp_data === 'string' ? JSON.parse(data.serp_data) : data.serp_data,
        competitor_analysis: typeof data.competitor_analysis === 'string' ? JSON.parse(data.competitor_analysis) : data.competitor_analysis,
        content_gaps: typeof data.content_gaps === 'string' ? JSON.parse(data.content_gaps) : data.content_gaps,
        strategic_positioning: data.strategic_positioning,
        gemini_brief: typeof data.gemini_brief === 'string' ? JSON.parse(data.gemini_brief) : data.gemini_brief
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
    brand_id?: number
    wp_post_url?: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('articles').insert([{
        keyword_id: data.keyword_id || null,
        research_id: data.research_id || null,
        brand_id: data.brand_id || null,
        title: data.title,
        slug: data.slug,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        content: data.content,
        thumbnail_url: data.thumbnail_url,
        images: data.images ? JSON.parse(data.images) : null,
        status: data.status || 'draft',
        wp_post_url: data.wp_post_url || null
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

// --- Settings ---

export const getSetting = async (key: string) => {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
    if (error) {
        console.warn(`[Supabase Settings] Could not fetch ${key}:`, error.message)
        return null
    }
    return data?.value || null
}

export const updateSetting = async (key: string, value: any) => {
    const { error } = await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) {
        if (error.code === 'PGRST204' || error.message?.includes('relation "app_settings" does not exist')) {
            throw new Error('Lỗi: Bảng "app_settings" chưa tồn tại trong Supabase. Vui lòng chạy lệnh SQL khởi tạo bảng trong SQL Editor.')
        }
        console.error(`[Supabase Settings] Error updating ${key}:`, error)
        throw error
    }
    return { lastInsertRowid: 0, changes: 1 }
}

export const createArticleFromRewrite = async (data: {
    title: string
    content: string
    status?: string
    source_url?: string | null
    meta_title?: string
    meta_description?: string
    thumbnail_url?: string
    brand_id?: number
}): Promise<RunResult> => {
    const defaultBrand = await getDefaultBrand()
    const brandId = data.brand_id || defaultBrand?.id

    const { data: record, error } = await supabase.from('articles').insert([{
        title: data.title,
        content: data.content,
        status: data.status || 'draft',
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        thumbnail_url: data.thumbnail_url,
        brand_id: brandId || null,
        slug: data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
    }]).select().single()

    if (error) throw error
    return { lastInsertRowid: record.id, changes: 1 }
}

// --- AI Orchestrator ---

export const createAIUsageLog = async (data: {
    brand_id?: number
    article_id?: number
    model_name: string
    provider: string
    task_type: string
    input_tokens: number
    output_tokens: number
    cost: number
    status: string
    error_message?: string
    duration_ms?: number
}): Promise<RunResult> => {
    try {
        const { data: record, error } = await supabase.from('ai_usage_logs').insert([data]).select().single()
        if (error) {
            console.warn('[Supabase] Failed to insert usage log:', error.message)
            return { lastInsertRowid: 0, changes: 0 } // Fail silently
        }
        return { lastInsertRowid: record.id, changes: 1 }
    } catch (e) {
        console.warn('[Supabase] Exception inserting usage log:', e)
        return { lastInsertRowid: 0, changes: 0 }
    }
}

export const getAIUsageLogs = async (limit: number = 100) => {
    try {
        const { data, error } = await supabase.from('ai_usage_logs').select('*').order('created_at', { ascending: false }).limit(limit)
        if (error) {
            console.warn('[Supabase] Failed to fetch usage logs:', error.message)
            return []
        }
        return data || []
    } catch (e) {
        console.warn('[Supabase] Exception fetching usage logs:', e)
        return []
    }
}

export const getAISetting = async (key: string) => {
    try {
        const { data, error } = await supabase.from('ai_settings').select('value').eq('key', key).maybeSingle()
        if (error) {
            console.warn(`[Supabase] Failed to fetch setting ${key}:`, error.message)
            return null
        }
        return data?.value || null
    } catch (e) {
        console.warn(`[Supabase] Exception fetching setting ${key}:`, e)
        return null
    }
}

export const updateAISetting = async (key: string, value: any) => {
    try {
        const { error } = await supabase.from('ai_settings').upsert({ key, value, updated_at: new Date().toISOString() })
        if (error) {
            console.warn(`[Supabase] Failed to update setting ${key}:`, error.message)
            return { lastInsertRowid: 0, changes: 0 }
        }
        return { lastInsertRowid: 0, changes: 1 }
    } catch (e) {
        console.warn(`[Supabase] Exception updating setting ${key}:`, e)
        return { lastInsertRowid: 0, changes: 0 }
    }
}
