'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MESSAGES = [
  'Initializing 6 AI Agents…',
  'Loading Pakistani Law Database…',
  'Ready.',
]

// Pre-defined so SSR and client render identical HTML
const PARTICLES = [
  { id:  1, left:  8, dur: 6.4, delay: 0.2, size: 2   },
  { id:  2, left: 17, dur: 7.2, delay: 1.1, size: 1.5 },
  { id:  3, left: 26, dur: 5.8, delay: 0.6, size: 1   },
  { id:  4, left: 35, dur: 8.0, delay: 2.0, size: 2   },
  { id:  5, left: 44, dur: 6.6, delay: 0.4, size: 1.5 },
  { id:  6, left: 55, dur: 7.4, delay: 1.5, size: 2   },
  { id:  7, left: 64, dur: 5.5, delay: 0.8, size: 1   },
  { id:  8, left: 73, dur: 8.3, delay: 2.6, size: 1.5 },
  { id:  9, left: 82, dur: 6.2, delay: 1.3, size: 2   },
  { id: 10, left: 91, dur: 7.7, delay: 0.3, size: 1   },
]

const EXIT_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const ENTRY_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function LoadingScreen() {
  const [show, setShow]       = useState(false)
  const [exiting, setExiting] = useState(false)
  const [msgIdx, setMsgIdx]   = useState(0)

  // Only show on first visit in a session
  useEffect(() => {
    if (!sessionStorage.getItem('adalat-loaded')) {
      sessionStorage.setItem('adalat-loaded', '1')
      setShow(true)
    }
  }, [])

  // Cycle messages: first change at 600ms, then every 800ms
  useEffect(() => {
    if (!show) return
    let iid: ReturnType<typeof setInterval> | null = null
    const tid = setTimeout(() => {
      iid = setInterval(() => {
        setMsgIdx(i => {
          const next = i + 1
          if (next >= MESSAGES.length - 1) clearInterval(iid!)
          return Math.min(next, MESSAGES.length - 1)
        })
      }, 800)
    }, 600)
    return () => { clearTimeout(tid); if (iid) clearInterval(iid) }
  }, [show])

  // Trigger exit at 3 s
  useEffect(() => {
    if (!show) return
    const id = setTimeout(() => setExiting(true), 3000)
    return () => clearTimeout(id)
  }, [show])

  if (!show) return null

  return (
    <AnimatePresence onExitComplete={() => setShow(false)}>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#080810' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.72, ease: EXIT_EASE }}
        >
          {/* Floating particles */}
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

          {/* Ambient purple glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(100,60,255,0.08) 0%, transparent 70%)',
            }}
          />

          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Logo */}
          <motion.div
            className="relative z-10 flex items-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: ENTRY_EASE }}
          >
            <span
              className="font-bold tracking-tight"
              style={{ fontSize: 'clamp(28px, 7.5vw, 40px)', color: '#c9a227', textShadow: '0 0 32px rgba(201,162,39,0.55)' }}
            >
              Adalat
            </span>
            <span
              className="mx-3 md:mx-3.5 shrink-0"
              style={{
                display:      'inline-block',
                width:        '2px',
                height:       'clamp(22px, 4vw, 30px)',
                background:   'rgba(201,162,39,0.45)',
                borderRadius: '1px',
              }}
            />
            <span
              className="font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(28px, 7.5vw, 40px)', textShadow: '0 0 32px rgba(201,162,39,0.4)' }}
            >
              AI
            </span>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="relative z-10 w-44 md:w-52 h-[2px] rounded-full overflow-hidden mb-5"
            style={{ background: 'rgba(255,255,255,0.07)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.45 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#c9a227', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.5, ease: 'linear', delay: 0.5 }}
            />
          </motion.div>

          {/* Status text — crossfades between messages */}
          <motion.div
            className="relative z-10 h-5 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIdx}
                className="text-[11px] md:text-xs font-mono tracking-wider"
                style={{ color: 'rgba(255,255,255,0.32)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {MESSAGES[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
