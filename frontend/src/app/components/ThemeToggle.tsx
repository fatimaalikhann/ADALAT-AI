'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render a size-holding placeholder until client hydrates to avoid layout shift
  if (!mounted) {
    return <div className="w-11 h-11 md:w-9 md:h-9 rounded-lg shrink-0" />
  }

  const isDark = resolvedTheme === 'dark'

  function toggle() {
    document.documentElement.classList.add('switching-theme')
    setTheme(isDark ? 'light' : 'dark')
    setTimeout(() => document.documentElement.classList.remove('switching-theme'), 350)
  }

  return (
    <motion.button
      onClick={toggle}
      className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-[#0a1f44]/12 dark:border-white/[0.1] text-[#0a1f44]/50 dark:text-white/50 hover:text-gold hover:border-gold/30 dark:hover:text-gold dark:hover:border-gold/30 transition-colors shrink-0 touch-manipulation"
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.91 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          /* Moon — currently dark, click to go light */
          <motion.svg
            key="moon"
            className="w-[17px] h-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        ) : (
          /* Sun — currently light, click to go dark */
          <motion.svg
            key="sun"
            className="w-[17px] h-[17px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            initial={{ rotate: 30,  opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate: -30, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22 }}
          >
            <circle cx="12" cy="12" r="4.5" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
