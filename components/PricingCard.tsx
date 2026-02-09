'use client'

import React, { useState } from 'react'

export interface PricingCardProps {
    plan: string;
    tierKey?: string; // Stable ID
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
    description?: string;
}

import styles from '../app/pricing/pricing.module.css'

export default function PricingCard({ plan, tierKey, price, credits, features, isPopular, description }: PricingCardProps) {
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        if (price === 0) {
            window.location.href = '/dashboard'
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/payment/create-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: (tierKey || plan).toString().toLowerCase(),
                    amount: price
                })
            })

            const data = await res.json().catch(() => null)

            if (res.status === 401) {
                window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
                return
            }

            if (!res.ok) {
                throw new Error(data?.error || `Payment failed with status ${res.status}`)
            }

            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl
            } else {
                throw new Error('No checkout URL returned')
            }
        } catch (error: any) {
            console.error(error)
            alert('Lỗi thanh toán: ' + (error.message || 'Unknown error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`${styles.pricingCard} ${isPopular ? styles.popular : ''}`}>
            {isPopular && <div className={styles.popularBadge}>LỰA CHỌN TỐT NHẤT</div>}
            <div className={styles.cardHeader}>
                <h3>{plan}</h3>
                <p className={styles.cardDesc}>{description || (plan === 'Premium' ? 'Professional & Freelancer' : 'Agencies & Doanh nghiệp')}</p>
            </div>
            <div className={styles.price}>
                {price === 0 ? (
                    <span className={styles.priceAmount}>Free</span>
                ) : (
                    <span className={styles.priceAmount}>{new Intl.NumberFormat('vi-VN').format(price)}đ</span>
                )}
                <span className={styles.pricePeriod}>{price === 0 ? '/vĩnh viễn' : '/tháng'}</span>
            </div>
            <ul className={styles.features}>
                {features.map((feature, idx) => (
                    <li key={idx}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <button
                className={`${isPopular ? styles.buttonPrimary : styles.button} w-full`}
                onClick={handleSubscribe}
                disabled={loading}
            >
                {loading ? 'Đang xử lý...' : (price === 0 ? 'Bắt Đầu Ngay' : `Nâng Cấp ${plan}`)}
            </button>
        </div>
    )
}
