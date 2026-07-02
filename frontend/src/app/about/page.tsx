'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import ThemeToggle from '../components/ThemeToggle'

// ─── Constants ────────────────────────────────────────────────────────────────

const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROBLEM_STATS = [
  {
    value: '180M+',
    label: 'Pakistanis with no access to formal legal aid or affordable counsel',
    color: '#c9a227',
  },
  {
    value: '70%',
    label: 'Civil cases dismissed due to missing documents or procedural errors',
    color: '#f472b6',
  },
  {
    value: '60M+',
    label: 'Informal workers unaware of their rights under Pakistani labour law',
    color: '#60a5fa',
  },
]

const TECH = [
  { abbr: 'Py',  name: 'Python',         color: '#4b8bbe', desc: 'Core language for all 6 AI agents'           },
  { abbr: 'FA',  name: 'FastAPI',         color: '#059669', desc: 'Async API — 50ms average response'           },
  { abbr: 'PG',  name: 'PostgreSQL',      color: '#336791', desc: 'Case storage, audit logs, analytics'         },
  { abbr: 'N↑',  name: 'Next.js 14',      color: '#888888', desc: 'App Router, SSR, edge-ready frontend'        },
  { abbr: '✦',   name: 'Claude API',      color: '#c9a227', desc: 'Anthropic SDK — brain of every agent'        },
  { abbr: '≋',   name: 'Framer Motion',   color: '#bb4be8', desc: 'Cinematic 60fps animations'                  },
  { abbr: 'TW',  name: 'Tailwind CSS',    color: '#38bdf8', desc: 'Utility-first dark-theme styling'            },
  { abbr: '⬡',   name: 'Docker',          color: '#2496ed', desc: 'Containerised, reproducible builds'          },
  { abbr: 'R',   name: 'Railway',         color: '#9333ea', desc: 'Cloud hosting for the FastAPI backend'       },
  { abbr: '▲',   name: 'Vercel',          color: '#888888', desc: 'Edge deployment for the Next.js frontend'   },
]

const PIPELINE = [
  { label: 'User Input',        sub: 'Urdu / English', bg: 'rgba(10,31,68,0.06)',    bgDark: 'rgba(255,255,255,0.05)', border: 'rgba(10,31,68,0.18)',    borderDark: 'rgba(255,255,255,0.14)', text: 'rgba(10,31,68,0.65)',    textDark: 'rgba(255,255,255,0.6)'  },
  { label: 'Classifier',        sub: 'Agent 01',       bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.45)',  text: '#818cf8'                 },
  { label: 'Rights Explainer',  sub: 'Agent 02',       bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.45)',  text: '#60a5fa'                 },
  { label: 'Doc Drafter',       sub: 'Agent 03',       bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.45)',  text: '#a78bfa'                 },
  { label: 'Lawyer Assessor',   sub: 'Agent 04',       bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.45)',  text: '#fb923c'                 },
  { label: 'Deadline Tracker',  sub: 'Agent 05',       bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.45)',   text: '#4ade80'                 },
  { label: 'Analytics Engine',  sub: 'Agent 06',       bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.45)',  text: '#f472b6'                 },
  { label: 'Case Report',       sub: 'PDF + Rights',   bg: 'rgba(201,162,39,0.12)', border: 'rgba(201,162,39,0.45)',  text: '#c9a227'                 },
]

const IMPACT = [
  {
    icon: '🤝',
    title: 'NGO Partnership',
    badge: 'Scalable',
    desc: 'Legal aid organisations can embed AdalatAI to serve clients at scale — replacing 4-hour consultations with 60-second AI assessments.',
  },
  {
    icon: '🏛',
    title: 'Government Adoption',
    badge: 'Policy-Ready',
    desc: "Pakistan's NADRA and Naya Pakistan Housing systems could integrate AI-powered legal routing for social welfare claimants.",
  },
  {
    icon: '⚡',
    title: 'Open Source Community',
    badge: 'Extensible',
    desc: 'Fully open-source — lawyers, developers, and civil society can extend AdalatAI with new legal categories and provincial rules.',
  },
]

