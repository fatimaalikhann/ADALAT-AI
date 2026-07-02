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

// ─── PDF generation ──────────────────────────────────────────────────────────

async function downloadPDF(result: CaseResult) {
  const { default: jsPDF } = await import('jspdf')

  const doc    = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW  = 210
  const pageH  = 297
  const margin = 18
  const cW     = pageW - margin * 2

  const gold:  [number, number, number] = [201, 162,  39]
  const navy:  [number, number, number] = [10,   31,  68]
  const body:  [number, number, number] = [50,   50,  60]
  const muted: [number, number, number] = [120, 120, 130]
  const rule:  [number, number, number] = [210, 210, 215]

  let y = 0

  const lh = (size: number) => size * 0.42

  function checkPage(need: number) {
    if (y + need > pageH - 16) { doc.addPage(); y = margin }
  }

  function txt(
    content: string,
    { size = 10, bold = false, color = body, x = margin, w = cW }:
    { size?: number; bold?: boolean; color?: [number, number, number]; x?: number; w?: number } = {}
  ) {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(content, w)
    checkPage(lines.length * lh(size) + 2)
    doc.text(lines, x, y)
    y += lines.length * lh(size) + 1.5
  }

  function gap(mm: number) { y += mm }

  function section(title: string) {
    gap(4)
    checkPage(10)
    doc.setDrawColor(...gold)
    doc.setLineWidth(0.4)
    doc.line(margin, y, pageW - margin, y)
    gap(3.5)
    txt(title, { size: 10, bold: true, color: gold })
    gap(1)
  }

  // ── Header bar ──
  doc.setFillColor(...gold)
  doc.rect(0, 0, pageW, 20, 'F')
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(8, 8, 16)
  doc.text('Adalat | AI', margin, 12)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Case Report  ·  Free Legal Aid System', margin + 1, 17)

  y = 27

  // Reference + date
  const ref     = `ADA-${result.case_id.slice(0, 8).toUpperCase()}`
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...navy)
  doc.text(ref, margin, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...muted)
  doc.text(dateStr, pageW - margin - doc.getTextWidth(dateStr), y)
  gap(6)

  if (result.pipeline_status === 'complete') {
    doc.setFillColor(21, 128, 61)
    doc.roundedRect(margin, y, 28, 5, 1, 1, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('✓ COMPLETE', margin + 3, y + 3.5)
    gap(9)
  } else {
    gap(4)
  }

  // ── Case summary ──
  if (result.summary_en || result.legal_category) {
    section('CASE SUMMARY')
    const LABELS: Record<string, string> = {
      family_law: 'Family Law', labor: 'Labour & Employment',
      property: 'Property & Land', criminal: 'Criminal Law',
      consumer: 'Consumer Rights', tenant: 'Tenant & Rental',
      inheritance: 'Inheritance & Wills', domestic_violence: 'Domestic Violence',
      child_custody: 'Child Custody', debt: 'Debt & Loans',
      police: 'Police & FIR', other: 'Other',
    }
    const meta: string[] = []
    if (result.legal_category) meta.push(LABELS[result.legal_category] ?? result.legal_category)
    if (result.urgency) meta.push(`${result.urgency[0].toUpperCase() + result.urgency.slice(1)} Urgency`)
    if (result.confidence != null) meta.push(`${Math.round(result.confidence * 100)}% confidence`)
    if (meta.length) txt(meta.join('  ·  '), { size: 9, color: muted })
    if (result.sub_issues?.length) {
      gap(0.5)
      txt('Sub-issues: ' + result.sub_issues.join(', '), { size: 9, color: muted })
    }
    if (result.summary_en) { gap(2); txt(result.summary_en, { size: 10 }) }
    if (result.document_type) { gap(1.5); txt(`Document type: ${result.document_type}`, { size: 9, color: muted }) }
  }

  // ── Legal rights ──
  if (result.rights_en) {
    section('YOUR LEGAL RIGHTS')
    txt(result.rights_en, { size: 10 })
    if (result.relevant_laws?.length) {
      gap(3)
      txt('Applicable Laws', { size: 9, bold: true, color: navy })
      gap(0.5)
      result.relevant_laws.forEach(law => { txt(`• ${law}`, { size: 9, x: margin + 3, w: cW - 3 }); gap(-0.5) })
    }
    if (result.recommended_actions?.length) {
      gap(3)
      txt('Recommended Actions', { size: 9, bold: true, color: navy })
      gap(0.5)
      result.recommended_actions.forEach((a, i) => { txt(`${i + 1}. ${a}`, { size: 9, x: margin + 3, w: cW - 3 }); gap(-0.5) })
    }
  }

  // ── Lawyer assessment ──
  if (result.lawyer_needed != null) {
    section('LAWYER ASSESSMENT')
    const verdict      = result.lawyer_needed ? 'A Lawyer Is Recommended' : 'You Can Self-Serve This Case'
    const verdictColor: [number, number, number] = result.lawyer_needed ? [194, 65, 12] : [21, 128, 61]
    txt(verdict, { size: 11, bold: true, color: verdictColor })
    if (result.lawyer_reason) { gap(2); txt(result.lawyer_reason, { size: 10 }) }
    if (result.referral_type && result.referral_type !== 'none') {
      const rLabels: Record<string, string> = { legal_aid: 'Legal Aid Authority', pro_bono: 'Pro Bono Clinic', private: 'Private Counsel' }
      gap(2)
      txt(`Referral: ${rLabels[result.referral_type] ?? result.referral_type}`, { size: 9, bold: true, color: navy })
    }
    if (result.referral_note_en) { gap(1.5); txt(result.referral_note_en, { size: 9 }) }
  }

  // ── Deadlines ──
  if (result.deadlines?.length) {
    section('IMPORTANT DEADLINES')
    result.deadlines.forEach(dl => {
      checkPage(20)
      const dotColor: [number, number, number] =
        dl.priority === 'urgent' ? [220, 38, 38] : dl.priority === 'important' ? [234, 88, 12] : [59, 130, 246]
      doc.setFillColor(...dotColor)
      doc.circle(margin + 1.5, y + lh(9) / 2, 1.5, 'F')
      txt(`${dl.deadline_date}   ${dl.deadline_type.toUpperCase()}   [${dl.priority.toUpperCase()}]`,
        { size: 9, bold: true, color: navy, x: margin + 6, w: cW - 6 })
      gap(-1)
      txt(dl.description_en, { size: 9, x: margin + 6, w: cW - 6 })
      gap(2)
    })
  }

  // ── Footer on every page ──
  const total: number = (doc as any).internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setDrawColor(...rule)
    doc.setLineWidth(0.3)
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...muted)
    doc.text(
      'AdalatAI provides information only, not legal advice. Consult a qualified lawyer for urgent matters.',
      margin, pageH - 9
    )
    const pg = `${p} / ${total}`
    doc.text(pg, pageW - margin - doc.getTextWidth(pg), pageH - 9)
  }

  doc.save(`adalat-${result.case_id.slice(0, 8).toUpperCase()}.pdf`)
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
  const [generating, setGenerating] = useState(false)
  if (!result.summary_en && !result.rights_en) return null

  async function handleDownload() {
    setGenerating(true)
    try {
      await downloadPDF(result)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <section className="card-glow bg-white dark:bg-[#13131f] border border-[#0a1f44]/10 dark:border-white/[0.08] rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <p className="text-gold font-semibold text-xs uppercase tracking-[0.15em] mb-2">
            Case Report Ready
          </p>
          <h2 className="text-[#0a1f44] dark:text-white text-xl font-bold mb-1">
            {result.document_type ?? 'Full Case Report'}
          </h2>
          <p className="urdu text-[#0a1f44]/45 dark:text-white/45 text-sm">دستاویز تیار ہے</p>
          <p className="text-[#0a1f44]/30 dark:text-white/30 text-xs mt-2 max-w-sm leading-relaxed">
            Includes summary, rights, lawyer assessment, and deadlines. Generated in your browser.
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full md:w-auto justify-center shrink-0 flex items-center gap-2 bg-gold hover:bg-yellow-500 disabled:opacity-60 text-[#080810] font-bold px-7 py-3.5 rounded-xl transition-all shadow-[0_0_24px_rgba(201,162,39,0.22)] hover:shadow-[0_0_32px_rgba(201,162,39,0.36)] text-sm"
        >
          {generating ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
              <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
            </svg>
          )}
          {generating ? 'Generating…' : 'Download PDF'}
        </button>
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

// ─── Pipeline error panel ─────────────────────────────────────────────────────

function PipelineErrorPanel({ result }: { result: CaseResult }) {
  const hasContent =
    result.summary_en ||
    result.summary_ur ||
    result.rights_en ||
    result.rights_ur ||
    result.document_url ||
    result.lawyer_needed != null ||
    (result.deadlines && result.deadlines.length > 0)

  if (hasContent) return null

  return (
    <section className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-700/30 rounded-2xl p-6 md:p-8">
      <div className="flex items-start gap-4">
        <span className="text-2xl mt-0.5 shrink-0">⚠</span>
        <div>
          <h2 className="text-orange-700 dark:text-orange-300 font-bold text-lg mb-2">
            Pipeline did not complete
          </h2>
          <p className="text-[#0a1f44]/60 dark:text-white/60 text-sm leading-relaxed mb-3">
            Your case was received (tracking number saved above) but the AI pipeline could not
            produce results. This is usually caused by a backend configuration issue —{' '}
            <strong>not anything you did wrong</strong>.
          </p>
          {result.error_message && (
            <p className="font-mono text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg px-4 py-2.5 border border-orange-200 dark:border-orange-700/20">
              {result.error_message}
            </p>
          )}
          <p className="text-[#0a1f44]/45 dark:text-white/40 text-xs mt-4 leading-relaxed">
            Please try submitting your case again. If this keeps happening, the service may be
            temporarily unavailable.
          </p>
        </div>
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

              <RevealSection delay={0.1}><PipelineErrorPanel result={result} /></RevealSection>
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
