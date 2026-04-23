import { createServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Fetch portfolio stats in parallel
  const [
    { count: propCount },
    { count: unitCount },
    { count: tenantCount },
    { count: openTickets },
    { data: vacantUnits },
    { data: expiringLeases },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('units').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('maintenance_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']),
    supabase.from('units')
      .select('id')
      .eq('status', 'vacant'),
    supabase.from('leases')
      .select('id, end_date, tenant:tenants(first_name, last_name), unit:units(unit_number, property:properties(name))')
      .eq('status', 'active')
      .not('end_date', 'is', null)
      .lte('end_date', new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0])
      .order('end_date'),
    supabase.from('payments')
      .select('id, amount, payment_date, method, tenant:tenants(first_name, last_name)')
      .order('payment_date', { ascending: false })
      .limit(5),
  ])

  const occupiedCount = (unitCount || 0) - (vacantUnits?.length || 0)
  const occupancyPct  = unitCount ? Math.round((occupiedCount / unitCount) * 100) : 0

  const stats = [
    { label: 'Properties',    value: propCount || 0,    sub: 'In portfolio' },
    { label: 'Total Units',   value: unitCount || 0,    sub: `${vacantUnits?.length || 0} vacant` },
    { label: 'Occupancy',     value: `${occupancyPct}%`, sub: `${occupiedCount} occupied` },
    { label: 'Open Tickets',  value: openTickets || 0,   sub: 'Maintenance', accent: (openTickets || 0) > 0 ? '#dc2626' : undefined },
  ]

  return (
    <>
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Dashboard</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Portfolio overview</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="card p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">{s.label}</div>
              <div className="text-[22px] font-bold tracking-tight" style={{ color: s.accent || '#111612' }}>{s.value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiring leases */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400">Leases Expiring (60 days)</span>
            </div>
            {expiringLeases && expiringLeases.length > 0 ? (
              expiringLeases.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 text-[12.5px]">
                  <div>
                    <div className="font-medium">{l.tenant?.first_name} {l.tenant?.last_name}</div>
                    <div className="text-[11px] text-gray-400">Unit {l.unit?.unit_number} · {l.unit?.property?.name}</div>
                  </div>
                  <div className="text-[11px] font-mono text-amber-600 font-medium">
                    {new Date(l.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[12px] text-gray-400">No leases expiring in the next 60 days</div>
            )}
          </div>

          {/* Recent payments */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400">Recent Payments</span>
            </div>
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0 text-[12.5px]">
                  <div>
                    <div className="font-medium">{p.tenant?.first_name} {p.tenant?.last_name}</div>
                    <div className="text-[11px] text-gray-400 capitalize">{p.method} · {new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div className="font-semibold font-mono text-green-700">
                    ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[12px] text-gray-400">No payments recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
