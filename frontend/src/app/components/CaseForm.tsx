'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { submitCase } from '@/lib/api'

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
]

const LOADING_STAGES = [
  'Classifying your legal problem…',
  'Explaining your rights under Pakistani law…',
  'Drafting your legal document…',
  'Assessing whether you need a lawyer…',
  'Calculating filing deadlines…',
  'Finalising your case file…',
]

export default function CaseForm() {
  const router = useRouter()

  const [language, setLanguage]       = useState<'ur' | 'en'>('ur')
  const [province, setProvince]       = useState('')
  const [problemText, setProblemText] = useState('')
  const [loading, setLoading]         = useState(false)
  const [stageIdx, setStageIdx]       = useState(0)
  const [error, setError]             = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(
        () => setStageIdx(i => (i + 1) % LOADING_STAGES.length),
        5000,
      )
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setStageIdx(0)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!problemText.trim() || problemText.trim().length < 10) {
      setError('Please describe your problem in at least 10 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await submitCase({
        problem_text: problemText.trim(),
        language,
        province: province || null,
      })
      sessionStorage.setItem(`adalat-result-${result.case_id}`, JSON.stringify(result))
      router.push(`/result/${result.case_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section id="submit" className="py-16 md:py-24 px-4" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 bg-gold/[0.08] text-gold text-xs font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border border-gold/20 mb-5">
            Free &amp; Confidential
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a1f44] dark:text-white mb-3">Submit Your Case to the Pipeline</h2>
          <p className="text-[#0a1f44]/45 dark:text-white/35 text-sm mb-2 max-w-md mx-auto leading-relaxed">
            Your problem enters a 6-agent AI pipeline. Classified, analyzed, documented, and tracked — in under 60 seconds.
          </p>
          <p className="urdu text-[#0a1f44]/50 dark:text-white/40 text-lg">اپنا مسئلہ درج کریں</p>
        </motion.div>

        {/* Form card */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-5 md:p-8 space-y-6 shadow-[0_4px_40px_rgba(10,31,68,0.06)] dark:shadow-[0_0_60px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          {/* Language toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#0a1f44]/55 dark:text-white/50 uppercase tracking-wider mb-3">
              Language / زبان
            </label>
            <div className="inline-flex rounded-xl border border-[#0a1f44]/10 dark:border-white/[0.1] overflow-hidden p-0.5 bg-[#0a1f44]/[0.03] dark:bg-white/[0.03]">
              {(['ur', 'en'] as const).map(lang => (
                <motion.button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    language === lang
                      ? 'bg-gold text-[#080810] shadow-sm'
                      : 'text-[#0a1f44]/50 dark:text-white/45 hover:text-[#0a1f44]/80 dark:hover:text-white/70 hover:bg-[#0a1f44]/[0.04] dark:hover:bg-white/[0.04]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {lang === 'ur' ? 'اردو' : 'English'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Province dropdown */}
          <div>
            <label htmlFor="province" className="block text-xs font-semibold text-[#0a1f44]/55 dark:text-white/50 uppercase tracking-wider mb-3">
              Province <span className="normal-case text-[#0a1f44]/35 dark:text-white/25 font-normal">(optional)</span>
            </label>
            <select
              id="province"
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full bg-[#f5f2ea] dark:bg-[#0c0c18] border border-[#0a1f44]/12 dark:border-white/[0.1] rounded-xl px-4 py-3 text-[#0a1f44] dark:text-white focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all [&>option]:bg-[#f5f2ea] dark:[&>option]:bg-[#13131f] [&>option]:text-[#0a1f44] dark:[&>option]:text-white"
            >
              <option value="">— Select province —</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Problem textarea */}
          <div>
            <label htmlFor="problem" className="block text-xs font-semibold text-[#0a1f44]/55 dark:text-white/50 uppercase tracking-wider mb-3">
              Describe your problem
            </label>
            <textarea
              id="problem"
              value={problemText}
              onChange={e => setProblemText(e.target.value)}
              rows={7}
              dir={language === 'ur' ? 'rtl' : 'ltr'}
              className={`w-full bg-[#f5f2ea] dark:bg-[#0c0c18] border border-[#0a1f44]/12 dark:border-white/[0.1] rounded-xl px-4 py-3.5 text-[#0a1f44] dark:text-white placeholder-[#0a1f44]/25 dark:placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition-all resize-y ${
                language === 'ur' ? 'urdu text-base' : 'text-sm'
              }`}
              placeholder={
                language === 'ur'
                  ? 'اپنا مسئلہ یہاں تفصیل سے لکھیں…'
                  : 'Describe your legal problem in detail…'
              }
              disabled={loading}
            />
            <p className="mt-2 text-xs text-[#0a1f44]/35 dark:text-white/25 text-right">
              {problemText.length} characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2.5 bg-red-950/50 border border-red-700/40 text-red-300 rounded-xl px-4 py-3.5 text-sm"
            >
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a1f44]/[0.03] dark:bg-white/[0.03] border border-[#0a1f44]/08 dark:border-white/[0.08] rounded-xl px-5 py-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <svg className="animate-spin h-4 w-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-[#0a1f44]/80 dark:text-white/80 font-medium text-sm">{LOADING_STAGES[stageIdx]}</span>
              </div>
              <div className="flex gap-1.5 mb-3">
                {LOADING_STAGES.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${i <= stageIdx ? 'bg-gold' : 'bg-[#0a1f44]/[0.08] dark:bg-white/[0.1]'}`}
                    animate={i === stageIdx ? { opacity: [0.7, 1, 0.7] } : {}}
                    transition={i === stageIdx ? { duration: 1.5, repeat: Infinity } : {}}
                  />
                ))}
              </div>
              <p className="text-xs text-[#0a1f44]/40 dark:text-white/30">
                Your case is being processed. This usually takes 30–60 seconds.
              </p>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-[#080810] font-bold py-4 rounded-xl transition-colors text-base shadow-[0_0_28px_rgba(201,162,39,0.22)]"
            whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 36px rgba(201,162,39,0.36)' } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? 'Processing…' : 'Submit Case / کیس جمع کریں'}
          </motion.button>

          <p className="text-center text-xs text-[#0a1f44]/35 dark:text-white/25">
            Your personal details are encrypted at rest and never shared.
          </p>
        </motion.form>
      </div>
    </section>
  )
}
