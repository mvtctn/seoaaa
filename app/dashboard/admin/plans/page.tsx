'use client'

import React, { useState, useEffect } from 'react'
import styles from './plans.module.css'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Plan {
    id: number
    name: string
    tier_key: string
    price: number
    currency: string
    credits: number
    features: string[]
    title?: string // For UI display if needed different from name
    description?: string
    is_active: boolean
    is_popular: boolean
}

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<Partial<Plan>>({})
    const supabase = createClient()

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('price', { ascending: true })

            if (error) {
                console.error('Error fetching plans:', error)
                // Fallback for demo if table doesn't exist yet
                // setPlans(defaultPlans) 
            } else {
                setPlans(data || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (plan: Plan) => {
        setEditingId(plan.id)
        setEditForm({ ...plan })
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleSave = async () => {
        if (!editingId) return

        try {
            const { error } = await supabase
                .from('subscription_plans')
                .update({
                    price: editForm.price,
                    credits: editForm.credits,
                    features: editForm.features, // JSON array
                    is_active: editForm.is_active,
                    is_popular: editForm.is_popular,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingId)

            if (error) throw error

            alert('Cập nhật thành công!')
            setEditingId(null)
            fetchPlans()
        } catch (error: any) {
            alert('Lỗi: ' + error.message)
        }
    }

    const handleChange = (field: keyof Plan, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...(editForm.features || [])]
        newFeatures[index] = value
        setEditForm(prev => ({ ...prev, features: newFeatures }))
    }

    const addFeature = () => {
        setEditForm(prev => ({ ...prev, features: [...(prev.features || []), ''] }))
    }

    const removeFeature = (index: number) => {
        const newFeatures = [...(editForm.features || [])]
        newFeatures.splice(index, 1)
        setEditForm(prev => ({ ...prev, features: newFeatures }))
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h2>Quản Lý Gói Cước</h2>
                    <p className="text-secondary">Chỉnh sửa giá, quyền lợi và trạng thái các gói dịch vụ.</p>
                </div>
                <button className="btn btn-primary" onClick={fetchPlans}>Làm mới</button>
            </header>

            {loading ? (
                <div className="text-center py-8 text-secondary">Loading...</div>
            ) : plans.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Chưa có gói cước nào hoặc chưa tạo bảng trong database.</p>
                    <p className="description">Vui lòng chạy script SQL để khởi tạo bảng <code>subscription_plans</code>.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {plans.map(plan => (
                        <div key={plan.id} className={`${styles.card} ${editingId === plan.id ? styles.editing : ''}`}>
                            <div className={styles.cardHeader}>
                                <h3>{plan.name}</h3>
                                {plan.is_popular && <span className={styles.badgePopular}>Phổ Biến</span>}
                                {editingId === plan.id ? (
                                    <div className={styles.actions}>
                                        <button className="btn btn-xs btn-primary" onClick={handleSave}>Lưu</button>
                                        <button className="btn btn-xs btn-outline" onClick={handleCancel}>Hủy</button>
                                    </div>
                                ) : (
                                    <button className="btn btn-xs btn-outline" onClick={() => handleEdit(plan)}>Sửa</button>
                                )}
                            </div>

                            <div className={styles.cardBody}>
                                {editingId === plan.id ? (
                                    <div className={styles.form}>
                                        <div className={styles.field}>
                                            <label>Giá (VNĐ)</label>
                                            <input
                                                type="number"
                                                value={editForm.price}
                                                onChange={(e) => handleChange('price', Number(e.target.value))}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Credits</label>
                                            <input
                                                type="number"
                                                value={editForm.credits}
                                                onChange={(e) => handleChange('credits', Number(e.target.value))}
                                                className={styles.input}
                                            />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Features</label>
                                            {editForm.features?.map((feat, idx) => (
                                                <div key={idx} className={styles.featureRow}>
                                                    <input
                                                        value={feat}
                                                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                                                        className={styles.input}
                                                    />
                                                    <button onClick={() => removeFeature(idx)} className={styles.btnRemove}>×</button>
                                                </div>
                                            ))}
                                            <button onClick={addFeature} className={styles.btnAddFeature}>+ Thêm tính năng</button>
                                        </div>
                                        <div className={styles.field}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.is_popular || false}
                                                    onChange={(e) => handleChange('is_popular', e.target.checked)}
                                                /> Phổ biến
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.is_active || false}
                                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                                /> Kích hoạt
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.price}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                                        </div>
                                        <div className={styles.credits}>
                                            {plan.credits.toLocaleString()} Credits
                                        </div>
                                        <ul className={styles.features}>
                                            {plan.features.map((feat, idx) => (
                                                <li key={idx}>{feat}</li>
                                            ))}
                                        </ul>
                                        <div className={styles.status}>
                                            {plan.is_active ? (
                                                <span className={styles.statusActive}>Đang hoạt động</span>
                                            ) : (
                                                <span className={styles.statusInactive}>Tạm ẩn</span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
