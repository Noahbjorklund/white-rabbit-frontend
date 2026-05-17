import type { Company } from '@/lib/api'
import ScoreBadge from './ScoreBadge'

interface Props {
  company: Company
  selected: boolean
  onClick: () => void
}

const industryLabel: Record<string, string> = {
  ecommerce: 'Ecommerce', logistics: 'Logistics', staffing: 'Staffing',
  construction: 'Construction', wholesale: 'Wholesale', real_estate: 'Real Estate',
  healthcare_admin: 'Healthcare', b2b_sales: 'B2B Sales',
}

export default function ProspectCard({ company, selected, onClick }: Props) {
  const initials = company.name.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div
      onClick={onClick}
      className="card animate-fade-in"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? 'var(--shadow-md)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border-hover)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between', 
        marginBottom: 'var(--space-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: 40, 
            height: 40, 
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: 12, 
            fontWeight: 600, 
            color: 'var(--text-secondary)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          
          {/* Company Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {company.name}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>{industryLabel[company.industry] || company.industry}</span>
              {company.employees && (
                <>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{company.employees} anst.</span>
                </>
              )}
              {company.revenue_msek && (
                <>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{company.revenue_msek} MSEK</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Score Badge */}
        <ScoreBadge score={company.score} />
      </div>

      {/* Pain Points */}
      {company.pain_points?.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          flexWrap: 'wrap', 
          marginBottom: 'var(--space-md)',
        }}>
          {company.pain_points.slice(0, 2).map((p, i) => (
            <span key={i} style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontWeight: 500,
            }}>
              {p}
            </span>
          ))}
          {company.pain_points.length > 2 && (
            <span style={{ 
              fontSize: 11, 
              padding: '4px 10px', 
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}>
              +{company.pain_points.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: 'var(--space-sm)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ 
          fontSize: 12, 
          color: 'var(--text-muted)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          flex: 1,
          minWidth: 0,
        }}>
          <span style={{ 
            fontSize: 8, 
            color: company.urgency === 'high' 
              ? 'var(--success)' 
              : company.urgency === 'medium' 
              ? 'var(--warning)' 
              : 'var(--text-muted)',
          }}>
            ●
          </span>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {company.sales_angle || 'Not analyzed yet'}
          </span>
        </div>
        {company.crm_synced_at && (
          <span className="badge badge-success" style={{
            fontSize: 10,
            marginLeft: 8,
          }}>
            CRM ✓
          </span>
        )}
      </div>
    </div>
  )
}
