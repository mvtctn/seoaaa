import * as groq from './groq'
import * as gemini from './gemini'
import * as deepseek from './deepseek'
import { createAIUsageLog, getAISetting, incrementUsage, checkUserLimit } from '@/lib/db/database'
import { logger } from '@/lib/logger'

export type AIProvider = 'groq' | 'gemini' | 'deepseek'

export interface AIRequestOptions {
    taskType: string
    brand_id?: number
    article_id?: number
    userId?: string
}

export const TOKENS_PER_SEODONG = 1000;

/**
 * AI Orchestrator v2.0
 * Handles multi-model failover and token tracking.
 */
export class AIOrchestrator {
    private static async getModelPriority(): Promise<AIProvider[]> {
        try {
            const settings = await getAISetting('model_priority')
            return settings || ['groq', 'gemini', 'deepseek']
        } catch (error) {
            logger.error('[AI Orchestrator] Failed to fetch model priority:', error)
            return ['groq', 'gemini', 'deepseek']
        }
    }

    /**
     * Generic execution with failover
     */
    private static async executeWithFailover<T extends { usage: { input_tokens: number, output_tokens: number } }>(
        taskName: string,
        options: AIRequestOptions,
        executeFunc: (provider: AIProvider) => Promise<T>
    ): Promise<T> {
        let priority: AIProvider[] = ['groq', 'gemini', 'deepseek']
        try {
            priority = await this.getModelPriority()
        } catch (e) {
            logger.warn('[AI Orchestrator] Using default priority due to error')
        }

        const errors: any[] = []

        // Preliminary check
        if (options.userId) {
            const canProceed = await checkUserLimit(options.userId, 0)
            if (!canProceed) {
                throw new Error('Hạn mức Seodong đã hết hoặc gói dịch vụ không khả dụng. Vui lòng nâng cấp gói.')
            }
        }

        for (const provider of priority) {
            const start = Date.now()
            try {
                logger.info(`[AI Orchestrator] Attempting ${taskName} with ${provider}...`)
                const result = await executeFunc(provider)

                // Log success
                const seodongCost = Math.ceil((result.usage.input_tokens + result.usage.output_tokens) / TOKENS_PER_SEODONG)
                try {
                    await createAIUsageLog({
                        brand_id: options.brand_id,
                        article_id: options.article_id,
                        model_name: provider === 'groq' ? 'llama-3.3-70b-versatile' :
                            provider === 'gemini' ? 'gemini-1.5-flash' : 'deepseek-chat',
                        provider,
                        task_type: options.taskType,
                        input_tokens: result.usage.input_tokens,
                        output_tokens: result.usage.output_tokens,
                        cost: seodongCost,
                        status: 'success',
                        duration_ms: Date.now() - start,
                        user_id: options.userId || ''
                    })
                } catch (logErr) {
                    logger.error('[AI Orchestrator] Logging failed:', logErr)
                }

                // Deduct from balance
                if (options.userId && seodongCost > 0) {
                    try {
                        await incrementUsage(options.userId, seodongCost)
                    } catch (incErr) {
                        logger.error(`[AI Orchestrator] Failed to deduct ${seodongCost} Seodong:`, incErr)
                    }
                }

                return result
            } catch (error: any) {
                logger.warn(`[AI Orchestrator] ${provider} failed:`, error.message)
                errors.push({ provider, error: error.message })

                // Log failure (Fail-safe)
                try {
                    await createAIUsageLog({
                        brand_id: options.brand_id,
                        article_id: options.article_id,
                        model_name: 'unknown',
                        provider,
                        task_type: options.taskType,
                        input_tokens: 0,
                        output_tokens: 0,
                        cost: 0,
                        status: 'failed',
                        error_message: error.message,
                        duration_ms: Date.now() - start,
                        user_id: options.userId || ''
                    })
                } catch (logErr) {
                    logger.error('[AI Orchestrator] Error logging failed:', logErr)
                }
            }
        }

        throw new Error(`All AI providers failed for ${taskName}: ${JSON.stringify(errors)}`)
    }

    static async analyzeCompetitors(keyword: string, competitors: any[], brandContext: any, userId: string) {
        return this.executeWithFailover(
            'Analyze Competitors',
            { taskType: 'research_analysis', brand_id: brandContext?.id, userId },
            async (provider) => {
                if (provider === 'groq') return groq.analyzeCompetitors(keyword, competitors, brandContext)
                if (provider === 'gemini') return gemini.analyzeCompetitors(keyword, competitors, brandContext)
                if (provider === 'deepseek') return deepseek.analyzeCompetitors(keyword, competitors, brandContext)
                throw new Error(`Provider ${provider} not implemented for analyzeCompetitors`)
            }
        )
    }

