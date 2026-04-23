import { createServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const PRIORITY_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  urgent: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  high:   { color: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  medium: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  low:    { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
}
const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  open:          { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  in_progress:   { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  scheduled:     { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  pending_parts: { color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  completed:     { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  closed:        { color: '#52525b', bg: '#f4f4f5', border: '#e4e4e7' },
}
const CAT_ICON: Record<string, string> = {
  plumbing: '🔧', electrical: '⚡', hvac: '❄️', appliance: '🏠',
  structural: '🏗️', pest: '🐛', landscaping: '🌿', other: '🔨',
}

export default async function MaintenancePage() {
  const supabase = createServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: tickets } = await supabase
    .from('maintenance_tickets')
    .select(`
      *,
      property:properties(name),
      unit:units(unit_number),
      tenant:tenants(first_name, last_name),
      vendor:vendors(company_name)
    `)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })

  const open      = tickets?.filter(t => t.status === 'open').length || 0
  const inProg    = tickets?.filter(t => t.status === 'in_progress').length || 0
  const urgent    = tickets?.filter(t => t.priority === 'urgent' && !['completed','closed'].includes(t.status)).length || 0
  const completed = tickets?.filter(t => t.status === 'completed').length || 0
  const ytdCost   = tickets?.filter(t => t.actual_cost).reduce((s, t) => s + Number(t.actual_cost), 0) || 0

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Maintenance Requests</div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {(open + inProg)} open · {urgent} urgent
          </div>
        </div>
        <Link href="/maintenance/new"
              className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium text-white"
              style={{ background: '#16a37f' }}>
          + New Ticket
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Open</div><div className="text-[22px] font-bold">{open}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">In Progress</div><div className="text-[22px] font-bold" style={{ color: '#d97706' }}>{inProg}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Urgent</div><div className="text-[22px] font-bold" style={{ color: '#dc2626' }}>{urgent}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Completed</div><div className="text-[22px] font-bold" style={{ color: '#15803d' }}>{completed}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">YTD Costs</div><div className="text-[18px] font-bold">${ytdCost.toLocaleString()}</div></div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Ticket','Property / Unit','Category','Priority','Status','Assigned To','Due',''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-400 border-b border-gray-100 bg-gray-50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets?.map(t => {
                const ps  = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.medium
                const ss  = STATUS_STYLE[t.status]     || STATUS_STYLE.open
                const overdue = t.due_date && new Date(t.due_date) < new Date() && !['completed','closed'].includes(t.status)
                return (
                  <tr key={t.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${t.priority==='urgent'?'bg-red-50/30':''}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-[10px] text-gray-400 mb-0.5">{t.id.substring(0,8).toUpperCase()}</div>
                      <div className="text-[12.5px] font-medium leading-tight max-w-[200px] truncate">{t.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{t.tenant ? `${t.tenant.first_name} ${t.tenant.last_name}` : '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium">{t.property?.name}</div>
                      <div className="text-[11px] text-gray-400">Unit {t.unit?.unit_number}</div>
                    </td>
                    <td className="px-4 py-3 text-[13px]">
                      {CAT_ICON[t.category] || '🔨'} <span className="text-[12px] text-gray-600 capitalize">{t.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium"
                            style={{ color: ps.color }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ps.color }}/>
                        <span className="capitalize">{t.priority}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge text-[10.5px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">
                      {t.vendor?.company_name || <span className="text-gray-300">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: overdue ? '#dc2626' : '#8a9889' }}>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'}
                      {overdue && ' ⚠'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/maintenance/${t.id}`}
                            className="text-[11px] px-2.5 py-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {(!tickets || tickets.length === 0) && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[12px] text-gray-400">No tickets yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
