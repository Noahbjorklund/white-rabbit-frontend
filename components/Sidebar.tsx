'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { section: 'Prospecting', items: [
    { label: 'Prospects', href: '/prospects', icon: '◆' },
    { label: 'Prospektering', href: '/search', icon: '◆' },
    { label: 'Companies', href: '/companies', icon: '◆' },
    { label: 'Contacts', href: '/contacts', icon: '◆' },
  ]},
  { section: 'Pipeline', items: [
    { label: 'Pipeline', href: '/pipeline', icon: '◆' },
    { label: 'Meetings', href: '/meetings', icon: '◆' },
    { label: 'Follow-ups', href: '/followups', icon: '◆', badge: 7 },
  ]},
  { section: 'Intelligence', items: [
    { label: 'AI Insights', href: '/insights', icon: '◆' },
    { label: 'Settings', href: '/settings', icon: '◆' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      minWidth: 'var(--sidebar-w)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          letterSpacing: '0.02em',
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}>
          White Rabbit OS
        </div>
        <div style={{ 
          fontSize: 11, 
          color: 'var(--text-muted)', 
          letterSpacing: '0.01em',
        }}>
          Operational Intelligence
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
        {nav.map(group => (
          <div key={group.section} style={{ marginBottom: 24 }}>
            <div style={{ 
              fontSize: 10, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              color: 'var(--text-muted)', 
              padding: '0 20px 8px',
              fontWeight: 600,
            }}>
              {group.section}
            </div>
            <div style={{ padding: '0 12px' }}>
              {group.items.map(item => {
                const active = path.startsWith(item.href)
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: active ? 'var(--accent-light)' : 'transparent',
                      border: active ? '1px solid var(--accent)' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      marginBottom: 2,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--surface)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: 10, 
                      opacity: active ? 1 : 0.5,
                      color: active ? 'var(--accent)' : 'inherit',
                    }}>
                      {item.icon}
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {'badge' in item && item.badge && (
                      <span className="badge badge-warning" style={{
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid var(--border)', 
        fontSize: 11, 
        color: 'var(--text-muted)',
        fontWeight: 500,
      }}>
        <div style={{ opacity: 0.6 }}>White Rabbit OS™</div>
        <div style={{ opacity: 0.4, fontSize: 10, marginTop: 2 }}>v0.1.0</div>
      </div>
    </aside>
  )
}
