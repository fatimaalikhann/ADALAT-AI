'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────

const SAMPLE = 'Mera landlord mujhe bina notice ke ghar se nikal raha hai — Karachi, Sindh'

interface AgentDef {
  id: number
  label: string
  output: string
  activateAt: number
  hasDownload?: boolean
}

const AGENTS: AgentDef[] = [
  {
    id: 1,
    label: 'AGENT 01 · CLASSIFIER',
    output: 'Category: Property Law · Urgency: HIGH · Language: Urdu detected',
    activateAt: 1500,
  },
  {
    id: 2,
    label: 'AGENT 02 · RIGHTS EXPLAINER',
    output: 'Transfer of Property Act 1882 — 30 days written notice required',
    activateAt: 3000,
  },
  {
    id: 3,
    label: 'AGENT 03 · DOCUMENT DRAFTER',
    output: 'Generating legal notice PDF… ✓ Document ready (1 page)',
    activateAt: 4500,
    hasDownload: true,
  },
  {
    id: 4,
    label: 'AGENT 04 · LAWYER ASSESSOR',
    output: 'Complexity: MEDIUM · Referral: Legal Aid Society Karachi',
    activateAt: 6000,
  },
  {
    id: 5,
    label: 'AGENT 05 · DEADLINE TRACKER',
    output: 'Send legal notice: 7 days · File suit in court: 30 days',
    activateAt: 7500,
  },
  {
    id: 6,
    label: 'AGENT 06 · ANALYTICS ENGINE',
    output: 'Case logged · KHI property disputes +1 · Zero PII stored',
    activateAt: 9000,
  },
]

const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1]

// ─── Typing hook ──────────────────────────────────────────────────────────────

function useTyping(text: string, active: boolean, complete: boolean) {
  const [output, setOutput]     = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    let iid: ReturnType<typeof setInterval>

    if (!active) {
      setScanning(false)
      setOutput(complete ? text : '')
      return
    }

    setOutput('')
    setScanning(true)

    tid = setTimeout(() => {
      setScanning(false)
      let i = 0
      iid = setInterval(() => {
        i++
        setOutput(text.slice(0, i))
        if (i >= text.length) clearInterval(iid)
      }, 20)
    }, 400)

    return () => { clearTimeout(tid); clearInterval(iid) }
  }, [active, complete, text])

  return { output, scanning }
}

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  isActive,
  isComplete,
  index,
}: {
  agent: AgentDef
  isActive: boolean
  isComplete: boolean
  index: number
}) {
  const { output, scanning } = useTyping(agent.output, isActive, isComplete)
  const isCursor = isActive && !scanning && output.length < agent.output.length

  return (
    <motion.div
      className="rounded-xl border p-3.5 md:p-4"
      style={{
        background:  '#07070e',
        borderColor: isActive
          ? 'rgba(201,162,39,0.65)'
          : isComplete
            ? 'rgba(201,162,39,0.2)'
            : 'rgba(255,255,255,0.06)',
        boxShadow: isActive
          ? '0 0 28px rgba(201,162,39,0.14), inset 0 0 20px rgba(201,162,39,0.03)'
          : isComplete
            ? '0 0 12px rgba(201,162,39,0.06)'
            : 'none',
        transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className="text-[9px] font-bold font-mono tracking-[0.18em] transition-colors duration-300"
          style={{ color: isActive || isComplete ? '#c9a227' : 'rgba(255,255,255,0.2)' }}
        >
          {agent.label}
        </span>
        {isComplete ? (
          <span className="text-green-400 text-[11px] font-bold leading-none">✓</span>
        ) : isActive ? (
          <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c9a227' }} />
        ) : (
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
        )}
      </div>

      {/* Output */}
      <div className="min-h-[1.5rem] font-mono text-[11px] leading-relaxed">
        {!isActive && !isComplete && (
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>——</span>
        )}
        {(isActive || isComplete) && (
          scanning ? (
            <span className="animate-pulse" style={{ color: 'rgba(255,255,255,0.25)' }}>Analyzing…</span>
          ) : (
            <>
              <span className="mr-1" style={{ color: 'rgba(201,162,39,0.4)' }}>›</span>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{output}</span>
              {isCursor && (
                <span className="animate-pulse font-bold" style={{ color: '#c9a227' }}>▌</span>
              )}
            </>
          )
        )}
      </div>

      {/* Fake PDF download — Agent 03 only */}
      {agent.hasDownload && isComplete && (
        <motion.button
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[10px] font-mono font-semibold py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'rgba(201,162,39,0.28)', color: 'rgba(201,162,39,0.65)' }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => {}}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
          </svg>
          Download Legal Notice PDF →
        </motion.button>
      )}
    </motion.div>
  )
}

// ─── Demo modal ───────────────────────────────────────────────────────────────

