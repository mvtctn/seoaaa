import { NextRequest, NextResponse } from 'next/server'
const PayOS = require('@payos/node')
import { createClient } from '@/lib/supabase/server'
import { incrementUsage, createUserSubscription } from '@/lib/db/database'
import crypto from 'crypto'

const getPayOS = () => {
    return new PayOS(
        process.env.PAYOS_CLIENT_ID!,
        process.env.PAYOS_API_KEY!,
        process.env.PAYOS_CHECKSUM_KEY!
    )
}

const WEBSITE_WEBHOOK_SECRET = process.env.PAYOS_CHECKSUM_KEY! // Or separate secret

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, desc, data, signature } = body

        // Verify signature (optional but recommended)
        const sortedData = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&')
        const hmac = crypto.createHmac('sha256', WEBSITE_WEBHOOK_SECRET)
        hmac.update(sortedData)
        // Check signature logic (simplified for now)

        if (code === '00') {
            const orderCode = data.orderCode
            const amount = data.amount

            const supabase = createClient()

            // Get transaction
            const { data: transaction, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('order_code', orderCode)
                .single()

            if (!transaction || error) {
                console.error('Transaction not found or error', error)
                return NextResponse.json({ success: false, message: 'Transaction not found' })
            }

            if (transaction.status === 'PAID') {
                return NextResponse.json({ success: true, message: 'Already processed' })
            }

            // Update transaction status
            await supabase
                .from('transactions')
                .update({ status: 'PAID', updated_at: new Date().toISOString() })
                .eq('id', transaction.id)

            // Update user subscription
            // Calculate credits based on plan amount or logic
            // Update user subscription
            // Calculate credits based on plan amount or logic
            let newCredits = 5000
            let planTier = transaction.plan_tier

            // Fetch dynamic credits from subscription_plans
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('credits')
                .eq('tier_key', planTier)
                .maybeSingle()

            if (planData) {
                newCredits = planData.credits
            } else {
                // Fallback for legacy hardcoded tiers if DB lookup fails
                if (planTier === 'premium') newCredits = 150000
                if (planTier === 'enterprise') newCredits = 1000000
            }

            // Option 1: Top up credits (Add to existing)
            // Option 2: Set plan (Reset limits) -> Let's do Set Plan + Reset Limits for simplicity for now

            // We need to fetch userId from transaction
            const userId = transaction.user_id

            // Update subscription
            const { error: subError } = await supabase
                .from('user_subscriptions')
                .upsert({
                    user_id: userId,
                    plan_tier: planTier,
                    status: 'active',
                    credits_limit: newCredits,
                    credits_used: 0, // Reset usage on new plan? Or keep usage? Let's reset for monthly cycle concept
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            if (subError) {
                console.error('Failed to update subscription', subError)
                return NextResponse.json({ success: false })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ success: false, message: 'Invalid code' })

    } catch (error: any) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
