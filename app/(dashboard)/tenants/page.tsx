import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TenantsPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const in60  = new Date(Date.now() + 60*86400000).toISOString().split('T')[0]

  const { data: leases } = await supabase
    .from('leases')
    .select(`
      *,
      tenant:tenants(*),
      unit:units(unit_number, property:properties(name))
    `)
    .eq('status', 'active')
    .order('end_date', { ascending: true, nullsFirst: false })

  function leaseStatus(lease: any) {
    if (lease.type === 'month_to_month') return { label: 'Month-to-Month', color: '#7e22ce', bg: '#f5f3ff', border: '#ddd6fe' }
    if (!lease.end_date) return { label: 'MTM', color: '#7e22ce', bg: '#f5f3ff', border: '#ddd6fe' }
    const days = Math.round((new Date(lease.end_date).getTime() - Date.now()) / 86400000)
    if (days < 0)  return { label: 'Expired', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' }
    if (days <= 60) return { label: `Exp. ${days}d`, color: '#b45309', bg: '#fffbeb', border: '#fde68a' }
    return { label: 'Active', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' }
  }

  const expiring = (leases as any[])?.filter((l: any) => {
    if (!l.end_date) return false
    const d = new Date(l.end_date)
    return d >= new Date(today) && d <= new Date(in60)
  }).length || 0

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Tenants</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{(leases as any[])?.length || 0} active leases · {expiring} expiring within 60 days</div>
        </div>
        <Link href="/tenants/new"
              className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium text-white"
              style={{ background: '#16a37f' }}>
          + Add Tenant
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Tenant','Unit / Property','Lease Period','Status','Rent','Deposit',''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-400 border-b border-gray-100 bg-gray-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(leases as any[])?.map((lease: any) => {
                const t  = lease.tenant
                const st = leaseStatus(lease)
                const ini = ((t.first_name[0]||'') + (t.last_name[0]||'')).toUpperCase()
                const fd = (d: string) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
                return (
                  <tr key={lease.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${st.label.startsWith('Exp')?' bg-amber-50/40':''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                             style={{ background: '#e8f5f1', color: '#16a37f' }}>{ini}</div>
                        <div>
                          <div className="text-[13px] font-medium">{t.first_name} {t.last_name}</div>
                          <div className="text-[11px] text-gray-400">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium">Unit {lease.unit?.unit_number}</div>
                      <div className="text-[11px] text-gray-400">{lease.unit?.property?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[11px] text-gray-600">{fd(lease.start_date)}</div>
                      <div className="font-mono text-[11px] text-gray-400">{lease.type==='month_to_month'?'Month-to-Month':fd(lease.end_date)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge text-[10.5px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[13px]">${Number(lease.rent_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-600">${Number(lease.deposit_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/tenants/${t.id}`}
                            className="text-[11px] px-2.5 py-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
