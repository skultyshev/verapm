import { createServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const TYPE_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  asset:     { color: '#1d4ed8', bg: '#eff6ff',  border: '#bfdbfe' },
  liability: { color: '#6d28d9', bg: '#f5f3ff',  border: '#ddd6fe' },
  equity:    { color: '#52525b', bg: '#f4f4f5',  border: '#e4e4e7' },
  revenue:   { color: '#15803d', bg: '#f0fdf4',  border: '#bbf7d0' },
  expense:   { color: '#b45309', bg: '#fffbeb',  border: '#fde68a' },
}

export default async function GLPage() {
  const supabase = createServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const [{ data: entriesRaw }, { data: accounts }] = await Promise.all([
    supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_lines(
          id, debit, credit, description,
          account:accounts(account_number, name, type)
        )
      `)
      .eq('is_void', false)
      .order('entry_date', { ascending: false })
      .limit(50),

    supabase
      .from('accounts')
      .select('*')
      .eq('is_active', true)
      .order('account_number'),
  ])

  const entries = (entriesRaw as any[]) ?? []

  // Compute account balances from all lines
  const balances: Record<string, number> = {}
  entries.forEach(je => {
    if (!je.is_posted) return
    je.lines?.forEach((l: any) => {
      const acc = l.account
      if (!acc) return
      const key = l.account_id || acc.account_number
      if (!balances[key]) balances[key] = 0
      balances[key] += acc.normal_balance === 'debit'
        ? (Number(l.debit) - Number(l.credit))
        : (Number(l.credit) - Number(l.debit))
    })
  })

  const totalDr = entries.reduce((s: number, je: any) =>
    s + (je.lines?.reduce((ls: number, l: any) => ls + Number(l.debit), 0) || 0), 0)
  const totalCr = entries.reduce((s: number, je: any) =>
    s + (je.lines?.reduce((ls: number, l: any) => ls + Number(l.credit), 0) || 0), 0)

  const fm = (v: number) => '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">General Ledger</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{entries.length} entries · {accounts?.length || 0} accounts</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/gl?tab=coa" className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all bg-white">
            Chart of Accounts
          </Link>
          <Link href="/gl?tab=reports" className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all bg-white">
            Reports
          </Link>
          <Link href="/gl/new-entry"
                className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium text-white"
                style={{ background: '#16a37f' }}>
            + New Entry
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Account balances by type */}
        <div className="grid grid-cols-5 gap-3">
          {(['asset','liability','equity','revenue','expense'] as const).map(type => {
            const typeAccs = accounts?.filter((a: any) => a.type === type) || []
            const total = typeAccs.reduce((s: number, a: any) => s + (balances[a.id] || 0), 0)
            const ts = TYPE_STYLE[type]
            return (
              <div key={type} className="card p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5 capitalize">{type}</div>
                <div className="text-[18px] font-bold" style={{ color: ts.color }}>{fm(total)}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{typeAccs.length} accounts</div>
              </div>
            )
          })}
        </div>

        {/* Journal Entries */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400">Journal Entries</span>
            <span className="text-[11px] font-mono text-gray-400">
              Dr: {fm(totalDr)} · Cr: {fm(totalCr)} ·{' '}
              {Math.abs(totalDr - totalCr) < 0.01
                ? <span className="text-green-600">✓ Balanced</span>
                : <span className="text-red-600">⚠ Off</span>}
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Date','Reference','Property','Memo','Total Dr','Total Cr','Status',''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-400 border-b border-gray-100 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((je: any) => {
                const dr  = je.lines?.reduce((s: number, l: any) => s + Number(l.debit), 0) || 0
                const cr  = je.lines?.reduce((s: number, l: any) => s + Number(l.credit), 0) || 0
                const bal = Math.abs(dr - cr) < 0.01
                return (
                  <tr key={je.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(je.entry_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{ color: '#16a37f' }}>{je.reference}</td>
                    <td className="px-4 py-3 text-[12px] text-gray-500">{je.property_id ? '—' : 'Portfolio'}</td>
                    <td className="px-4 py-3 text-[12.5px] font-medium max-w-[220px] truncate">{je.memo}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-right">{fm(dr)}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-right" style={{ color: '#15803d' }}>{fm(cr)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10.5px] px-2 py-0.5 rounded-full font-semibold ${
                        je.is_posted && bal
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : je.is_posted
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {je.is_posted ? bal ? 'Posted' : 'Error' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/gl/${je.id}`}
                            className="text-[11px] px-2.5 py-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[12px] text-gray-400">
                    No journal entries yet.{' '}
                    <Link href="/gl/new-entry" className="underline">Create your first entry →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}