const PayOS = require('@payos/node')
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const getPayOS = () => {
    return new PayOS(
        process.env.PAYOS_CLIENT_ID!,
        process.env.PAYOS_API_KEY!,
        process.env.PAYOS_CHECKSUM_KEY!
    )
}

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { plan, amount } = body

        if (!plan || !amount) {
            return NextResponse.json({ error: 'Missing plan or amount' }, { status: 400 })
        }

        const orderCode = Number(String(Date.now()).slice(-6)) + Math.floor(Math.random() * 1000)

        const paymentData = {
            orderCode: orderCode,
            amount: amount,
            description: `Thanh toan goi ${plan}`,
            cancelUrl: `${DOMAIN}/pricing?status=cancelled`,
            returnUrl: `${DOMAIN}/pricing/success?orderCode=${orderCode}&plan=${plan}`,
            items: [
                {
                    name: `Gói ${plan}`,
                    quantity: 1,
                    price: amount
                }
            ]
        }

        const paymentLinkData = await getPayOS().createPaymentLink(paymentData)

        // Save pending transaction to DB
        const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            order_code: orderCode,
            amount: amount,
            plan_tier: plan,
            status: 'PENDING',
            checkout_url: paymentLinkData.checkoutUrl
        })

        if (error) {
            console.error('DB Error:', error)
            return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 })
        }

        return NextResponse.json({
            checkoutUrl: paymentLinkData.checkoutUrl
        })

    } catch (error: any) {
        console.error('Payment Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
