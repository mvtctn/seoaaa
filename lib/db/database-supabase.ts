import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export interface RunResult {
    lastInsertRowid: number | bigint
    changes: number
}

// --- Brands ---

export const getBrandById = async (id: number, userId: string) => {
    const { data } = await supabase.from('brands').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
    return data
}

export const getAllBrands = async (userId: string) => {
    const { data } = await supabase.from('brands').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    return data || []
}

export const getDefaultBrand = async (userId: string) => {
    // Try to get the one marked as default for this user
    const { data } = await supabase.from('brands').select('*').eq('user_id', userId).eq('is_default', true).maybeSingle()
    if (data) return data

    // Fallback: Get the most recent one if no default exists
    const { data: latestBrand } = await supabase.from('brands').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
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
    user_id: string
}): Promise<RunResult> => {
    if (data.is_default) {
        await supabase.from('brands').update({ is_default: false }).eq('user_id', data.user_id).neq('id', 0)
    }

    const { data: record, error } = await supabase.from('brands').insert([{
        user_id: data.user_id,
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

export const updateBrand = async (id: number, userId: string, data: Partial<{
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
            await supabase.from('brands').update({ is_default: false }).eq('user_id', userId).neq('id', id)
        }

        const updateData: any = { ...data }
        if (data.core_values) updateData.core_values = JSON.parse(data.core_values)
        if (data.tone_of_voice) updateData.tone_of_voice = JSON.parse(data.tone_of_voice)
        if (data.internal_links) updateData.internal_links = JSON.parse(data.internal_links)
        updateData.updated_at = new Date().toISOString()

        const { error } = await supabase.from('brands').update(updateData).eq('id', id).eq('user_id', userId)
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

export const setDefaultBrand = async (id: number, userId: string): Promise<RunResult> => {
    // Unset all first
    await supabase.from('brands').update({ is_default: false }).eq('user_id', userId).neq('id', id)
    // Set current as default
    const { error } = await supabase.from('brands').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const deleteBrand = async (id: number, userId: string): Promise<RunResult> => {
    const { error } = await supabase.from('brands').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

// --- Keywords ---

export const createKeyword = async (data: {
    keyword: string
    brand_id?: number
    status?: string
    user_id: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('keywords').insert([{
        user_id: data.user_id,
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

export const getKeywordById = async (id: number, userId: string) => {
    const { data } = await supabase.from('keywords').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
    return data
}

export const updateKeywordStatus = async (id: number, status: string): Promise<RunResult> => {
    const { error } = await supabase.from('keywords').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const getAllKeywords = async (userId: string) => {
    const { data, error } = await supabase
        .from('keywords')
        .select('id, keyword, status, brand_id, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Error fetching keywords:', error)
        return []
    }
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
    user_id: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('research').insert([{
        user_id: data.user_id,
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

export const getResearchByKeywordId = async (keywordId: number, userId: string) => {
    const { data } = await supabase.from('research').select('*').eq('keyword_id', keywordId).eq('user_id', userId).maybeSingle()
    return data
}

export const getResearchById = async (id: number, userId: string) => {
    const { data } = await supabase.from('research').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
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
    user_id: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('articles').insert([{
        user_id: data.user_id,
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

export const getArticleById = async (id: number, userId: string) => {
    const { data, error } = await supabase
        .from('articles')
        .select('*, research(*)')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        logger.error(`Error fetching article ${id}:`, error)
    }
    return data
}

export const getArticleBySlug = async (slug: string, userId: string) => {
    const { data } = await supabase.from('articles').select('*').eq('slug', slug).eq('user_id', userId).maybeSingle()
    return data
}

export const getAllArticles = async (userId: string) => {
    const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, status, created_at, thumbnail_url, wp_post_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        logger.error('Error fetching articles:', error)
        return []
    }
    return data || []
}

export const updateArticle = async (id: number, userId: string, data: Partial<{
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

    const { error } = await supabase.from('articles').update(updateData).eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const updateArticleImage = async (id: number, userId: string, imageUrl: string): Promise<RunResult> => {
    const { error } = await supabase.from('articles').update({ thumbnail_url: imageUrl, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

export const deleteArticle = async (id: number, userId: string): Promise<RunResult> => {
    const { error } = await supabase.from('articles').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

// --- Batch Jobs ---

export const createBatchJob = async (data: {
    brand_id: number
    keywords: string
    status?: string
    progress?: string
    user_id: string
}): Promise<RunResult> => {
    const { data: record, error } = await supabase.from('batch_jobs').insert([{
        user_id: data.user_id,
        brand_id: data.brand_id,
        keywords: JSON.parse(data.keywords),
        status: data.status || 'pending',
        progress: data.progress ? JSON.parse(data.progress) : { total: 0, completed: 0, current: '' }
    }]).select().single()

    if (error) throw error
    return { lastInsertRowid: record.id, changes: 1 }
}

export const getBatchJobById = async (id: number, userId: string) => {
    const { data } = await supabase.from('batch_jobs').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
    return data
}

export const updateBatchJob = async (id: number, userId: string, data: Partial<{
    status: string
    progress: string
    completed_at: string
}>): Promise<RunResult> => {
    const updateData: any = { ...data }
    if (data.progress) updateData.progress = JSON.parse(data.progress)
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase.from('batch_jobs').update(updateData).eq('id', id).eq('user_id', userId)
    if (error) throw error
    return { lastInsertRowid: id, changes: 1 }
}

// --- Settings ---

export const getSetting = async (key: string, userId?: string) => {
    let query = supabase.from('app_settings').select('value').eq('key', key)
    if (userId) {
        query = query.eq('user_id', userId)
    }
    const { data, error } = await query.maybeSingle()
    if (error) {
        console.warn(`[Supabase Settings] Could not fetch ${key}:`, error.message)
        return null
    }
    return data?.value || null
}

export const updateSetting = async (key: string, value: any, userId?: string) => {
    const payload: any = { key, value, updated_at: new Date().toISOString() }
    if (userId) {
        payload.user_id = userId
    }
    const { error } = await supabase.from('app_settings').upsert(payload)
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
    user_id: string
}): Promise<RunResult> => {
    const defaultBrand = await getDefaultBrand(data.user_id)
    const brandId = data.brand_id || defaultBrand?.id

    const { data: record, error } = await supabase.from('articles').insert([{
        user_id: data.user_id,
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
    user_id: string
}): Promise<RunResult> => {
    try {
        const payload: any = { ...data }
        // Ensure user_id is in payload if not already
        if (data.user_id) payload.user_id = data.user_id

        const { data: record, error } = await supabase.from('ai_usage_logs').insert([payload]).select().single()
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

export const getAIUsageLogs = async (userId: string, limit: number = 100) => {
    try {
        const { data, error } = await supabase.from('ai_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit)
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

export const getAISetting = async (key: string, userId: string) => {
    try {
        const { data, error } = await supabase.from('ai_settings').select('value').eq('key', key).eq('user_id', userId).maybeSingle()
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

export const updateAISetting = async (key: string, value: any, userId?: string) => {
    // If userId provided, usage logs could be user-specific, but settings might be global or user specific.
    // For now, assume settings are user specific if userId is passed.
    const payload: any = { key, value, updated_at: new Date().toISOString() }
    if (userId) payload.user_id = userId

    // Note: This logic assumes rows are unique by (key, user_id) which requires DB unique constraint update
    // Or we handle logic to select correct row. For now, rely on standard upsert.
    try {
        const { error } = await supabase.from('ai_settings').upsert(payload)
        if (error) throw error
        return { lastInsertRowid: 0, changes: 1 }
    } catch (e) {
        return { lastInsertRowid: 0, changes: 0 }
    }
}

// --- Subscriptions & Limits ---

export const getUserSubscription = async (userId: string) => {
    const { data } = await supabase.from('user_subscriptions').select('*').eq('user_id', userId).maybeSingle()
    if (!data) {
        // Create default trial if not exists
        return createUserSubscription(userId, 'free')
    }
    return data
}

export const createUserSubscription = async (userId: string, plan: 'free' | 'premium' | 'enterprise') => {
    const limits = {
        free: 5000,
        premium: 150000,
        enterprise: 1000000
    }
    const { data, error } = await supabase.from('user_subscriptions').insert([{
        user_id: userId,
        plan_tier: plan,
        status: 'active',
        seodong_limit: limits[plan] || 10000
    }]).select().single()

    if (error) {
        console.error('Error creating subscription:', error)
        return null
    }
    return data
}

export const checkUserLimit = async (userId: string, seodongCost: number = 0): Promise<boolean> => {
    const sub = await getUserSubscription(userId)
    if (!sub) return false

    if (sub.status !== 'active') return false

    // Check balance with fallback to old column names if migration hasn't run yet
    const used = (sub.seodong_used ?? sub.credits_used ?? 0)
    const limit = (sub.seodong_limit ?? sub.credits_limit ?? 0)

    if (used + seodongCost > limit) {
        return false
    }
    return true
}

export const incrementUsage = async (userId: string, seodongCount: number) => {
    // Attempt RPC update for atomic increment if exists (we might need to update RPC name too if we want)
    const { error } = await supabase.rpc('increment_seodong_usage', { x: seodongCount, user_uuid: userId })

    // If RPC failed or doesn't exist, fallback to fetch-update
    if (error) {
        const sub = await getUserSubscription(userId)
        if (sub) {
            await supabase.from('user_subscriptions').update({
                seodong_used: (sub.seodong_used || 0) + seodongCount,
                updated_at: new Date().toISOString()
            }).eq('user_id', userId)
        }
    }
}