    static async generateArticle(params: {
        keyword: string
        researchBrief: any
        contentStrategy: string
        brandContext?: any
        articleId?: number
        userId: string
        options?: any
    }) {
        return this.executeWithFailover(
            'Generate Article',
            {
                taskType: 'article_generation',
                brand_id: params.brandContext?.id,
                article_id: params.articleId,
                userId: params.userId
            },
            async (provider) => {
                // Pass params, provider functions don't usually need userId unless they log usage internally (which they don't, orchestrator does)
                if (provider === 'groq') return groq.generateArticle(params)
                if (provider === 'gemini') return gemini.generateArticle(params)
                if (provider === 'deepseek') return deepseek.generateArticle(params)

                // Final Fallback if all providers fail inside executeFunc (unlikely but safe)
                return {
                    content: `[ARTICLE]\n# Error Generating Content\n\nSorry, all AI providers are currently unavailable. Please try again later.\n\n[SUMMARY]\nGeneration Failed.\n\n[META]\nMeta Title: Error\n`,
                    usage: { input_tokens: 0, output_tokens: 0 }
                }
            }
        ).catch(err => {
            logger.error('[Orchestrator] Critical Failure in generateArticle:', err)
            return {
                content: `[ARTICLE]\n# Generation Failed\n\nAI Orchestrator could not complete the request.\n\n[SUMMARY]\nFailed.\n`,
                usage: { input_tokens: 0, output_tokens: 0 }
            }
        })
    }

    static async generateContentStrategy(keyword: string, researchBrief: any, brandContext: any, userId: string) {
        return this.executeWithFailover(
            'Generate Content Strategy',
            { taskType: 'content_strategy', brand_id: brandContext?.id, userId },
            async (provider) => {
                if (provider === 'groq') {
                    const content = await groq.generateContentStrategy(keyword, researchBrief, brandContext)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'gemini') {
                    const content = await gemini.generateContentStrategy(keyword, researchBrief, brandContext)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'deepseek') {
                    const content = await deepseek.generateContentStrategy(keyword, researchBrief, brandContext)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                throw new Error(`Provider ${provider} not implemented for generateContentStrategy`)
            }
        )
    }

    static async generateMetaTitle(title: string, keyword: string, brandContext?: any, userId?: string) {
        return this.executeWithFailover(
            'Generate Meta Title',
            { taskType: 'meta_tag_generation', brand_id: brandContext?.id, userId: userId },
            async (provider) => {
                if (provider === 'groq') {
                    const content = await groq.generateMetaTitle(title, keyword)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'gemini') {
                    const content = await gemini.generateMetaTitle(title, keyword)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'deepseek') {
                    const content = await deepseek.generateMetaTitle(title, keyword)
                    return { content, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                throw new Error(`Provider ${provider} not implemented for generateMetaTitle`)
            }
        )
    }

    static async generateMetaDescription(title: string, keyword: string, content: string, brandContext?: any, userId?: string) {
        return this.executeWithFailover(
            'Generate Meta Description',
            { taskType: 'meta_tag_generation', brand_id: brandContext?.id, userId: userId },
            async (provider) => {
                if (provider === 'groq') {
                    const res = await groq.generateMetaDescription(title, keyword, content)
                    return { content: res, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'gemini') {
                    const res = await gemini.generateMetaDescription(title, keyword, content)
                    return { content: res, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                if (provider === 'deepseek') {
                    const res = await deepseek.generateMetaDescription(title, keyword, content)
                    return { content: res, usage: { input_tokens: 0, output_tokens: 0 } }
                }
                throw new Error(`Provider ${provider} not implemented for generateMetaDescription`)
            }
        )
    }

    static async analyzeReadability(content: string, brandContext?: any, userId?: string) {
        return this.executeWithFailover(
            'Analyze Readability',
            { taskType: 'content_analysis', brand_id: brandContext?.id, userId },
            async (provider) => {
                if (provider === 'groq') return groq.analyzeReadability(content)
                if (provider === 'gemini') return gemini.analyzeReadability(content)
                throw new Error(`Provider ${provider} not implemented for analyzeReadability`)
            }
        )
    }
}