// ─── Shared components ────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 bg-gold/[0.08] text-gold text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border border-gold/20 mb-5">
      {children}
    </span>
  )
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: SPRING, delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function AboutNav() {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: 'var(--nav-scrolled)', borderColor: 'var(--nav-border-scrolled)' }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <span
            className="font-bold tracking-tight transition-all"
            style={{ fontSize: '20px', color: '#c9a227', textShadow: '0 0 16px rgba(201,162,39,0.3)' }}
          >
            Adalat
          </span>
          <span
            className="mx-2.5 shrink-0"
            style={{ display: 'inline-block', width: '1.5px', height: '16px', background: 'rgba(201,162,39,0.4)', borderRadius: '1px' }}
          />
          <span className="font-bold tracking-tight text-[#0a1f44] dark:text-white" style={{ fontSize: '20px' }}>AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:block text-[#0a1f44]/45 hover:text-[#0a1f44] dark:text-white/40 dark:hover:text-white/70 text-sm font-medium transition-colors">
            Home
          </Link>
          <ThemeToggle />
          <Link
            href="/#submit"
            className="bg-gold hover:bg-yellow-500 text-[#080810] font-semibold text-sm px-4 py-2 rounded-lg shadow-[0_0_18px_rgba(201,162,39,0.2)] transition-colors"
          >
            Submit Case
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 px-4 overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }}
      />
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(100,60,255,0.09) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-alt), transparent)' }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: SPRING }}>
          <SectionLabel>
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Open Source · Social Impact · Portfolio Project
          </SectionLabel>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a1f44] dark:text-white leading-tight tracking-tight mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: SPRING, delay: 0.1 }}
        >
          Built to Give Every Pakistani
          <br />
          <span style={{ color: '#c9a227' }}>Access to Justice</span>
        </motion.h1>

        <motion.p
          className="text-[#0a1f44]/70 dark:text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: SPRING, delay: 0.18 }}
        >
          AdalatAI is an open-source multi-agent AI legal aid system — built by a Cognitive AI Engineer,
          for 180 million Pakistanis who cannot afford a lawyer.
        </motion.p>
      </div>
    </section>
  )
}

// ─── Mission ──────────────────────────────────────────────────────────────────

