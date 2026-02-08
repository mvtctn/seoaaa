'use client'

import { useMemo } from 'react'
import styles from './dashboard-charts.module.css'
import { motion } from 'framer-motion'

interface DashboardChartsProps {
    articles: any[]
    keywords: any[]
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}`
}

export default function DashboardCharts({ articles, keywords }: DashboardChartsProps) {
    // 1. Articles per Day (Last 7 Days)
    const barChartData = useMemo(() => {
        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (6 - i))
            d.setHours(0, 0, 0, 0)
            return d
        })

        const data: { [key: string]: number } = {}
        last7Days.forEach(d => {
            data[formatDate(d.toISOString())] = 0
        })

        articles.forEach(article => {
            const articleDate = new Date(article.created_at)
            const dateStr = formatDate(article.created_at)
            // Check if it's within our range
            if (data.hasOwnProperty(dateStr)) {
                data[dateStr] += 1
            }
        })

        const sortedData = last7Days.map(d => {
            const key = formatDate(d.toISOString())
            return {
                label: key,
                value: data[key]
            }
        })

        const maxValue = Math.max(...sortedData.map(d => d.value), 1) // default 1 to avoid div by zero
        return { sortedData, maxValue }
    }, [articles])

    // 2. Article Status Distribution (Pie Chart Logic)
    const statusData = useMemo(() => {
        const counts: { [key: string]: number } = {
            published: 0,
            draft: 0,
            processing: 0,
            error: 0,
            other: 0
        }

        articles.forEach(article => {
            const status = (article.status || 'draft').toLowerCase()
            if (status === 'success' || status === 'published' || status === 'done') {
                counts.published += 1
            } else if (status === 'draft' || status === 'pending') {
                counts.draft += 1
            } else if (status === 'processing') {
                counts.processing += 1
            } else if (status === 'error') {
                counts.error += 1
            } else {
                counts.other += 1
            }
        })

        const total = articles.length
        if (total === 0) return []

        const data = [
            { label: 'Published/Done', value: counts.published, color: '#10b981', percentage: (counts.published / total) * 100 },
            { label: 'Draft/Pending', value: counts.draft, color: '#f59e0b', percentage: (counts.draft / total) * 100 },
            { label: 'Processing', value: counts.processing, color: '#3b82f6', percentage: (counts.processing / total) * 100 },
            { label: 'Error', value: counts.error, color: '#ef4444', percentage: (counts.error / total) * 100 },
            { label: 'Other', value: counts.other, color: '#6b7280', percentage: (counts.other / total) * 100 }
        ].filter(d => d.value > 0) // Only show non-zero

        return data
    }, [articles])

    // SVG Pie Chart Generator
    const generatePiePath = (percentage: number, offset: number) => {
        const radius = 50
        const circumference = 2 * Math.PI * radius
        const dashArray = (percentage / 100) * circumference
        const dashOffset = (offset / 100) * circumference * -1
        return { dashArray, dashOffset, circumference }
    }

    let cumulativePercentage = 0

    return (
        <div className={styles.chartsContainer}>
            {/* Bar Chart: Articles Created Last 7 Days */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Hoạt Động Gần Đây</h3>
                    <p className={styles.chartSubtitle}>Số lượng bài viết trong 7 ngày qua</p>
                </div>

                {barChartData.sortedData.length > 0 ? (
                    <div className={styles.barChartContainer}>
                        {barChartData.sortedData.map((item, index) => {
                            const heightPercentage = Math.max((item.value / barChartData.maxValue) * 100, 4)
                            return (
                                <div key={index} className={styles.barColumn} style={{ height: '100%' }}>
                                    <motion.div
                                        className={styles.bar}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercentage}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                    >
                                        <div className={styles.barTooltip}>
                                            {item.value} bài viết
                                        </div>
                                    </motion.div>
                                    <span className={styles.barLabel}>{item.label}</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>Chưa có dữ liệu</div>
                )}
            </div>

            {/* Pie Chart: Status Distribution */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>Trạng Thái Bài Viết</h3>
                    <p className={styles.chartSubtitle}>Phân bổ theo trạng thái hiện tại</p>
                </div>

                {articles.length > 0 ? (
                    <>
                        <div className={styles.pieChartContainer}>
                            <svg width="200" height="200" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1f2937" strokeWidth="20" />
                                {statusData.map((item, index) => {
                                    const { dashArray, dashOffset, circumference } = generatePiePath(item.percentage, cumulativePercentage)
                                    cumulativePercentage += item.percentage
                                    return (
                                        <motion.circle
                                            key={index}
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="20"
                                            initial={{ strokeDasharray: `0 ${circumference}` }}
                                            animate={{ strokeDasharray: `${dashArray} ${circumference}` }}
                                            strokeDashoffset={dashOffset}
                                            transform="rotate(-90 60 60)"
                                            transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                                        >
                                            <title>{item.label}: {item.value} ({Math.round(item.percentage)}%)</title>
                                        </motion.circle>
                                    )
                                })}
                                {/* Text in center */}
                                <text x="60" y="60" textAnchor="middle" dy="0.3em" fill="#fff" fontSize="14" fontWeight="bold">
                                    {articles.length} Total
                                </text>
                            </svg>
                        </div>
                        <div className={styles.pieLegend}>
                            {statusData.map((item, index) => (
                                <div key={index} className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: item.color }}></span>
                                    <span>{item.label} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>Chưa có bài viết nào</div>
                )}
            </div>
        </div>
    )
}
