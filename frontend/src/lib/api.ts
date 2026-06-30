export interface CaseSubmit {
  problem_text: string
  language: 'ur' | 'en'
  province: string | null
  citizen_name?: string
  contact?: string
}

export interface DeadlineOut {
  deadline_date: string
  description_en: string
  description_ur: string
  deadline_type: string
  priority: 'urgent' | 'important' | 'informational'
}

export interface CaseResult {
  case_id: string
  status: string

  // Classifier
  legal_category: string | null
  sub_issues: string[] | null
  urgency: 'low' | 'medium' | 'high' | 'critical' | null
  detected_language: string | null
  confidence: number | null
  summary_en: string | null
  summary_ur: string | null

  // Rights explainer
  rights_en: string | null
  rights_ur: string | null
  relevant_laws: string[] | null
  recommended_actions: string[] | null

  // Document drafter
  document_type: string | null
  document_url: string | null

  // Lawyer assessment
  lawyer_needed: boolean | null
  lawyer_reason: string | null
  referral_type: 'none' | 'legal_aid' | 'pro_bono' | 'private' | null
  referral_note_en: string | null
  referral_note_ur: string | null

  // Deadlines
  deadlines: DeadlineOut[] | null

  // Pipeline
  pipeline_status: string | null
  error_message: string | null
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export function submitCase(body: CaseSubmit): Promise<CaseResult> {
  return apiFetch<CaseResult>('/api/cases', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getCase(caseId: string): Promise<CaseResult> {
  return apiFetch<CaseResult>(`/api/cases/${caseId}`)
}

// Human-readable labels
export const CATEGORY_LABELS: Record<string, string> = {
  family_law:       'Family Law',
  labor:            'Labour & Employment',
  property:         'Property & Land',
  criminal:         'Criminal Law',
  consumer:         'Consumer Rights',
  tenant:           'Tenant & Rental',
  inheritance:      'Inheritance & Wills',
  domestic_violence:'Domestic Violence',
  child_custody:    'Child Custody',
  debt:             'Debt & Loans',
  police:           'Police & FIR',
  other:            'Other',
}

export const URGENCY_CONFIG: Record<string, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-800'     },
  high:     { label: 'High',     classes: 'bg-orange-100 text-orange-800'},
  medium:   { label: 'Medium',   classes: 'bg-yellow-100 text-yellow-800'},
  low:      { label: 'Low',      classes: 'bg-green-100 text-green-800'  },
}

export const PRIORITY_CONFIG: Record<string, { dot: string; label: string }> = {
  urgent:        { dot: 'bg-red-500',    label: 'Urgent'        },
  important:     { dot: 'bg-orange-400', label: 'Important'     },
  informational: { dot: 'bg-blue-400',   label: 'Informational' },
}
