/**
 * SEOAAA Centralized Logger
 * Prevents log leakage in production and provides consistent formatting.
 */

const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
    /**
     * Use for internal development details. Only shows in development.
     */
    debug: (...args: any[]) => {
        if (isDev) {
            console.log('[DEBUG]', ...args)
        }
    },

    /**
     * Use for general information about app flow. Only shows in development.
     */
    info: (...args: any[]) => {
        if (isDev) {
            console.info('[INFO]', ...args)
        }
    },

    /**
     * Use for potential issues that aren't critical.
     */
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args)
    },

    /**
     * Use for critical failures. Always logs to console.
     */
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args)
    }
}
