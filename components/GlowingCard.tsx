'use client'

import { useState, useRef, ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import styles from './GlowingCard.module.css'

interface GlowingCardProps {
    children: ReactNode
    className?: string
}

export default function GlowingCard({ children, className = '' }: GlowingCardProps) {
    let mouseX = useMotionValue(0)
    let mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        let { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <div
            className={`${styles.cardWrapper} ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className={styles.glow}
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(59, 130, 246, 0.15),
                            transparent 80%
                        )
                    `,
                }}
            />
            <div className={styles.cardContent}>
                {children}
            </div>
        </div>
    )
}