function MissionSection() {
  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">The Problem We&apos;re Solving</h2>
          <p className="urdu text-[#0a1f44]/40 dark:text-white/30 text-lg">جس مسئلے کو ہم حل کر رہے ہیں</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {PROBLEM_STATS.map((s, i) => (
            <Reveal key={s.value} delay={i * 0.1}>
              <div className="card-glow bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6 md:p-8 text-center">
                <div className="text-3xl md:text-4xl font-bold mb-3" style={{ color: s.color }}>
                  {s.value}
                </div>
                <p className="text-[#0a1f44]/55 dark:text-white/45 text-sm leading-relaxed">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.07] rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
            <p className="text-[#0a1f44]/65 dark:text-white/55 text-sm md:text-base leading-relaxed text-center">
              Pakistan&apos;s legal system remains inaccessible to the vast majority. Court fees, lawyer costs,
              documentation requirements, and language barriers lock out those who need help most.
              AdalatAI bridges this gap with a 6-agent AI pipeline that provides instant, free, bilingual
              legal guidance — what previously required an expensive lawyer, now takes 60 seconds.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Tech stack ───────────────────────────────────────────────────────────────

function TechStackSection() {
  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <SectionLabel>Tech Stack</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">The Technology Behind AdalatAI</h2>
          <p className="text-[#0a1f44]/40 dark:text-white/30 text-sm">A production-grade stack — not just a tutorial project</p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {TECH.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.04}>
              <div className="group bg-white dark:bg-[#13131f] border border-[#0a1f44]/09 dark:border-white/[0.07] hover:border-gold/40 dark:hover:border-gold/30 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-[0_0_24px_rgba(201,162,39,0.07)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono mx-auto mb-3"
                  style={{
                    background: `${t.color}18`,
                    color:      t.color,
                    border:     `1px solid ${t.color}28`,
                  }}
                >
                  {t.abbr}
                </div>
                <div className="font-semibold text-[#0a1f44] dark:text-white text-xs mb-1.5">{t.name}</div>
                <div className="text-[#0a1f44]/38 dark:text-white/28 text-[10px] leading-relaxed">{t.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function ArchitectureSection() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme !== 'light'

  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <SectionLabel>Architecture</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">6-Agent Multi-Agent Architecture</h2>
          <p className="text-[#0a1f44]/40 dark:text-white/30 text-sm">Each agent handles one specialised task — orchestrated by a FastAPI backend</p>
        </Reveal>

        {/* Mobile: vertical stack with ↓ arrows */}
        <Reveal>
          <div className="md:hidden flex flex-col items-center">
            {PIPELINE.map((node, i) => {
              const bg     = (!isDark && node.bgDark)     ? node.bg     : (node.bgDark     ?? node.bg)
              const border = (!isDark && node.borderDark) ? node.border : (node.borderDark ?? node.border)
              const text   = (!isDark && node.textDark)   ? node.text   : (node.textDark   ?? node.text)
              const connector = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,31,68,0.12)'
              const arrow     = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(10,31,68,0.25)'
              return (
                <div key={node.label} className="flex flex-col items-center w-full max-w-[200px]">
                  {i > 0 && (
                    <div className="flex flex-col items-center py-1">
                      <div className="w-px h-4" style={{ background: connector }} />
                      <span className="text-[10px] font-mono leading-none" style={{ color: arrow }}>↓</span>
                    </div>
                  )}
                  <motion.div
                    className="rounded-xl border text-center w-full"
                    style={{
                      background:  bg,
                      borderColor: border,
                      padding:     '10px 14px',
                    }}
                    whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
                  >
                    <div className="text-[8px] font-bold font-mono tracking-widest mb-1 opacity-70" style={{ color: text }}>
                      {node.sub}
                    </div>
                    <div className="text-[11px] font-semibold leading-tight" style={{ color: text }}>
                      {node.label}
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </Reveal>

        {/* Desktop: horizontal scroll */}
        <Reveal>
          <div className="hidden md:block overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex items-stretch gap-0 min-w-max mx-auto" style={{ width: 'fit-content' }}>
              {PIPELINE.map((node, i) => {
                const bg     = (!isDark && node.bgDark)     ? node.bg     : (node.bgDark     ?? node.bg)
                const border = (!isDark && node.borderDark) ? node.border : (node.borderDark ?? node.border)
                const text   = (!isDark && node.textDark)   ? node.text   : (node.textDark   ?? node.text)
                return (
                  <div key={node.label} className="flex items-center">
                    {i > 0 && (
                      <div className="flex flex-col items-center px-1.5">
                        <div className="h-px w-8" style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(10,31,68,0.12)' }} />
                        <span className="text-[#0a1f44]/25 dark:text-white/20 text-[10px] font-mono leading-none -mt-0.5">→</span>
                      </div>
                    )}
                    <motion.div
                      className="rounded-xl border text-center shrink-0"
                      style={{
                        background:  bg,
                        borderColor: border,
                        minWidth:    '88px',
                        padding:     '10px 10px',
                      }}
                      whileHover={{ scale: 1.04, transition: { duration: 0.15 } }}
                    >
                      <div className="text-[8px] font-bold font-mono tracking-widest mb-1 opacity-70" style={{ color: text }}>
                        {node.sub}
                      </div>
                      <div className="text-[11px] font-semibold leading-tight" style={{ color: text }}>
                        {node.label}
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-center text-[#0a1f44]/30 dark:text-white/20 text-[10px] font-mono mt-4">
            All agents communicate via FastAPI orchestrator · Average full-pipeline time: &lt; 60 seconds
          </p>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Builder ──────────────────────────────────────────────────────────────────

function BuilderSection() {
  return (
    <section className="py-24 px-4" style={{ background: 'var(--bg)' }}>
      {/* Subtle gold radial */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(201,162,39,0.06) 0%, transparent 65%)' }}
      />
      <div className="relative max-w-2xl mx-auto text-center">
        <Reveal>
          <span
            className="text-[9px] font-bold font-mono uppercase tracking-[0.3em] block mb-5"
            style={{ color: 'rgba(255,255,255,0.22)' }}
          >
            Designed and Built By
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: '#c9a227', textShadow: '0 0 48px rgba(201,162,39,0.3)' }}
          >
            Fatima Ali Khan
          </h2>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="text-[#0a1f44]/75 dark:text-white/65 font-semibold text-base mb-1">Cognitive AI Engineer</p>
          <p className="text-[#0a1f44]/45 dark:text-white/35 text-sm">Agentic Systems Architect · Cognitive Computing Specialist</p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-7 mb-8 bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.07] rounded-2xl p-6">
            <p className="text-[#0a1f44]/60 dark:text-white/50 text-sm leading-relaxed">
              Built AdalatAI as a portfolio project to demonstrate real-world multi-agent AI systems for social impact.
              The project combines expertise in cognitive AI architecture, autonomous agent design, and
              production-grade full-stack engineering — from Anthropic SDK orchestration to bilingual Urdu PDF generation.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href="https://github.com/fatimaalikhann"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#0a1f44]/12 dark:border-white/[0.1] hover:border-[#0a1f44]/25 dark:hover:border-white/25 text-[#0a1f44]/50 dark:text-white/45 hover:text-[#0a1f44]/80 dark:hover:text-white/75 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/fatimaalikhann"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-[#0a1f44]/12 dark:border-white/[0.1] hover:border-[#0a1f44]/25 dark:hover:border-white/25 text-[#0a1f44]/50 dark:text-white/45 hover:text-[#0a1f44]/80 dark:hover:text-white/75 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Impact ───────────────────────────────────────────────────────────────────

function ImpactSection() {
  return (
    <section className="py-20 px-4" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <SectionLabel>Potential Impact</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">Where AdalatAI Can Go</h2>
          <p className="text-[#0a1f44]/40 dark:text-white/30 text-sm">From portfolio prototype to nationwide legal infrastructure</p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {IMPACT.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <div className="card-glow bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{card.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gold/60 bg-gold/[0.07] border border-gold/15 px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-[#0a1f44] dark:text-white font-bold text-base mb-2">{card.title}</h3>
                <p className="text-[#0a1f44]/52 dark:text-white/42 text-sm leading-relaxed">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function AboutFooter() {
  return (
    <footer className="border-t py-10 px-4" style={{ background: 'var(--bg-footer)', borderColor: 'var(--nav-border-open)' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <Link href="/" className="flex items-center">
          <span className="font-bold tracking-tight" style={{ fontSize: '16px', color: '#c9a227' }}>Adalat</span>
          <span className="mx-2 shrink-0" style={{ display: 'inline-block', width: '1.5px', height: '14px', background: 'rgba(201,162,39,0.38)', borderRadius: '1px' }} />
          <span className="font-bold tracking-tight text-[#0a1f44] dark:text-white" style={{ fontSize: '16px' }}>AI</span>
        </Link>
        <p className="text-[#0a1f44]/30 dark:text-white/20 text-xs text-center font-mono">
          Open-source legal aid for Pakistan · Anthropic Claude API · 6-Agent Architecture
        </p>
        <Link href="/" className="text-[#0a1f44]/40 hover:text-[#0a1f44]/70 dark:text-white/30 dark:hover:text-white/60 text-sm font-medium transition-colors">
          ← Back to Home
        </Link>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AboutNav />
      <main>
        <HeroSection />
        <MissionSection />
        <TechStackSection />
        <ArchitectureSection />
        <BuilderSection />
        <ImpactSection />
      </main>
      <AboutFooter />
    </div>
  )
}
