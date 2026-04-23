import { createServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PaymentsPage() {
  const supabase = createServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [{ data: payments }, { data: leases }] = await Promise.all([
    supabase.from('payments')
      .select(`
        *,
        tenant:tenants(first_name, last_name, email),
        unit:units(unit_number, property:properties(name))
      `)
      .eq('period_month', month)
      .eq('period_year', year)
      .order('payment_date', { ascending: false }),

    supabase.from('leases')
      .select('id, tenant_id, rent_amount, tenant:tenants(first_name, last_name), unit:units(unit_number, property:properties(name))')
      .eq('status', 'active'),
  ])

  const totalExpected  = leases?.reduce((s, l) => s + Number(l.rent_amount), 0) || 0
  const totalCollected = payments?.filter(p => p.type === 'rent').reduce((s, p) => s + Number(p.amount), 0) || 0
  const totalLateFees  = payments?.filter(p => p.type === 'late_fee').reduce((s, p) => s + Number(p.amount), 0) || 0
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

  const methodColors: Record<string, { bg: string; color: string; border: string }> = {
    ach:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
    card:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    check: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    cash:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    zelle: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
    other: { bg: '#f4f4f5', color: '#52525b', border: '#e4e4e7' },
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Rent & Payments</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {now.toLocaleString('default', { month: 'long' })} {year} · {collectionRate}% collected
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/payments/record"
                className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium text-white"
                style={{ background: '#16a37f' }}>
            + Record Payment
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Expected</div><div className="text-[20px] font-bold">${totalExpected.toLocaleString()}</div><div className="text-[10px] text-gray-400 mt-0.5">This month</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Collected</div><div className="text-[20px] font-bold" style={{ color: '#15803d' }}>${totalCollected.toLocaleString()}</div><div className="text-[10px] text-gray-400 mt-0.5">{payments?.filter(p=>p.type==='rent').length || 0} payments</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Outstanding</div><div className="text-[20px] font-bold" style={{ color: '#d97706' }}>${Math.max(0, totalExpected-totalCollected).toLocaleString()}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Collection Rate</div><div className="text-[20px] font-bold">{collectionRate}%</div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5"><div className="h-full rounded-full" style={{ width:`${collectionRate}%`, background: collectionRate>=80?'#16a37f':collectionRate>=50?'#d97706':'#dc2626' }}/></div></div>
        </div>

        {/* Payments table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400">Payment History</span>
            <span className="text-[11px] text-gray-400 font-mono">{payments?.length || 0} transactions</span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Date','Tenant','Unit','Method','Type','Amount','Reference'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-400 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments?.map(p => {
                const mc = methodColors[p.method] || methodColors.other
                return (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500">
                      {new Date(p.payment_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] font-medium">{p.tenant?.first_name} {p.tenant?.last_name}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[12px] text-gray-600">Unit {p.unit?.unit_number}</div>
                      <div className="text-[11px] text-gray-400">{p.unit?.property?.name}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="badge text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
                            style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                        {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] capitalize text-gray-500">{p.type.replace('_',' ')}</span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold font-mono text-[13px]" style={{ color: '#15803d' }}>
                      ${Number(p.amount).toLocaleString('en-US',{minimumFractionDigits:2})}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-gray-400">{p.reference || '—'}</td>
                  </tr>
                )
              })}
              {(!payments || payments.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[12px] text-gray-400">No payments recorded this month</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
