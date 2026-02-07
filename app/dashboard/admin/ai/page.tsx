'use client'

import React, { useState, useEffect } from 'react'
import styles from './ai-management.module.css'

interface AILog {
    id: number
    model_name: string
    provider: string
    task_type: string
    input_tokens: number
    output_tokens: number
    status: string
    error_message?: string
    duration_ms?: number
    created_at: string
}

const Icons = {
    Cpu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2" /></svg>,
    Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    BarChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
    Up: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>,
    Down: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>,
    Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
}

export default function AIManagementPage() {
    const [logs, setLogs] = useState<AILog[]>([])
    const [priority, setPriority] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/ai/settings')
            const data = await res.json()
            if (data.success) {
                setLogs(data.data.logs)
                setPriority(data.data.priority)
            }
        } catch (error) {
            console.error('Failed to fetch AI settings', error)
        } finally {
            setLoading(false)
        }
    }

    const savePriority = async (newPriority: string[]) => {
        setSaving(true)
        try {
            await fetch('/api/admin/ai/settings', {
                method: 'POST',
                body: JSON.stringify({ key: 'model_priority', value: newPriority })
            })
            setPriority(newPriority)
        } catch (error) {
            console.error('Failed to save priority', error)
        } finally {
            setSaving(false)
        }
    }

    const moveUp = (index: number) => {
        if (index === 0) return
        const newPriority = [...priority]
        const temp = newPriority[index]
        newPriority[index] = newPriority[index - 1]
        newPriority[index - 1] = temp
        savePriority(newPriority)
    }

    const moveDown = (index: number) => {
        if (index === priority.length - 1) return
        const newPriority = [...priority]
        const temp = newPriority[index]
        newPriority[index] = newPriority[index + 1]
        newPriority[index + 1] = temp
        savePriority(newPriority)
    }

    const totalInputTokens = logs.reduce((sum, log) => sum + log.input_tokens, 0)
    const totalOutputTokens = logs.reduce((sum, log) => sum + log.output_tokens, 0)
    const errorCount = logs.filter(log => log.status === 'failed').length

    if (loading) {
        return <div className={styles.container}>Đang tải dữ liệu...</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng Input Tokens</div>
                    <div className={styles.statValue}>{totalInputTokens.toLocaleString()}</div>
                    <Icons.Zap />
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng Output Tokens</div>
                    <div className={styles.statValue}>{totalOutputTokens.toLocaleString()}</div>
                    <Icons.Cpu />
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tỷ lệ lỗi</div>
                    <div className={styles.statValue}>
                        {logs.length > 0 ? ((errorCount / logs.length) * 100).toFixed(1) : 0}%
                    </div>
                    <Icons.Alert />
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Thời gian phản hồi TB</div>
                    <div className={styles.statValue}>
                        {logs.length > 0 ? (logs.reduce((s, l) => s + (l.duration_ms || 0), 0) / logs.length).toFixed(0) : 0}ms
                    </div>
                    <Icons.Activity />
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}><Icons.BarChart /> Ưu tiên Mô hình (Failover Chain)</h2>
                <div className={styles.priorityList}>
                    {priority.map((provider, index) => (
                        <div key={provider} className={styles.priorityItem}>
                            <div className={styles.modelInfo}>
                                <div className={styles.statLabel}>{index + 1}</div>
                                <span className={`${styles.modelBadge} ${styles['provider_' + provider]}`}>
                                    {provider.toUpperCase()}
                                </span>
                                <span>{provider === 'groq' ? 'Llama 3.3 70B' : provider === 'gemini' ? 'Gemini 1.5 Flash' : 'DeepSeek Chat'}</span>
                            </div>
                            <div className={styles.modelInfo}>
                                <button onClick={() => moveUp(index)} disabled={index === 0 || saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                    <Icons.Up />
                                </button>
                                <button onClick={() => moveDown(index)} disabled={index === priority.length - 1 || saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                    <Icons.Down />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {saving && <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-primary)' }}>Đang lưu thay đổi...</p>}
            </div>

            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}><Icons.Activity /> Nhật ký sử dụng AI</h2>
                    <button onClick={fetchData} className={styles.refreshBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--color-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                        <Icons.Refresh /> Làm mới
                    </button>
                </div>
                <div className={styles.logTableWrap}>
                    <table className={styles.logTable}>
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Provider</th>
                                <th>Task</th>
                                <th>Tokens (I/O)</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <span className={`${styles.modelBadge} ${styles['provider_' + log.provider]}`}>
                                            {log.provider}
                                        </span>
                                    </td>
                                    <td><span className={styles.taskBadge}>{log.task_type}</span></td>
                                    <td>{log.input_tokens} / {log.output_tokens}</td>
                                    <td>{log.duration_ms}ms</td>
                                    <td>
                                        <span className={log.status === 'success' ? styles.status_success : styles.status_failed}>
                                            {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                                        </span>
                                        {log.error_message && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.error_message}>
                                                {log.error_message}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
