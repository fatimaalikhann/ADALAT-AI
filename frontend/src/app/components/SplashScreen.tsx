'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const SPRING: [number, number, number, number]    = [0.22, 1, 0.36, 1]
const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

const PARTICLES = [
  { id:  1, left:  5, dur: 7.2, delay: 0.0, size: 1.5 },
  { id:  2, left: 12, dur: 5.8, delay: 1.4, size: 2.0 },
  { id:  3, left: 21, dur: 8.1, delay: 0.7, size: 1.0 },
  { id:  4, left: 30, dur: 6.5, delay: 2.1, size: 1.5 },
  { id:  5, left: 38, dur: 7.8, delay: 0.3, size: 2.0 },
  { id:  6, left: 47, dur: 5.5, delay: 1.8, size: 1.0 },
  { id:  7, left: 56, dur: 8.4, delay: 0.5, size: 1.5 },
  { id:  8, left: 65, dur: 6.2, delay: 2.4, size: 2.0 },
  { id:  9, left: 74, dur: 7.5, delay: 1.1, size: 1.0 },
  { id: 10, left: 83, dur: 5.9, delay: 0.9, size: 1.5 },
  { id: 11, left: 91, dur: 8.0, delay: 2.8, size: 2.0 },
  { id: 12, left: 97, dur: 6.8, delay: 0.2, size: 1.0 },
]

const NAME_CHARS = 'FATIMA ALI KHAN'.split('')

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [done,    setDone]    = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('adalat-splash')) {
      setDone(true)
      return
    }

    let exitTimer: ReturnType<typeof setTimeout>
    let doneTimer: ReturnType<typeof setTimeout>

    const showTimer = setTimeout(() => {
      setVisible(true)
      exitTimer = setTimeout(() => {
        setExiting(true)
        sessionStorage.setItem('adalat-splash', '1')
        doneTimer = setTimeout(() => setDone(true), 1200)
      }, 3500)
    }, 3800)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [])

  if (done || !visible) return null

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden">

      {/* Curtain halves */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-[#080810]"
        style={{ height: '50%' }}
        animate={exiting ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 0.72, ease: EXIT_EASE, delay: exiting ? 0.38 : 0 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-[#080810]"
        style={{ height: '50%' }}
        animate={exiting ? { y: '100%' } : { y: 0 }}
        transition={{ duration: 0.72, ease: EXIT_EASE, delay: exiting ? 0.38 : 0 }}
      />

      {/* Fade group */}
      <motion.div
        className="absolute inset-0 z-10"
        animate={exiting ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: 'easeIn' }}
      >
        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {PARTICLES.map(p => (
            <span
              key={p.id}
              className="absolute rounded-full bg-white"
              style={{
                left:      `${p.left}%`,
                bottom:    '0px',
                width:     `${p.size}px`,
                height:    `${p.size}px`,
                opacity:   0,
                animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize:  '28px 28px',
          }}
        />

        {/* Ambient gold glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(201,162,39,0.08) 0%, transparent 65%)' }}
        />

        {/* Content — px-5 on mobile keeps everything off the edges */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5 md:px-8">

          {/* Logo — scales down on mobile via clamp */}
          <motion.div
            className="flex items-center mb-5 md:mb-8"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: SPRING }}
          >
            <span
              className="font-bold tracking-tight"
              style={{
                fontSize:   'clamp(28px, 7vw, 48px)',
                color:      '#c9a227',
                textShadow: '0 0 36px rgba(201,162,39,0.50)',
              }}
            >
              Adalat
            </span>
            <span
              className="mx-3 md:mx-4 shrink-0"
              style={{
                display:      'inline-block',
                width:        '2px',
                height:       'clamp(20px, 3.5vw, 34px)',
                background:   'rgba(201,162,39,0.45)',
                borderRadius: '1px',
              }}
            />
            <span
              className="font-bold tracking-tight text-white"
              style={{
                fontSize:   'clamp(28px, 7vw, 48px)',
                textShadow: '0 0 36px rgba(201,162,39,0.30)',
              }}
            >
              AI
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-white/45 text-sm md:text-base lg:text-lg max-w-[min(480px,88vw)] leading-relaxed mb-6 md:mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: SPRING, delay: 0.3 }}
          >
            An autonomous multi-agent AI system giving every Pakistani citizen
            free access to legal rights, documents, and justice — in Urdu and English.
          </motion.p>

          {/* Divider */}
          <motion.div
            className="h-px mb-5 md:mb-9"
            style={{
              width:           '160px',
              background:      'rgba(201,162,39,0.45)',
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.65, ease: SPRING, delay: 0.68 }}
          />

          {/* "Designed & Built By" */}
          <motion.p
            className="text-white/28 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.18em] md:tracking-[0.22em] mb-3 md:mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 1.0 }}
          >
            Designed &amp; Built By
          </motion.p>

          {/* FATIMA ALI KHAN — letter stagger, sized to never overflow 375px */}
          <div
            className="flex items-baseline justify-center mb-3 md:mb-4"
            style={{ perspective: '500px' }}
          >
            {NAME_CHARS.map((char, i) => (
              <motion.span
                key={i}
                className="font-bold text-white inline-block"
                style={{
                  fontSize:      'clamp(20px, 6vw, 40px)',
                  letterSpacing: '0.06em',
                  lineHeight:    1,
                  textShadow:    '0 0 30px rgba(201,162,39,0.5), 0 0 60px rgba(201,162,39,0.25)',
                }}
                initial={{ opacity: 0, rotateX: 80, y: 10 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: 0.48, ease: SPRING, delay: 1.18 + i * 0.042 }}
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
          </div>

          {/* Cognitive AI Engineer */}
          <motion.p
            className="text-[11px] md:text-[13px] font-semibold mb-1.5 md:mb-2"
            style={{ color: '#c9a227', letterSpacing: '0.05em' }}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: SPRING, delay: 2.08 }}
          >
            Cognitive AI Engineer
          </motion.p>

          {/* Specializations — breaks into two lines on narrow screens via max-width */}
          <motion.p
            className="text-white/28 text-[10px] md:text-sm tracking-wide max-w-[min(360px,85vw)] leading-relaxed"
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: SPRING, delay: 2.26 }}
          >
            Agentic Systems Architect · Cognitive Computing Specialist
          </motion.p>

        </div>
      </motion.div>
    </div>
  )
}
