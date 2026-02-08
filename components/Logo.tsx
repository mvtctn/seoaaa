import React from 'react'

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
    showText?: boolean;
}

export default function Logo({ width = 32, height = 32, className = '', showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg width={width} height={height} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
                <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logo_gradient)" fillOpacity="0.9" />
                <path d="M30 65 L45 50 L55 60 L70 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M70 35 L60 35 M70 35 L70 45" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="75" cy="25" r="4" fill="#60A5FA" />
            </svg>
            {showText && (
                <span className="font-bold text-xl tracking-tight text-foreground flex items-center">
                    SEO<span className="text-primary ml-0.5">AAA</span>
                </span>
            )}
        </div>
    )
}
