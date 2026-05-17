'use client'
import { useEffect, useState } from 'react'
import type { Company } from '@/lib/api'
import { api } from '@/lib/api'
import ScoreBadge from './ScoreBadge'
import ActivityPanel from './ActivityPanel'

type Tab = 'intelligence' | 'activities'

export default function DetailPanel({ company, onUpdate }: { company: Company; onUpdate: () => void }) {
  const [tab, setTab] = useState<Tab>('intelligence')
  const [analyzing, setAnalyzing] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setTab('intelligence')
  }, [company.id])

  async function runAnalysis() {
    setAnalyzing(true)
    setMsg('')
    try {
      await api.ai.analyze({
        company_name: company.name,
        industry: company.industry,
        revenue_msek: company.revenue_msek ?? undefined,
        growth_pct: company.growth_pct ?? undefined,
        employees: company.employees ?? undefined,
        profitability: company.profitability,
        hiring_signals: company.hiring_signals ?? undefined,
        tech_stack: company.tech_stack,
        save_to_company: company.id,
      })
      setMsg('Analysis complete!')
      onUpdate()
    } catch {
      setMsg('Analysis failed — check API connection.')
    }
    setAnalyzing(false)
  }

  async function pushCRM(crm: string) {
    setPushing(true)
    setMsg('')
    try {
      await api.ai.pushCRM(company.id, crm)
      setMsg(`Pushed to ${crm}!`)
      onUpdate()
    } catch {
      setMsg('CRM push failed — check API key.')
    }
    setPushing(false)
  }

  const tag = (text: string, color: string) => (
    <span style={{
      fontSize: 11, 
      padding: '4px 10px', 
      borderRadius: 'var(--radius-sm)',
      background: color + '15', 
      color, 
      border: `1px solid ${color}30`,
      fontWeight: 500,
    }}>
      {text}
    </span>
  )

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      background: 'var(--bg-secondary)',
    }}>
      {/* Header */}
      <div style={{ 
        padding: 'var(--space-xl)', 
        borderBottom: '1px solid var(--border)', 
        flexShrink: 0,
      }}>
        <div style={{ 
          fontSize: 18, 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          {company.name}
        </div>
        <div style={{ 
          fontSize: 13, 
          color: 'var(--text-muted)', 
          marginBottom: 16,
        }}>
          {company.industry} · Stockholm, SE
        </div>
        <ScoreBadge score={company.score} />
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--border)', 
        flexShrink: 0, 
        padding: '0 var(--space-xl)',
        background: 'var(--surface)',
      }}>
        {([
          { id: 'intelligence' as Tab, label: 'Intelligence' },
          { id: 'activities' as Tab, label: 'Activities' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              fontFamily: 'var(--font-sora)',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'intelligence' ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          overflowY: 'auto',
        }}>
          {/* Score breakdown */}
          {Object.keys(company.score_breakdown || {}).length > 0 && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Score Breakdown</div>
              <div style={{ 
                background: 'var(--surface)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-md)',
                border: '1px solid var(--border)',
              }}>
                {Object.entries(company.score_breakdown).map(([k, v]) => (
                  <div key={k} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: 12, 
                    color: 'var(--text-secondary)', 
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span>{k}</span>
                    <span style={{ 
                      color: (v as number) > 0 ? 'var(--success)' : 'var(--error)', 
                      fontWeight: 600,
                    }}>
                      {(v as number) > 0 ? '+' : ''}{v as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain points */}
          {company.pain_points?.length > 0 && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Operational Issues</div>
              {company.pain_points.map((p, i) => (
                <div key={i} style={{ 
                  fontSize: 13, 
                  color: 'var(--text-secondary)', 
                  padding: '8px 0', 
                  display: 'flex', 
                  gap: 10, 
                  alignItems: 'flex-start',
                  lineHeight: 1.5,
                }}>
                  <span style={{ 
                    color: 'var(--warning)', 
                    marginTop: 2, 
                    fontSize: 8,
                  }}>●</span>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Automation opportunities */}
          {company.automation_opportunities?.length > 0 && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Automation Opportunities</div>
              {company.automation_opportunities.map((a, i) => (
                <div key={i} style={{ 
                  fontSize: 13, 
                  color: 'var(--text-secondary)', 
                  padding: '8px 0', 
                  display: 'flex', 
                  gap: 10, 
                  alignItems: 'flex-start',
                  lineHeight: 1.5,
                }}>
                  <span style={{ 
                    color: 'var(--success)', 
                    marginTop: 2, 
                    fontSize: 8,
                  }}>●</span>
                  {a}
                </div>
              ))}
            </div>
          )}

          {/* Tech stack */}
          {company.tech_stack?.length > 0 && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Tech Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {company.tech_stack.map(s => tag(s, 'var(--accent)'))}
              </div>
            </div>
          )}

          {/* Sales angle */}
          {company.sales_angle && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Sales Angle</div>
              <div style={{
                fontSize: 13, 
                fontWeight: 500, 
                lineHeight: 1.6,
                padding: 'var(--space-md)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--accent)',
                marginTop: 6,
                color: 'var(--text-primary)',
              }}>
                {company.sales_angle}
              </div>
            </div>
          )}

          {/* SDR notes */}
          {company.sdr_notes && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>SDR Notes</div>
              <div style={{ 
                fontSize: 12, 
                color: 'var(--text-secondary)', 
                lineHeight: 1.6,
                marginTop: 6,
                fontFamily: 'monospace',
                background: 'var(--surface)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
              }}>
                {company.sdr_notes}
              </div>
            </div>
          )}

          {/* Estimated hours */}
          {company.estimated_hours_saved && (
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={sectionTitle}>Estimated Time Savings</div>
              <div style={{ 
                fontSize: 28, 
                fontWeight: 600, 
                color: 'var(--success)', 
                marginTop: 4,
              }}>
                ~{company.estimated_hours_saved}h
                <span style={{ 
                  fontSize: 13, 
                  color: 'var(--text-muted)', 
                  fontWeight: 400,
                  marginLeft: 6,
                }}>
                  / month
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ 
            padding: 'var(--space-xl)', 
            marginTop: 'auto',
            background: 'var(--surface)',
            borderTop: '1px solid var(--border)',
          }}>
            {msg && (
              <div className="badge badge-success" style={{ 
                fontSize: 12, 
                marginBottom: 12, 
                padding: '10px 12px',
                width: '100%',
                justifyContent: 'center',
              }}>
                {msg}
              </div>
            )}
            <button 
              onClick={runAnalysis} 
              disabled={analyzing} 
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: 8 }}
            >
              {analyzing ? 'Analyzing...' : '✦ Run AI Analysis'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => pushCRM('hubspot')} 
                disabled={pushing} 
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                → HubSpot
              </button>
              <button 
                onClick={() => pushCRM('pipedrive')} 
                disabled={pushing} 
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                → Pipedrive
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ActivityPanel companyId={company.id} />
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: 11, 
  textTransform: 'uppercase', 
  letterSpacing: '0.1em',
  color: 'var(--text-muted)', 
  marginBottom: 12,
  fontWeight: 600,
}
