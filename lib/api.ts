const BASE = 'https://white-rabbit-api-production-9119.up.railway.app'

// API client for White Rabbit
export interface Company {
  id: number
  name: string
  industry: string
  revenue_msek: number | null
  growth_pct: number | null
  employees: number | null
  profitability: string
  hiring_signals: string | null
  tech_stack: string[]
  website: string | null
  score: number
  score_breakdown: Record<string, number>
  pain_points: string[]
  workflow_issues: string[]
  automation_opportunities: string[]
  sales_angle: string | null
  sdr_notes: string | null
  pain_summary: string | null
  urgency: string | null
  estimated_hours_saved: number | null
  ai_analyzed_at: string | null
  hubspot_id: string | null
  pipedrive_id: string | null
  crm_synced_at: string | null
  created_at: string
}

export interface Contact {
  id: number
  company_id: number
  name: string | null
  title: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  decision_score: number
  enriched: boolean
}

export interface AnalyzeRequest {
  company_name: string
  industry: string
  revenue_msek?: number
  growth_pct?: number
  employees?: number
  profitability?: string
  hiring_signals?: string
  tech_stack?: string[]
  save_to_company?: number
}

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

export interface Activity {
  id: number
  company_id: number
  contact_id: number | null
  type: ActivityType
  notes: string | null
  next_step: string | null
  assigned_to: string | null
  activity_date: string
  ai_pain_points?: string[]
  ai_systems?: string[]
  ai_buying_signals?: string[]
  ai_objections?: string[]
  ai_urgency?: string | null
  ai_next_step?: string | null
}

export interface ActivityCreate {
  company_id: number
  contact_id?: number
  type: ActivityType
  notes?: string
  next_step?: string
  assigned_to?: string
}

export interface AnalyzeResponse {
  pain_points: string[]
  workflow_issues: string[]
  automation_opportunities: string[]
  best_contacts: string[]
  sales_angle: string
  sdr_notes: string
  summary: string
  urgency_level: string
  estimated_monthly_hours_saved: number
  tokens_used?: number
}

export interface ProspectSearchRequest {
  bransch?: string
  region?: string
  min_omsattning_msek?: number
  max_omsattning_msek?: number
  min_anstallda?: number
  max_anstallda?: number
  max_results?: number
}

export interface ProspectSearchResult {
  name: string
  revenue_msek: number | null
  employees: number | null
  address: string | null
  allabolag_url: string | null
  has_gasell: boolean
}

export interface ProspectSearchResponse {
  prospects: ProspectSearchResult[]
  count: number
  filters_used: Record<string, any>
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  prospects: {
    list: (params?: { industry?: string; min_score?: number }) => {
      const q = new URLSearchParams()
      if (params?.industry) q.set('industry', params.industry)
      if (params?.min_score) q.set('min_score', String(params.min_score))
      return request<Company[]>(`/prospects/?${q}`)
    },
    get: (id: number) => request<Company>(`/prospects/${id}`),
    create: (body: Partial<Company>) =>
      request<Company>('/prospects/', { method: 'POST', body: JSON.stringify(body) }),
    contacts: (id: number) => request<Contact[]>(`/prospects/${id}/contacts`),
  },
  ai: {
    analyze: (body: AnalyzeRequest) =>
      request<AnalyzeResponse>('/ai/analyze', { method: 'POST', body: JSON.stringify(body) }),
    pushCRM: (company_id: number, crm: string) =>
      request('/ai/crm/push', { method: 'POST', body: JSON.stringify({ company_id, crm }) }),
    prospectSearch: (body: ProspectSearchRequest) =>
      request<ProspectSearchResponse>('/ai/prospect-search', { method: 'POST', body: JSON.stringify(body) }),
  },
  activities: {
    list: (company_id: number) =>
      request<Activity[]>(`/activities/?company_id=${company_id}`),
    create: (body: ActivityCreate) =>
      request<Activity>('/activities/', { method: 'POST', body: JSON.stringify(body) }),
  },
}

