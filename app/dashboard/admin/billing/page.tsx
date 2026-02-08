'use client'

import React, { useState, useEffect } from 'react'
import styles from './billing.module.css'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Transaction {
    id: number
    order_code: number
    amount: number
    plan_tier: string
    status: string
    created_at: string
    user_id: string
    user_email?: string
}

export default function AdminBillingPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: trans, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error
            setTransactions(trans || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to set status to ${status}?`)) return

        try {
            const { error } = await supabase
                .from('transactions')
                .update({ status: status })
                .eq('id', id)

            if (error) throw error
            fetchData() // Refresh
        } catch (error: any) {
            alert('Error updating: ' + error.message)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Lịch Sử Giao Dịch</h2>
                    <p className="text-secondary">Theo dõi các giao dịch thanh toán gần đây.</p>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-8 text-secondary">Loading...</div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã Đơn</th>
                                <th>Ngày Tạo</th>
                                <th>User ID</th>
                                <th>Gói</th>
                                <th>Số Tiền</th>
                                <th>Trạng Thái</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="font-mono">{tx.order_code}</td>
                                    <td className="text-sm text-secondary">
                                        {new Date(tx.created_at).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="text-xs text-secondary font-mono">
                                        {tx.user_email || tx.user_id?.slice(0, 8) + '...'}
                                    </td>
                                    <td>
                                        <span className={styles.badge}>{tx.plan_tier.toUpperCase()}</span>
                                    </td>
                                    <td className="font-medium">{tx.amount.toLocaleString()}đ</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[tx.status.toLowerCase()]}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td>
                                        {tx.status === 'PENDING' && (
                                            <button
                                                className="btn btn-xs btn-outline"
                                                onClick={() => handleUpdateStatus(tx.id, 'PAID')}
                                            >
                                                Duyệt
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-secondary">Không có giao dịch nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
