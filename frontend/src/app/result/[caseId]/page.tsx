'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ThemeToggle from '@/app/components/ThemeToggle'
import {
  getCase,
  CaseResult,
  CATEGORY_LABELS,
  URGENCY_CONFIG,
  PRIORITY_CONFIG,
} from '@/lib/api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function trackingId(caseId: string) {
  return `ADA-${caseId.slice(0, 8).toUpperCase()}`
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function SectionHeading({ en, ur }: { en: string; ur: string }) {
  return (
    <div className="border-b border-[#0a1f44]/10 dark:border-white/[0.07] pb-4 mb-6">
      <h2 className="text-lg font-bold text-[#0a1f44] dark:text-white">{en}</h2>
      <p className="urdu text-[#0a1f44]/30 dark:text-white/30 text-sm mt-1">{ur}</p>
    </div>
  )
}

function LawBadge({ text }: { text: string }) {
  return (
    <span className="inline-block bg-[#0a1f44]/[0.05] dark:bg-white/[0.05] text-[#0a1f44]/65 dark:text-white/65 text-xs font-medium px-3 py-1 rounded-lg border border-[#0a1f44]/08 dark:border-white/[0.08]">
      {text}
    </span>
  )
}

// ─── Case header ─────────────────────────────────────────────────────────────

