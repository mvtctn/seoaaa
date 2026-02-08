import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from './logger'

/**
 * SEOAAA Standard API Error Handler
 * Provides consistent error responses and handles Zod validation errors.
 */
export function handleApiError(error: unknown, context: string = 'API') {
    // 1. Handle Zod Validation Errors
    if (error instanceof z.ZodError) {
        const zodError = error as z.ZodError
        logger.warn(`[${context}] Validation Failed:`, zodError.errors)
        return NextResponse.json(
            {
                error: 'Validation failed',
                details: zodError.errors.map((e: z.ZodIssue) => ({
                    path: e.path.join('.'),
                    message: e.message
                }))
            },
            { status: 400 }
        )
    }

    // 2. Handle known Database/Supabase errors if needed
    // (Optional: Add more specific error types here)

    // 3. Fallback for Internal Server Errors
    logger.error(`[${context}] Critical Error:`, error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
        {
            error: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : errorMessage
        },
        { status: 500 }
    )
}
