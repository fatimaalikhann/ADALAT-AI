'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  useScroll,
  useInView,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import type { Variants } from 'framer-motion'
import CaseForm from './components/CaseForm'
import DemoModal from './components/DemoModal'
import ThemeToggle from './components/ThemeToggle'

// ─── Constants ────────────────────────────────────────────────────────────────

const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1]
const SLIDE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

// Local images — place legal1.jpg / legal2.jpg / legal3.jpg in /public
const HERO_IMAGES = ['/legal1.jpg', '/legal2.jpg', '/legal3.jpg']

// Pre-defined so server and client render identical HTML (no hydration mismatch)
const PARTICLES = [
  { id:  1, left:  7, dur: 6.2, delay: 0.0, size: 2   },
  { id:  2, left: 14, dur: 7.8, delay: 1.3, size: 1.5 },
  { id:  3, left: 22, dur: 5.5, delay: 0.7, size: 2   },
  { id:  4, left: 31, dur: 8.2, delay: 2.1, size: 1   },
  { id:  5, left: 38, dur: 6.8, delay: 0.3, size: 1.5 },
  { id:  6, left: 45, dur: 7.1, delay: 1.8, size: 2   },
  { id:  7, left: 53, dur: 5.8, delay: 0.9, size: 1   },
  { id:  8, left: 61, dur: 8.5, delay: 2.5, size: 2   },
  { id:  9, left: 68, dur: 6.4, delay: 1.1, size: 1.5 },
  { id: 10, left: 76, dur: 7.3, delay: 0.5, size: 2   },
  { id: 11, left: 83, dur: 5.9, delay: 1.6, size: 1   },
  { id: 12, left: 90, dur: 8.1, delay: 2.8, size: 1.5 },
  { id: 13, left: 18, dur: 6.7, delay: 3.2, size: 2   },
  { id: 14, left: 42, dur: 7.5, delay: 0.4, size: 1   },
  { id: 15, left: 57, dur: 5.6, delay: 1.9, size: 1.5 },
  { id: 16, left: 73, dur: 8.3, delay: 2.3, size: 2   },
  { id: 17, left:  3, dur: 6.1, delay: 3.7, size: 1   },
  { id: 18, left: 96, dur: 7.9, delay: 0.8, size: 1.5 },
]

// ─── Animation variants ────────────────────────────────────────────────────────

const heroContainer: Variants = {
  hidden:   {},
  visible:  { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const heroBadgeV: Variants = {
  hidden:  { opacity: 0, y: -14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
// Heading acts as a stagger container — words are the animated children
const headingContainerV: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
}
const wordV: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: SPRING } },
}
const heroItemV: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: 'easeOut' } },
}
const heroCTAV: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.6, ease: 'easeOut' } },
}
const sectionHeadV: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.65, ease: 'easeOut' } },
}
const cardStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}
// Cards flip in from edge-on → facing forward (3D flip)
const flipV: Variants = {
  hidden:  { rotateY: -90, opacity: 0 },
  visible: { rotateY:   0, opacity: 1, transition: { duration: 0.7, ease: SPRING } },
}

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, trigger: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let current = 0
    const frames = 90
    const step = target / frames
    const id = setInterval(() => {
      current += step
      if (current >= target) { setValue(target); clearInterval(id) }
      else setValue(Math.floor(current))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [trigger, target])
  return value
}

// ─── Scroll progress bar ──────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gold z-[100] origin-left pointer-events-none"
      style={{ scaleX }}
    />
  )
}

// ─── Cursor glow ──────────────────────────────────────────────────────────────

function CursorGlow() {
  const x = useMotionValue(-300)
  const y = useMotionValue(-300)
  const springX = useSpring(x, { stiffness: 380, damping: 30 })
  const springY = useSpring(y, { stiffness: 380, damping: 30 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 150)
      y.set(e.clientY - 150)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])

  return (
    <motion.div
      className="pointer-events-none fixed z-[9998] w-[300px] h-[300px] rounded-full"
      style={{
        x: springX,
        y: springY,
        background: 'radial-gradient(circle, rgba(201,162,39,0.16) 0%, transparent 65%)',
        filter: 'blur(36px)',
      }}
    />
  )
}

