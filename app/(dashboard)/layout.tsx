'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import clsx from 'clsx'

const nav = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: GridIcon },
    ]
  },
  {
    label: 'Portfolio',
    items: [
      { href: '/properties', label: 'Properties', icon: HomeIcon },
      { href: '/tenants',    label: 'Tenants',    icon: UsersIcon },
      { href: '/payments',   label: 'Rent & Payments', icon: CardIcon },
    ]
  },
  {
    label: 'Operations',
    items: [
      { href: '/maintenance', label: 'Maintenance', icon: WrenchIcon, badge: 'urgent' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { href: '/gl',      label: 'General Ledger', icon: LedgerIcon },
      { href: '/gl#reports', label: 'Reports', icon: ChartIcon },
    ]
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── SIDEBAR ── */}
      <aside className="w-56 flex flex-col flex-shrink-0 overflow-y-auto"
             style={{ background: '#0c1714', borderRight: '1px solid rgba(255,255,255,.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[18px]"
             style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ background: '#16a37f', boxShadow: '0 2px 8px rgba(22,163,127,.35)' }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L1 6v9h5v-5h4v5h5V6L8 1z"/>
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-bold text-white tracking-tight">Vera PM</div>
            <div className="text-[9px] tracking-widest font-mono" style={{ color: '#7fa89e' }}>VERAPM.AI</div>
          </div>
        </div>

        {/* Org */}
        <div className="mx-2.5 mt-2.5 rounded px-2.5 py-2"
             style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
          <div className="text-[12px] text-white font-medium">My Portfolio</div>
          <div className="text-[10px] mt-0.5" style={{ color: '#7fa89e' }}>Owner · Admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1.5">
          {nav.map(section => (
            <div key={section.label} className="py-1">
              <div className="px-4 pb-1 text-[9px] font-semibold uppercase tracking-[1.2px]"
                   style={{ color: 'rgba(127,168,158,.4)' }}>
                {section.label}
              </div>
              {section.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href}
                        className={clsx(
                          'flex items-center gap-2 px-4 py-[7px] text-[12.5px] border-l-2 transition-all duration-100',
                          isActive
                            ? 'text-[#e8f5f1] font-medium border-[#16a37f]'
                            : 'font-normal border-transparent hover:text-[#e8f5f1]'
                        )}
                        style={{
                          color: isActive ? '#e8f5f1' : '#7fa89e',
                          background: isActive ? 'rgba(22,163,127,.14)' : undefined,
                        }}>
                    <item.icon size={14} className={isActive ? 'opacity-100' : 'opacity-65'} />
                    <span>{item.label}</span>
                    {(item as any).badge === 'urgent' && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-px rounded-full font-mono"
                            style={{ background: '#dc2626', color: 'white' }}>!</span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
          <button onClick={handleSignOut} disabled={signingOut}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-colors"
                  style={{ color: '#7fa89e' }}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background='')}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#16a37f,#0d7a5f)' }}>JR</div>
            <div className="text-left min-w-0">
              <div className="text-[12px] text-white font-medium truncate">John Rivera</div>
              <div className="text-[10px] truncate" style={{ color: '#7fa89e' }}>john@verapm.ai</div>
            </div>
            <span className="ml-auto text-[10px]">{signingOut ? '...' : '→'}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────
function GridIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <rect x="1" y="1" width="6" height="6" rx="1.5"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5"/>
  </svg>
}
function HomeIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 1L1 6v9h5v-5h4v5h5V6L8 1z"/>
  </svg>
}
function UsersIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <circle cx="8" cy="5" r="3"/>
    <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6"/>
  </svg>
}
function CardIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <rect x="1" y="3" width="14" height="10" rx="2"/>
    <path d="M1 7h14" stroke="white" strokeWidth="1.3"/>
  </svg>
}
function WrenchIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M13.5 2.5l-1 1-1-1-1 1 1 1-6 6 1 1 6-6 1 1 1-1z"/>
  </svg>
}
function LedgerIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M3 1h10a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1z"/>
    <line x1="5" y1="6" x2="11" y2="6" stroke="white" strokeWidth="1.2"/>
    <line x1="5" y1="9" x2="11" y2="9" stroke="white" strokeWidth="1.2"/>
    <line x1="5" y1="12" x2="8" y2="12" stroke="white" strokeWidth="1.2"/>
  </svg>
}
function ChartIcon({ size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className}>
    <path d="M1 14l4-4 3 3 4-5 3 2"/>
  </svg>
}
