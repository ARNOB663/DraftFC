/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 8-Point Grid Spacing System
      spacing: {
        '0.5': '4px',   // space-1: micro gaps
        '1': '8px',     // space-2: tight spacing
        '2': '16px',    // space-3: component padding
        '3': '24px',    // space-4: section gaps
        '4': '32px',    // space-5: large gaps
        '5': '40px',
        '6': '48px',    // space-6: section spacing
        '7': '56px',
        '8': '64px',    // space-7: major sections
        '9': '72px',
        '10': '80px',
        '11': '88px',
        '12': '96px',
      },
      // Golden Ratio Typography Scale (Base: 16px)
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],      // ×0.75
        'sm': ['14px', { lineHeight: '20px' }],      // ×0.85
        'base': ['16px', { lineHeight: '24px' }],    // ×1
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['26px', { lineHeight: '32px' }],     // ×1.618 (Golden Ratio)
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['42px', { lineHeight: '48px' }],     // ×2.618 (Golden Ratio²)
        '5xl': ['52px', { lineHeight: '56px' }],
        '6xl': ['68px', { lineHeight: '72px' }],     // ×4.236 (Golden Ratio³)
      },
      colors: {
        // Primary colors
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Accent neon colors - Enhanced for esports
        neon: {
          cyan: '#00E5FF',
          green: '#00ff88',
          purple: '#a855f7',
          pink: '#f472b6',
          gold: '#ffd700',
          orange: '#ff6b35',
          blue: '#6366F1',
        },
        // Dark theme
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Rarity colors
        rarity: {
          legendary: '#ffd700',
          epic: '#a855f7',
          rare: '#3b82f6',
          common: '#64748b',
        },
        // FIFA/EA FC theme colors - Enhanced
        fc: {
          dark: '#0a0e1a',     // Navy Deep
          mid: '#1a1f35',      // Navy Mid
          purple: '#8b5cf6',   // Electric Purple
          cyan: '#00e5ff',     // Cyan Blue
          green: '#22c55e',    // Neon Green
          yellow: '#fbbf24',   // Golden Yellow
          orange: '#f97316',   // Stadium Orange
          darker: '#050d1a',   // Legacy darker
          deepest: '#030812',  // Legacy deepest
          blue: {
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          gold: '#fbbf24',
          accent: '#00E5FF',
          glow: 'rgba(0, 229, 255, 0.5)',
        },
        // Glass effect colors
        glass: {
          border: 'rgba(99, 102, 241, 0.3)',
          bg: 'rgba(10, 22, 40, 0.6)',
          highlight: 'rgba(255, 255, 255, 0.05)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',   // On 8-pt grid
        'xl': '20px',
        '2xl': '24px',  // On 8-pt grid
        '3xl': '32px',  // On 8-pt grid
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.2)',
        'glow-cyan-lg': '0 0 30px rgba(0, 229, 255, 0.5), 0 0 60px rgba(0, 229, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
        'card-depth': '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 12px 48px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'bid-pop': 'bid-pop 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'countdown': 'countdown 1s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spotlight': 'spotlight 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'focus-ring': 'focus-ring 1.5s ease-in-out infinite',
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
        'shine': 'shine 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.6)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bid-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'countdown': {
          '0%': { transform: 'scale(1.2)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spotlight': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), 0 0 40px rgba(0, 229, 255, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.4), 0 0 60px rgba(0, 229, 255, 0.2)' },
        },
        'focus-ring': {
          '0%, 100%': { boxShadow: '0 0 0 2px rgba(0, 229, 255, 0.5)' },
          '50%': { boxShadow: '0 0 0 4px rgba(0, 229, 255, 0.3)' },
        },
        'status-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'hero-radial': 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(ellipse 60% 40% at 70% 80%, rgba(0, 229, 255, 0.1), transparent 50%)',
        'vignette': 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 13, 26, 0.4) 70%, rgba(5, 13, 26, 0.8) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '16px',
        '2xl': '20px',
      },
      transitionTimingFunction: {
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
