import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#080810',
          light:   '#13131f',
          dark:    '#050508',
          50:      '#0e0e1a',
          100:     '#111120',
        },
        gold: '#c9a227',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        urdu: ['var(--font-urdu)', 'Noto Nastaliq Urdu', 'serif'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 45%, rgba(100,60,255,0.13) 0%, rgba(60,40,200,0.06) 45%, transparent 70%)',
      },
    },
  },
  plugins: [],
}

export default config