function CaseHeader({ result }: { result: CaseResult }) {
  const urgency  = URGENCY_CONFIG[result.urgency ?? '']
  const category = CATEGORY_LABELS[result.legal_category ?? ''] ?? result.legal_category

  return (
    <motion.section
      className="relative py-10 md:py-14 px-4 overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Subtle gold glow from top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(201,162,39,0.08) 0%, transparent 70%)' }}
      />
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="text-[#0a1f44]/35 dark:text-white/35 text-sm">Case Reference</span>
          <span className="bg-gold/[0.12] text-gold font-mono font-bold text-sm px-3 py-1 rounded-lg border border-gold/20">
            {trackingId(result.case_id)}
          </span>
        </div>

        <h1 className="text-[#0a1f44] dark:text-white text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          Your Case Results
        </h1>
        <p className="urdu text-[#0a1f44]/50 dark:text-white/50 text-xl mb-6">آپ کے کیس کے نتائج</p>

        <div className="flex flex-wrap gap-2">
          {category && (
            <span className="badge bg-[#0a1f44]/[0.07] dark:bg-white/[0.07] text-[#0a1f44]/70 dark:text-white/70 text-xs border border-[#0a1f44]/10 dark:border-white/[0.08]">{category}</span>
          )}
          {urgency && (
            <span className={`badge text-xs ${urgency.classes}`}>⚡ {urgency.label} Urgency</span>
          )}
          {result.confidence != null && (
            <span className="badge bg-[#0a1f44]/[0.07] dark:bg-white/[0.07] text-[#0a1f44]/50 dark:text-white/50 text-xs border border-[#0a1f44]/10 dark:border-white/[0.08]">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          )}
          {result.pipeline_status === 'complete' && (
            <span className="badge bg-green-900/40 text-green-400 text-xs border border-green-700/30">✓ Complete</span>
          )}
        </div>
      </div>
    </motion.section>
  )
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Summary section ──────────────────────────────────────────────────────────

function SummarySection({ result }: { result: CaseResult }) {
  if (!result.summary_en && !result.summary_ur) return null
  return (
    <section className="card-glow bg-white dark:bg-[#13131f] rounded-2xl border border-[#0a1f44]/10 dark:border-white/[0.08] p-6 md:p-8">
      <SectionHeading en="Case Summary" ur="کیس کا خلاصہ" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.summary_en && (
          <div>
            <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-2.5">English</p>
            <p className="text-[#0a1f44]/70 dark:text-white/70 leading-relaxed text-sm">{result.summary_en}</p>
          </div>
        )}
        {result.summary_ur && (
          <div className="md:border-l md:border-[#0a1f44]/07 dark:md:border-white/[0.07] md:pl-6">
            <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-2.5 text-right">اردو</p>
            <p className="urdu text-[#0a1f44]/70 dark:text-white/70 text-base">{result.summary_ur}</p>
          </div>
        )}
      </div>
      {result.sub_issues && result.sub_issues.length > 0 && (
        <div className="mt-5 pt-5 border-t border-[#0a1f44]/07 dark:border-white/[0.07] flex flex-wrap gap-2">
          {result.sub_issues.map(issue => (
            <span key={issue} className="badge bg-[#0a1f44]/[0.05] dark:bg-white/[0.05] text-[#0a1f44]/65 dark:text-white/65 text-xs border border-[#0a1f44]/08 dark:border-white/[0.08]">
              {issue}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Rights section ───────────────────────────────────────────────────────────

function RightsSection({ result }: { result: CaseResult }) {
  if (!result.rights_en && !result.rights_ur) return null
  return (
    <section className="card-glow bg-white dark:bg-[#13131f] rounded-2xl border border-[#0a1f44]/10 dark:border-white/[0.08] p-6 md:p-8">
      <SectionHeading en="Your Legal Rights" ur="آپ کے قانونی حقوق" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.rights_en && (
          <div>
            <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-2.5">English</p>
            <p className="text-[#0a1f44]/70 dark:text-white/70 leading-relaxed text-sm">{result.rights_en}</p>
          </div>
        )}
        {result.rights_ur && (
          <div className="md:border-l md:border-[#0a1f44]/07 dark:md:border-white/[0.07] md:pl-6">
            <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-2.5 text-right">اردو</p>
            <p className="urdu text-[#0a1f44]/70 dark:text-white/70 text-base">{result.rights_ur}</p>
          </div>
        )}
      </div>

      {result.relevant_laws && result.relevant_laws.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#0a1f44]/07 dark:border-white/[0.07]">
          <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-3">Applicable Laws</p>
          <div className="flex flex-wrap gap-2">
            {result.relevant_laws.map(law => <LawBadge key={law} text={law} />)}
          </div>
        </div>
      )}

      {result.recommended_actions && result.recommended_actions.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[#0a1f44]/07 dark:border-white/[0.07]">
          <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-3">Recommended Actions</p>
          <ol className="space-y-3">
            {result.recommended_actions.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#0a1f44]/65 dark:text-white/65">
                <span className="shrink-0 w-5 h-5 bg-gold/[0.12] text-gold rounded-full flex items-center justify-center text-xs font-bold border border-gold/20">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  )
}

// ─── Document section ─────────────────────────────────────────────────────────

function DocumentSection({ result }: { result: CaseResult }) {
  if (!result.document_url) return null
  return (
    <section className="card-glow bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <p className="text-gold font-semibold text-xs uppercase tracking-[0.15em] mb-2">
            Legal Document Ready
          </p>
          <h2 className="text-[#0a1f44] dark:text-white text-xl font-bold mb-1">{result.document_type ?? 'Legal Document'}</h2>
          <p className="urdu text-[#0a1f44]/45 dark:text-white/45 text-sm">دستاویز تیار ہے</p>
          <p className="text-[#0a1f44]/30 dark:text-white/30 text-xs mt-2 max-w-sm leading-relaxed">
            Fill in the bracketed placeholders before submitting. This is a template, not legal advice.
          </p>
        </div>
        <a
          href={result.document_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto justify-center shrink-0 flex items-center gap-2 bg-gold hover:bg-yellow-500 text-[#080810] font-bold px-7 py-3.5 rounded-xl transition-all shadow-[0_0_24px_rgba(201,162,39,0.22)] hover:shadow-[0_0_32px_rgba(201,162,39,0.36)] text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
            <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
          </svg>
          Download PDF
        </a>
      </div>
    </section>
  )
}

// ─── Lawyer section ───────────────────────────────────────────────────────────

const REFERRAL_LABELS: Record<string, string> = {
  legal_aid: 'Legal Aid Authority',
  pro_bono:  'Pro Bono Clinic',
  private:   'Private Counsel',
  none:      'No Referral Needed',
}

function LawyerSection({ result }: { result: CaseResult }) {
  if (result.lawyer_needed == null) return null
  return (
    <section
      className={`card-glow rounded-2xl p-6 md:p-8 border ${
        result.lawyer_needed
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700/30'
          : 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-2xl mt-0.5 ${result.lawyer_needed ? 'text-orange-500 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
          {result.lawyer_needed ? '⚖' : '✓'}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className={`text-lg font-bold ${result.lawyer_needed ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'}`}>
              {result.lawyer_needed ? 'A Lawyer Is Recommended' : 'You Can Self-Serve This Case'}
            </h2>
            {result.referral_type && result.referral_type !== 'none' && (
              <span className="badge bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs border border-orange-200 dark:border-orange-700/30">
                {REFERRAL_LABELS[result.referral_type] ?? result.referral_type}
              </span>
            )}
          </div>
          {result.lawyer_reason && (
            <p className="text-[#0a1f44]/60 dark:text-white/60 text-sm mb-4 leading-relaxed">{result.lawyer_reason}</p>
          )}
          {result.lawyer_needed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.referral_note_en && (
                <div>
                  <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-1.5">Where to get help</p>
                  <p className="text-[#0a1f44]/60 dark:text-white/60 text-sm leading-relaxed">{result.referral_note_en}</p>
                </div>
              )}
              {result.referral_note_ur && (
                <div className="md:border-l md:border-orange-200 dark:md:border-orange-700/20 md:pl-4">
                  <p className="text-[10px] font-semibold text-[#0a1f44]/30 dark:text-white/30 uppercase tracking-widest mb-1.5 text-right">مدد کہاں سے لیں</p>
                  <p className="urdu text-[#0a1f44]/60 dark:text-white/60 text-sm">{result.referral_note_ur}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Deadlines section ────────────────────────────────────────────────────────

function DeadlinesSection({ result }: { result: CaseResult }) {
  if (!result.deadlines || result.deadlines.length === 0) return null
  return (
    <section className="card-glow bg-white dark:bg-[#13131f] rounded-2xl border border-[#0a1f44]/10 dark:border-white/[0.08] p-6 md:p-8">
      <SectionHeading en="Important Deadlines" ur="اہم ڈیڈلائنز" />
      <div className="space-y-4">
        {result.deadlines.map((dl, i) => {
          const p = PRIORITY_CONFIG[dl.priority] ?? PRIORITY_CONFIG.informational
          return (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                {i < result.deadlines!.length - 1 && (
                  <div className="w-px bg-[#0a1f44]/[0.07] dark:bg-white/[0.07] flex-1 mt-1.5" style={{ minHeight: '1.75rem' }} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-semibold text-[#0a1f44]/90 dark:text-white/90">{dl.deadline_date}</span>
                  <span className={`badge text-xs ${
                    dl.priority === 'urgent'    ? 'bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700/30' :
                    dl.priority === 'important' ? 'bg-orange-50 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-700/30' :
                                                   'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700/30'
                  }`}>
                    {p.label}
                  </span>
                  <span className="badge bg-[#0a1f44]/[0.05] dark:bg-white/[0.05] text-[#0a1f44]/45 dark:text-white/45 text-xs border border-[#0a1f44]/07 dark:border-white/[0.07]">{dl.deadline_type}</span>
                </div>
                <p className="text-[#0a1f44]/65 dark:text-white/65 text-sm leading-relaxed">{dl.description_en}</p>
                {dl.description_ur && (
                  <p className="urdu text-[#0a1f44]/40 dark:text-white/40 text-sm mt-1">{dl.description_ur}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResultPage({ params }: { params: { caseId: string } }) {
  const { caseId } = params
  const [result, setResult] = useState<CaseResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cached = sessionStorage.getItem(`adalat-result-${caseId}`)
    if (cached) {
      try {
        setResult(JSON.parse(cached))
        setLoading(false)
        return
      } catch {
        // cache corrupt — fall through to fetch
      }
    }
    getCase(caseId)
      .then(r => { setResult(r); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [caseId])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: 'var(--nav-scrolled)', borderColor: 'var(--nav-border-scrolled)' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span
              className="font-bold tracking-tight"
              style={{ fontSize: '20px', color: '#c9a227', textShadow: '0 0 16px rgba(201,162,39,0.3)' }}
            >
              Adalat
            </span>
            <span
              className="mx-2.5 shrink-0"
              style={{ display: 'inline-block', width: '1.5px', height: '16px', background: 'rgba(201,162,39,0.4)', borderRadius: '1px' }}
            />
            <span className="font-bold tracking-tight text-[#0a1f44] dark:text-white" style={{ fontSize: '20px' }}>
              AI
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="text-[#0a1f44]/40 dark:text-white/40 hover:text-[#0a1f44]/70 dark:hover:text-white/70 text-sm font-medium transition-colors"
            >
              ← New Case
            </Link>
          </div>
        </div>
      </nav>

      {/* Loading */}
      {loading && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
          <svg className="animate-spin h-9 w-9 text-[#0a1f44]/30 dark:text-white/30" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[#0a1f44]/70 dark:text-white/70 font-semibold">Loading your case…</p>
          <p className="urdu text-[#0a1f44]/30 dark:text-white/30 text-sm">کیس لوڈ ہو رہا ہے</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700/40 rounded-2xl p-8 max-w-md text-center">
            <p className="text-red-600 dark:text-red-300 font-semibold mb-2">Could not load case</p>
            <p className="text-red-500/80 dark:text-red-400/80 text-sm mb-5">{error}</p>
            <Link href="/" className="text-[#0a1f44]/50 dark:text-white/50 hover:text-[#0a1f44]/80 dark:hover:text-white/80 underline text-sm transition-colors">Return home</Link>
          </div>
        </div>
      )}

      {/* Result */}
      {!loading && result && (
        <main>
          <CaseHeader result={result} />

          <div className="py-6 md:py-10 px-4" style={{ background: 'var(--bg-alt)' }}>
            <div className="max-w-4xl mx-auto space-y-5">
              {/* Tracking number */}
              <motion.div
                className="bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_32px_rgba(10,31,68,0.06)] dark:shadow-[0_0_60px_rgba(0,0,0,0.4)]"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
              >
                <div>
                  <p className="text-[#0a1f44]/30 dark:text-white/30 text-xs uppercase tracking-wider mb-1">Your Case Tracking Number</p>
                  <p className="text-gold font-mono font-bold text-2xl">{trackingId(result.case_id)}</p>
                  <p className="urdu text-[#0a1f44]/25 dark:text-white/25 text-xs mt-1">آپ کا کیس ٹریکنگ نمبر</p>
                </div>
                <motion.button
                  onClick={() => navigator.clipboard.writeText(trackingId(result.case_id))}
                  className="shrink-0 border border-[#0a1f44]/10 dark:border-white/[0.1] hover:border-[#0a1f44]/25 dark:hover:border-white/30 text-[#0a1f44]/40 dark:text-white/40 hover:text-[#0a1f44]/70 dark:hover:text-white/70 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Copy
                </motion.button>
              </motion.div>

              <RevealSection delay={0.1}><SummarySection   result={result} /></RevealSection>
              <RevealSection delay={0.15}><RightsSection    result={result} /></RevealSection>
              <RevealSection delay={0.1}><DocumentSection  result={result} /></RevealSection>
              <RevealSection delay={0.1}><LawyerSection    result={result} /></RevealSection>
              <RevealSection delay={0.1}><DeadlinesSection result={result} /></RevealSection>

              <p className="text-center text-xs text-[#0a1f44]/20 dark:text-white/20 py-4">
                AdalatAI provides information, not legal advice. For urgent or serious matters, consult a qualified lawyer.
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
