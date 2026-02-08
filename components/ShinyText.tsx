'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import styles from './ShinyText.module.css'

export default function ShinyText({ text, className = '' }: { text: string; className?: string }) {
    return (
        <span className={`${styles.shiny} ${className}`}>
            {text}
        </span>
    )
}