// ─── Hero slideshow — horizontal pan ─────────────────────────────────────────

function HeroSlideshow() {
  const [idx, setIdx] = useState(0)

  // Preload every image on mount so there is no loading flash on first transition
  useEffect(() => {
    HERO_IMAGES.forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % HERO_IMAGES.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    // aria-hidden: purely decorative; overflow-hidden clips Ken Burns scale bleed
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        {/*
          Inline initial/animate/exit (not variants) so AnimatePresence captures
          a self-contained element — changing idx cannot mutate the exiting copy.
          CSS backgroundImage instead of <img> eliminates broken-image placeholders
          (the "?" Safari shows even for alt="") when images haven't cached yet.
        */}
        <motion.div
          key={idx}
          className="absolute inset-0"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: '0%',   opacity: 0.42 }}
          exit={{    x: '-100%', opacity: 0 }}
          transition={{
            x:       { duration: 0.9, ease: SLIDE_EASE },
            opacity: { duration: 0.55, ease: 'easeInOut' },
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          {/* Ken Burns zoom — background-image never shows a broken-image glyph */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${HERO_IMAGES[idx]})` }}
            initial={{ scale: 1.04 }}
            animate={{ scale: 1.11 }}
            transition={{ duration: 6, ease: 'linear' }}
          />
          {/* Dark tint — pointer-events:none so it never intercepts mouse events */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'var(--hero-tint)' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Floating particles ───────────────────────────────────────────────────────

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLES.map(p => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left:       `${p.left}%`,
            bottom:     '0px',
            width:      `${p.size}px`,
            height:     `${p.size}px`,
            background: 'var(--particle)',
            opacity:    0,
            animation:  `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Animated SVG scales watermark ───────────────────────────────────────────

function ScalesBackground() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="scales-glow" style={{ opacity: 0.12 }}>
        <svg
          width="200"
          height="240"
          viewBox="0 0 90 110"
          fill="none"
          stroke="var(--scales-stroke)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Vertical pole */}
          <line x1="45" y1="8" x2="45" y2="92" />
          {/* Base */}
          <line x1="27" y1="92" x2="63" y2="92" />
          {/* Top pivot */}
          <circle cx="45" cy="8" r="2.2" fill="var(--scales-stroke)" stroke="none" />
          {/* Beam assembly — swings via .scales-beam CSS class */}
          <g className="scales-beam">
            <line x1="13" y1="22" x2="77" y2="22" />
            <circle cx="45" cy="22" r="1.8" fill="var(--scales-stroke)" stroke="none" />
            {/* Left chain + pan */}
            <line x1="15" y1="22" x2="15" y2="56" />
            <path d="M5 58 Q15 54 25 58 Q15 62 5 58Z" />
            {/* Right chain + pan */}
            <line x1="75" y1="22" x2="75" y2="56" />
            <path d="M65 58 Q75 54 85 58 Q75 62 65 58Z" />
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Floating hero badges ─────────────────────────────────────────────────────

const BADGES = [
  { label: '✓ Free',          pos: 'left-[5%]  top-[30%]',    bobDelay: '0s'   },
  { label: '🔒 Confidential', pos: 'right-[5%] top-[30%]',    bobDelay: '0.7s' },
  { label: 'اردو · English',  pos: 'right-[8%] bottom-[26%]', bobDelay: '1.4s' },
]

function FloatingBadges() {
  return (
    <>
      {BADGES.map((b, i) => (
        <motion.div
          key={b.label}
          className={`absolute hidden lg:block ${b.pos}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: SPRING, delay: 1.1 + i * 0.18 }}
        >
          {/* CSS bob animation starts after Framer entry completes */}
          <div className="badge-float" style={{ animationDelay: b.bobDelay }}>
            <span className="flex items-center gap-1.5 bg-[#0a1f44]/[0.07] dark:bg-white/[0.07] backdrop-blur-sm border border-[#0a1f44]/18 dark:border-white/[0.14] text-[#0a1f44]/80 dark:text-white/65 text-xs font-medium px-3.5 py-2 rounded-full shadow-[0_4px_24px_rgba(10,31,68,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
              {b.label}
            </span>
          </div>
        </motion.div>
      ))}
    </>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onOpenDemo }: { onOpenDemo: () => void }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => scrollY.on('change', v => setScrolled(v > 60)), [scrollY])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-500"
        style={{
          background:   scrolled ? 'var(--nav-scrolled)'       : 'var(--nav-open)',
          borderColor:  scrolled ? 'var(--nav-border-scrolled)' : 'var(--nav-border-open)',
          boxShadow:    scrolled ? '0 1px 0 rgba(0,0,0,0.04)'  : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 md:gap-3 cursor-pointer"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-start leading-none gap-[3px]">
              <motion.div
                className="flex items-center"
                whileHover={{ filter: 'drop-shadow(0 0 18px rgba(201,162,39,0.6))' }}
                transition={{ duration: 0.22 }}
              >
                <span
                  className="font-bold tracking-tight"
                  style={{ fontSize: '22px', color: '#c9a227', textShadow: '0 0 20px rgba(201,162,39,0.35)' }}
                >
                  Adalat
                </span>
                <span
                  className="mx-2.5 shrink-0"
                  style={{ display: 'inline-block', width: '1.5px', height: '18px', background: 'rgba(201,162,39,0.4)', borderRadius: '1px' }}
                />
                <span
                  className="font-bold tracking-tight text-white"
                  style={{ fontSize: '22px', textShadow: '0 0 20px rgba(201,162,39,0.35)' }}
                >
                  AI
                </span>
              </motion.div>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#0a1f44]/55 dark:text-white/35 select-none">
                by Fatima Ali Khan
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center bg-gold/[0.09] text-gold/75 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-gold/20">
              6 AI Agents · 24/7 Active
            </span>
          </motion.div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/about"
              className="text-[#0a1f44]/50 hover:text-[#0a1f44] dark:text-white/45 dark:hover:text-white text-sm font-medium transition-colors"
            >
              About
            </Link>
            <ThemeToggle />
            <motion.button
              onClick={onOpenDemo}
              className="border border-gold/40 text-gold hover:bg-gold/[0.07] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Try Live Demo
            </motion.button>
            <motion.a
              href="#submit"
              className="bg-gold hover:bg-yellow-500 text-[#080810] font-semibold text-sm px-5 py-2 rounded-lg shadow-[0_0_20px_rgba(201,162,39,0.22)] transition-colors"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(201,162,39,0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Case
            </motion.a>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
          <motion.button
            className="relative z-50 flex flex-col justify-center gap-[5px] p-2 -mr-1"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <motion.span
              className="block w-5 h-[1.5px] bg-[#0a1f44]/70 dark:bg-white/80 rounded-full origin-center"
              animate={menuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="block w-5 h-[1.5px] bg-[#0a1f44]/70 dark:bg-white/80 rounded-full"
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.22 }}
            />
            <motion.span
              className="block w-5 h-[1.5px] bg-[#0a1f44]/70 dark:bg-white/80 rounded-full origin-center"
              animate={menuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.22 }}
            />
          </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[45] md:hidden flex flex-col items-center justify-center gap-6"
            style={{ background: 'var(--bg)', backdropFilter: 'blur(20px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              href="/about"
              className="text-[#0a1f44]/60 dark:text-white/60 hover:text-[#0a1f44] dark:hover:text-white text-2xl font-semibold tracking-tight transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06, duration: 0.3 }}
                style={{ display: 'inline-block' }}
              >
                About
              </motion.span>
            </Link>
            <motion.a
              href="#how"
              className="text-[#0a1f44]/60 dark:text-white/60 hover:text-[#0a1f44] dark:hover:text-white text-2xl font-semibold tracking-tight transition-colors"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.11, duration: 0.3 }}
            >
              How It Works
            </motion.a>
            <motion.button
              className="border border-gold/40 text-gold text-xl font-semibold px-9 py-3.5 rounded-xl transition-colors"
              onClick={() => { setMenuOpen(false); onOpenDemo() }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              Try Live Demo
            </motion.button>
            <motion.a
              href="#submit"
              className="bg-gold text-[#080810] font-bold text-lg px-10 py-4 rounded-xl shadow-[0_0_32px_rgba(201,162,39,0.3)]"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.21, duration: 0.3 }}
            >
              Submit Your Case →
            </motion.a>
            <motion.p
              className="text-[#0a1f44]/20 dark:text-white/20 text-xs tracking-widest uppercase mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.30 }}
            >
              Free · Confidential · Urdu &amp; English
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 pb-24 md:pt-40 md:pb-32 px-4 overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Layer 1 — Horizontal sliding background images */}
      <HeroSlideshow />

      {/* Layer 2 — Rising particles */}
      <HeroParticles />

      {/* Layer 3 — Scales of justice watermark */}
      <ScalesBackground />

      {/* Layer 4 — Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Layer 5 — Ambient purple glow orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[700px] h-[520px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(100,60,255,0.10) 0%, rgba(60,40,200,0.04) 45%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-alt), transparent)' }} />

      {/* Floating badges — desktop only, enter with Framer then bob via CSS */}
      <FloatingBadges />

      {/* Hero text — z-10 sits above all background layers */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Pill badge */}
        <motion.span
          variants={heroBadgeV}
          className="inline-flex items-center gap-2.5 bg-[#0a1f44]/[0.07] dark:bg-white/[0.04] text-[#0a1f44] dark:text-white/55 text-xs font-medium uppercase tracking-[0.18em] px-4 py-2 rounded-full border border-[#0a1f44]/20 dark:border-white/[0.08] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          6 Specialized AI Agents · Running 24/7 · 100% Free
        </motion.span>

        {/* Heading — word-by-word stagger reveal */}
        <motion.h1
          variants={headingContainerV}
          className="text-4xl md:text-5xl lg:text-7xl font-bold text-[#0a1f44] dark:text-white leading-[1.06] tracking-tight mb-5"
        >
          {['Legal', 'Aid', 'for', 'Every'].map(word => (
            <motion.span key={word} variants={wordV} className="inline-block mr-[0.22em]">
              {word}
            </motion.span>
          ))}
          <br />
          <span className="text-gold">
            {['Pakistani', 'Citizen'].map(word => (
              <motion.span key={word} variants={wordV} className="inline-block mr-[0.22em]">
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Urdu subtitle */}
        <motion.p
          variants={heroItemV}
          className="urdu text-[#0a1f44]/80 dark:text-white/55 text-xl md:text-2xl mb-5 leading-loose"
        >
          ہر پاکستانی شہری کے لیے مفت قانونی مدد
        </motion.p>

        {/* English description */}
        <motion.p
          variants={heroItemV}
          className="text-[#0a1f44]/70 dark:text-white/45 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Powered by 6 autonomous AI agents running 24/7 — AdalatAI classifies your legal problem,
          explains your rights under Pakistani law, drafts court-ready documents, assesses lawyer needs,
          tracks your deadlines, and generates policy insights. All in Urdu and English. All free.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={heroCTAV}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="#submit"
            className="bg-gold hover:bg-yellow-500 text-[#080810] font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-[0_0_32px_rgba(201,162,39,0.28)]"
            whileHover={{ scale: 1.03, boxShadow: '0 0 44px rgba(201,162,39,0.44)' }}
            whileTap={{ scale: 0.97 }}
          >
            Submit Your Case →
          </motion.a>
          <motion.a
            href="#how"
            className="bg-[#0a1f44]/[0.05] dark:bg-white/[0.04] border border-[#0a1f44]/10 dark:border-white/[0.1] text-[#0a1f44] dark:text-white font-semibold px-10 py-4 rounded-xl text-base backdrop-blur-sm hover:bg-[#0a1f44]/[0.09] dark:hover:bg-white/[0.07] transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            How It Works
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: 6,  display: null,    suffix: '',  label: 'Specialized AI Agents',     labelUr: 'خودکار ایجنٹس'      },
  { value: 0,  display: '24/7',  suffix: '',  label: 'Always Running',             labelUr: 'ہمیشہ فعال'         },
  { value: 12, display: null,    suffix: '',  label: 'Legal Categories Covered',   labelUr: 'قانونی زمرے'        },
  { value: 0,  display: '180M+', suffix: '',  label: 'Pakistanis Who Can Benefit', labelUr: 'مستفید پاکستانی'    },
]

function StatCard({ stat, index }: { stat: typeof STATS[number]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const count  = useCountUp(stat.value, inView && !stat.display)
  const displayValue = stat.display ?? (count.toLocaleString() + stat.suffix)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.1 }}
      className="card-glow bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6 md:p-8 text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-gold mb-1">
        {displayValue}
      </div>
      <div className="text-sm text-[#0a1f44]/60 dark:text-white/50 mt-1">{stat.label}</div>
      <div className="urdu text-xs text-[#0a1f44]/35 dark:text-white/25 mt-1">{stat.labelUr}</div>
    </motion.div>
  )
}

function StatsBar() {
  return (
    <section className="py-16 px-4" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>
    </section>
  )
}

// ─── Journey steps ────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: 1,
    label: 'AGENT 01 · CLASSIFIER',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
    title:   'Understand Your Problem',
    titleUr: 'مسئلہ کی درجہ بندی',
    desc:    'A fine-tuned classification agent reads your input in Urdu or English, detects the legal domain across 12 categories, assigns urgency levels, and generates a bilingual case summary — all in under 2 seconds.',
  },
  {
    num: 2,
    label: 'AGENT 02 · RIGHTS EXPLAINER',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title:   'Know Your Rights',
    titleUr: 'اپنے حقوق جانیں',
    desc:    'Grounded in Pakistani law — Muslim Family Laws Ordinance 1961, Industrial Relations Act 2012, PPC, CrPC, and Constitution of Pakistan 1973 — this agent explains your exact legal rights in plain, simple Urdu.',
  },
  {
    num: 3,
    label: 'AGENT 03 · DOCUMENT DRAFTER',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title:   'Get Your Document',
    titleUr: 'دستاویز حاصل کریں',
    desc:    'Generates a court-ready legal document — notice, FIR draft, labour application, or khula petition — as a downloadable bilingual PDF with proper Urdu RTL rendering using NotoNastaliq font.',
  },
  {
    num: 4,
    label: 'AGENT 04 · LAWYER ASSESSOR',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title:   'Find Legal Help',
    titleUr: 'قانونی مدد تلاش کریں',
    desc:    'Holistically evaluates case complexity and routes to the right resource — self-resolution, legal aid authority, pro bono clinic, or private counsel — with province-specific organization recommendations.',
  },
  {
    num: 5,
    label: 'AGENT 05 · DEADLINE TRACKER',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8"  y1="2" x2="8"  y2="6" />
        <line x1="3"  y1="10" x2="21" y2="10" />
      </svg>
    ),
    title:   'Track Your Case',
    titleUr: 'اپنا کیس ٹریک کریں',
    desc:    'Calculates every legally relevant deadline — filing windows, limitation periods, notice requirements — specific to your case category and province, sorted by urgency with WhatsApp reminders.',
  },
  {
    num: 6,
    label: 'AGENT 06 · ANALYTICS ENGINE',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4"  />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
    title:   'Drive Policy Change',
    titleUr: 'پالیسی تبدیلی لائیں',
    desc:    'Anonymously aggregates case data — zero personal information — to generate district-level legal violation heatmaps and trend reports for NGOs, bar councils, and policymakers across Pakistan.',
  },
]

function JourneySteps() {
  return (
    <section id="how" className="py-24 px-4" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          variants={sectionHeadV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="inline-flex items-center gap-2 bg-gold/[0.08] text-gold text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border border-gold/20 mb-5">
            The Multi-Agent Pipeline
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">6 AI Agents. One Mission. Justice for All.</h2>
          <p className="urdu text-[#0a1f44]/45 dark:text-white/35 text-lg">چھ خودکار ذہین ایجنٹس — انصاف کے لیے</p>
        </motion.div>

        {/* Cards — 3D flip entrance, hover lift */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={cardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {STEPS.map(step => (
            <motion.div
              key={step.num}
              variants={flipV}
              style={{ transformPerspective: 1000 }}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
              className="card-glow group bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#0a1f44]/[0.05] dark:bg-white/[0.05] text-[#0a1f44]/60 dark:text-white/70 rounded-xl p-3 shrink-0 group-hover:bg-gold/[0.1] group-hover:text-gold transition-colors duration-300">
                  {step.icon}
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="text-[10px] text-gold font-bold font-mono tracking-widest mb-2">
                    {step.label}
                  </div>
                  <h3 className="font-semibold text-[#0a1f44] dark:text-white text-sm leading-snug">{step.title}</h3>
                  <p className="urdu text-[#0a1f44]/45 dark:text-white/35 text-xs mt-1">{step.titleUr}</p>
                </div>
              </div>
              <p className="text-[#0a1f44]/55 dark:text-white/45 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Is this legal advice?',
    a: 'No. AdalatAI provides legal information and guidance based on Pakistani law — not a substitute for a licensed lawyer. For serious matters, we connect you to pro bono legal aid.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Your case details are encrypted with AES-256 and never shared. Our analytics agent only sees anonymized, aggregated data — no names, no CNIC, no personal information ever leaves your case file.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Submit your case and get guidance immediately — no signup, no login required.',
  },
  {
    q: 'Which provinces does AdalatAI cover?',
    a: 'Punjab, Sindh, Khyber Pakhtunkhwa, and Balochistan — with province-specific legal aid organizations and statute references.',
  },
  {
    q: 'What languages does AdalatAI support?',
    a: 'Both Urdu and English. You can describe your problem in either language, and choose your preferred language for documents and explanations.',
  },
  {
    q: 'Is AdalatAI really free?',
    a: 'Yes, completely free — for every Pakistani citizen, with no hidden costs or premium tiers.',
  },
]

function FAQItem({ item, index }: { item: typeof FAQS[number]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className="border-b border-[#0a1f44]/10 dark:border-white/[0.07] last:border-0"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.07 }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className={`text-sm md:text-base font-semibold transition-colors duration-200 ${open ? 'text-gold' : 'text-[#0a1f44] dark:text-white'}`}>
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border transition-colors duration-200 ${
            open
              ? 'border-gold/50 text-gold bg-gold/[0.08]'
              : 'border-[#0a1f44]/20 dark:border-white/20 text-[#0a1f44]/50 dark:text-white/40 group-hover:border-gold/40 group-hover:text-gold'
          }`}
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p className="text-[#0a1f44]/60 dark:text-white/50 text-sm leading-relaxed pb-5 pr-8">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  return (
    <section className="py-24 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          variants={sectionHeadV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <span className="inline-flex items-center gap-2 bg-gold/[0.08] text-gold text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border border-gold/20 mb-5">
            Questions
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white">
            Frequently Asked Questions
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="bg-white dark:bg-[#13131f] rounded-2xl border border-[#0a1f44]/10 dark:border-white/[0.08] px-6 md:px-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        >
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="border-t py-12 px-4"
      style={{ background: 'var(--bg-footer)', borderColor: 'var(--nav-border-open)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: '16px', color: '#c9a227', textShadow: '0 0 14px rgba(201,162,39,0.3)' }}
          >
            Adalat
          </span>
          <span
            className="mx-2 shrink-0"
            style={{ display: 'inline-block', width: '1.5px', height: '14px', background: 'rgba(201,162,39,0.38)', borderRadius: '1px' }}
          />
          <span className="font-bold tracking-tight text-[#0a1f44] dark:text-white" style={{ fontSize: '16px' }}>
            AI
          </span>
        </div>
        <p className="text-[#0a1f44]/35 dark:text-white/25 text-xs text-center">
          This platform does not constitute legal advice. For urgent matters, consult a qualified lawyer.
        </p>
        <p className="urdu text-[#0a1f44]/30 dark:text-white/20 text-xs">یہ قانونی مشورہ نہیں ہے</p>
      </div>
    </motion.footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      {/* Fixed full-page overlays */}
      <ScrollProgressBar />
      <CursorGlow />

      {/* Page shell */}
      <div style={{ background: 'var(--bg)' }}>
        <Navbar onOpenDemo={() => setDemoOpen(true)} />
        <main>
          <Hero />
          <StatsBar />
          <JourneySteps />
          <FAQSection />
          <CaseForm />
        </main>
        <Footer />
      </div>

      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  )
}
