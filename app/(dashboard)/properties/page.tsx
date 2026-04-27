import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PropertiesPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      *,
      units (id, status, rent_amount)
    `)
    .order('name')

  const stats = properties?.reduce((acc, p) => {
    const units  = p.units || []
    const occ    = units.filter((u: any) => u.status === 'occupied').length
    const rent   = units.filter((u: any) => u.status === 'occupied').reduce((s: number, u: any) => s + Number(u.rent_amount), 0)
    return {
      totalUnits:  acc.totalUnits  + units.length,
      occupied:    acc.occupied    + occ,
      monthlyRent: acc.monthlyRent + rent,
    }
  }, { totalUnits: 0, occupied: 0, monthlyRent: 0 })

  const occupancyPct = stats && stats.totalUnits
    ? Math.round((stats.occupied / stats.totalUnits) * 100)
    : 0

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[15px] font-semibold tracking-tight">Properties</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{properties?.length || 0} properties · {stats?.totalUnits || 0} units</div>
        </div>
        <Link href="/properties/new"
              className="inline-flex items-center gap-1.5 px-3.5 h-[34px] rounded-md text-[12.5px] font-medium text-white transition-all"
              style={{ background: '#16a37f' }}>
          + Add Property
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Properties</div><div className="text-[22px] font-bold">{properties?.length || 0}</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Total Units</div><div className="text-[22px] font-bold">{stats?.totalUnits || 0}</div><div className="text-[10px] text-gray-400 mt-0.5">{(stats?.totalUnits||0)-(stats?.occupied||0)} vacant</div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Occupancy</div><div className="text-[22px] font-bold">{occupancyPct}%</div><div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1.5"><div className="h-full rounded-full" style={{ width: `${occupancyPct}%`, background: '#16a37f' }}/></div></div>
          <div className="card p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.4px] text-gray-400 mb-1.5">Monthly Rent</div><div className="text-[20px] font-bold">${(stats?.monthlyRent||0).toLocaleString()}</div><div className="text-[10px] text-gray-400 mt-0.5">Occupied units</div></div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Property','Type','Units','Occupancy','Monthly Rent',''].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.5px] text-gray-400 border-b border-gray-100 bg-gray-50">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties?.map(p => {
                const units  = p.units || []
                const occ    = units.filter((u: any) => u.status === 'occupied').length
                const pct    = units.length ? Math.round((occ / units.length) * 100) : 0
                const rent   = units.filter((u: any) => u.status === 'occupied').reduce((s: number, u: any) => s + Number(u.rent_amount), 0)
                return (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.address}, {p.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge text-[10.5px] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                        {p.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-600">{units.length}/{p.total_units}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium">{pct}%</span>
                        <div className="flex-1 min-w-[50px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#16a37f' }}/>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[13px]">${rent.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/properties/${p.id}`}
                            className="text-[11px] px-2.5 py-1.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all">
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
