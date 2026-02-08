'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './SparkleBackground.module.css'

export default function SparkleBackground() {
    const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([])

    useEffect(() => {
        const newSparkles = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5
        }))
        setSparkles(newSparkles)
    }, [])

    return (
        <div className={styles.container}>
            {sparkles.map((s) => (
                <motion.div
                    key={s.id}
                    className={styles.sparkle}
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                    }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: s.delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
            <div className={styles.grid} />
        </div>
    )
}
