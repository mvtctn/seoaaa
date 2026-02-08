'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimateEntranceProps {
    children: ReactNode
    delay?: number
    duration?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
    distance?: number
    scale?: number
    className?: string
    once?: boolean
}

export default function AnimateEntrance({
    children,
    delay = 0,
    duration = 0.6,
    direction = 'up',
    distance = 40,
    scale = 1,
    className = '',
    once = true
}: AnimateEntranceProps) {
    const directions = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {}
    }

    return (
        <motion.div
            className={className}
            initial={{
                opacity: 0,
                ...directions[direction],
                scale: scale
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1
            }}
            viewport={{ once }}
            transition={{
                duration,
                delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
        >
            {children}
        </motion.div>
    )
}
