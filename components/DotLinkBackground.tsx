'use client'

import React, { useEffect, useRef } from 'react'
import styles from './DotLinkBackground.module.css'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    size: number
}

export default function DotLinkBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0, active: false })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        const particleCount = 100
        const connectionDistance = 150
        const mouseRadius = 200

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const initParticles = () => {
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1
                })
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]

                p.x += p.vx
                p.y += p.vy

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1

                // Mouse interaction
                if (mouseRef.current.active) {
                    const dx = mouseRef.current.x - p.x
                    const dy = mouseRef.current.y - p.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < mouseRadius) {
                        const force = (mouseRadius - dist) / mouseRadius
                        p.x -= dx * force * 0.02
                        p.y -= dy * force * 0.02
                    }
                }

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
                ctx.fill()

                // Draw lines
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p.x - p2.x
                    const dy = p.y - p2.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < connectionDistance) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / connectionDistance)})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener('resize', resizeCanvas)
        resizeCanvas()
        draw()

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
        }

        const handleMouseLeave = () => {
            mouseRef.current.active = false
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseleave', handleMouseLeave)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className={styles.canvas}
        />
    )
}