export default function DemoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [phase, setPhase]           = useState<'idle' | 'running' | 'complete'>('idle')
  const [activeStep, setActiveStep] = useState(-1)
  const tids = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleRun() {
    tids.current.forEach(clearTimeout)
    tids.current = []
    setPhase('running')
    setActiveStep(-1)

    AGENTS.forEach((agent, i) => {
      tids.current.push(setTimeout(() => setActiveStep(i), agent.activateAt))
    })
    // complete 1.6 s after last agent activates
    tids.current.push(setTimeout(() => {
      setPhase('complete')
      setActiveStep(AGENTS.length)
    }, 10600))
  }

  function handleClose() {
    tids.current.forEach(clearTimeout)
    tids.current = []
    onClose()
  }

  return (
    <AnimatePresence onExitComplete={() => { setPhase('idle'); setActiveStep(-1) }}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9990] overflow-y-auto"
          style={{ background: 'rgba(5,5,12,0.94)', backdropFilter: 'blur(18px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="flex min-h-full items-start justify-center px-3 py-3 md:px-4 md:py-12">
            <motion.div
              className="w-full max-w-4xl"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              transition={{ duration: 0.42, ease: SPRING }}
            >
              <div
                className="rounded-xl md:rounded-2xl overflow-hidden border"
                style={{
                  background:  '#0a0a16',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow:   '0 0 100px rgba(0,0,0,0.8), 0 0 40px rgba(100,60,255,0.05)',
                }}
              >

                {/* ── Header bar ── */}
                <div
                  className="flex items-center justify-between gap-4 border-b px-5 md:px-7 py-4"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c9a227' }} />
                      <span
                        className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: 'rgba(201,162,39,0.65)' }}
                      >
                        Live Pipeline Demo
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-base md:text-lg tracking-tight">
                      Watch 6 AI Agents Process a Real Case
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Step progress dots */}
                    <div className="hidden sm:flex gap-1.5 items-center">
                      {AGENTS.map((_, i) => (
                        <div
                          key={i}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width:      activeStep === i ? '10px' : '7px',
                            height:     activeStep === i ? '10px' : '7px',
                            background: activeStep > i || phase === 'complete'
                              ? '#c9a227'
                              : activeStep === i
                                ? 'rgba(201,162,39,0.75)'
                                : 'rgba(255,255,255,0.1)',
                            boxShadow: activeStep === i
                              ? '0 0 8px rgba(201,162,39,0.6)'
                              : 'none',
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleClose}
                      className="p-2 transition-colors rounded-lg touch-manipulation"
                      style={{ color: 'rgba(255,255,255,0.25)' }}
                      aria-label="Close demo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="px-5 md:px-7 py-5 space-y-4">

                  {/* Case input */}
                  <div
                    className="rounded-xl border p-4"
                    style={{ background: '#050510', borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.2em]"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                      >
                        Input Case
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.12)' }}>
                        · Sindh · Urdu · Property
                      </span>
                    </div>
                    <p className="font-mono text-xs md:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      &ldquo;{SAMPLE}&rdquo;
                    </p>
                  </div>

                  {/* Run button */}
                  {phase === 'idle' && (
                    <motion.button
                      onClick={handleRun}
                      className="w-full font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                      style={{
                        background: '#c9a227',
                        color:      '#080810',
                        boxShadow:  '0 0 28px rgba(201,162,39,0.25)',
                      }}
                      whileHover={{ scale: 1.015, boxShadow: '0 0 44px rgba(201,162,39,0.42)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Run Pipeline →
                    </motion.button>
                  )}

                  {/* Running status bar */}
                  {phase === 'running' && (
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                      style={{
                        background:  'rgba(255,255,255,0.02)',
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <svg
                        className="animate-spin h-3.5 w-3.5 shrink-0"
                        style={{ color: '#c9a227' }}
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {activeStep < 0
                          ? 'Initializing pipeline…'
                          : `Agent ${activeStep + 1} / 6 processing…`
                        }
                      </span>
                      {/* Progress track */}
                      <div className="ml-auto hidden sm:flex gap-1">
                        {AGENTS.map((_, i) => (
                          <div
                            key={i}
                            className="h-[2px] w-5 rounded-full transition-all duration-300"
                            style={{
                              background: i <= activeStep
                                ? '#c9a227'
                                : 'rgba(255,255,255,0.08)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent cards — 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AGENTS.map((agent, i) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        index={i}
                        isActive={activeStep === i}
                        isComplete={activeStep > i || phase === 'complete'}
                      />
                    ))}
                  </div>

                  {/* Completion banner */}
                  <AnimatePresence>
                    {phase === 'complete' && (
                      <motion.div
                        className="rounded-xl border px-5 py-5 text-center"
                        style={{
                          background:  'rgba(201,162,39,0.03)',
                          borderColor: 'rgba(201,162,39,0.28)',
                        }}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: SPRING }}
                      >
                        <p className="font-bold text-base mb-0.5" style={{ color: '#c9a227' }}>
                          Pipeline Complete ✓
                        </p>
                        <p className="text-xs font-mono mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          Processed in 9.2 seconds · 6 agents · 0 PII stored
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <a
                            href="#submit"
                            onClick={handleClose}
                            className="font-bold px-8 py-3 rounded-xl text-sm transition-colors text-center"
                            style={{
                              background: '#c9a227',
                              color:      '#080810',
                              boxShadow:  '0 0 24px rgba(201,162,39,0.22)',
                            }}
                          >
                            Submit Your Real Case →
                          </a>
                          <button
                            onClick={handleClose}
                            className="border text-sm font-semibold px-8 py-3 rounded-xl transition-colors"
                            style={{
                              borderColor: 'rgba(255,255,255,0.1)',
                              color:       'rgba(255,255,255,0.4)',
                            }}
                          >
                            Close Demo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
