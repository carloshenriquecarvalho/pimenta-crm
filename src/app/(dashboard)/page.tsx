import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import { startOfMonth, endOfMonth, startOfYear, subMonths, format, startOfWeek, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Target, DollarSign, Users, BarChart3 } from 'lucide-react'
import { DealsByOwnerChart, FunnelChart_, WeeklyDealsChart } from './components/KpiCharts'
import { PeriodFilter } from './components/PeriodFilter'

interface Props {
  searchParams: { period?: string }
}

function getPeriodRange(period: string): { start: Date; end: Date } {
  const now = new Date()
  switch (period) {
    case 'last_month':
      const lm = subMonths(now, 1)
      return { start: startOfMonth(lm), end: endOfMonth(lm) }
    case 'last_3_months':
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) }
    case 'this_year':
      return { start: startOfYear(now), end: endOfMonth(now) }
    case 'this_month':
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v)
}

export default async function DashboardPage({ searchParams: searchParamsPromise }: Props) {
  const searchParams = await searchParamsPromise
  const supabase = await createClient()
  const period = searchParams.period || 'this_month'
  const { start, end } = getPeriodRange(period)

  const startIso = start.toISOString()
  const endIso = end.toISOString()

  const [allDealsRes, periodDealsRes, stagesRes, usersRes] = await Promise.all([
    supabase.from('deals').select('*').eq('status', 'open'),
    supabase.from('deals').select('*, owner:profiles!deals_owner_id_fkey(full_name)').gte('created_at', startIso).lte('created_at', endIso),
    supabase.from('stages').select('*'),
    supabase.from('profiles').select('*'),
  ])

  const allOpenDeals = allDealsRes.data || []
  const periodDeals = periodDealsRes.data || []
  const stages = stagesRes.data || []
  const users = usersRes.data || []

  // KPIs
  const totalOpen = allOpenDeals.length
  const totalOpenValue = allOpenDeals.reduce((s, d) => s + (d.value || 0), 0)

  const wonDeals = periodDeals.filter(d => d.status === 'won')
  const lostDeals = periodDeals.filter(d => d.status === 'lost')
  const wonCount = wonDeals.length
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0)
  const lostCount = lostDeals.length
  const conversionRate = (wonCount + lostCount) > 0
    ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1)
    : '—'
  const avgTicket = wonCount > 0 ? wonValue / wonCount : 0

  // Deals por responsável
  const byOwner: Record<string, { name: string; deals: number; value: number }> = {}
  periodDeals.forEach(d => {
    const key = (d as any).owner?.full_name || 'Sem responsável'
    if (!byOwner[key]) byOwner[key] = { name: key, deals: 0, value: 0 }
    byOwner[key].deals++
    byOwner[key].value += d.value || 0
  })
  const ownerChartData = Object.values(byOwner)

  // Funil de conversão por stage
  const byStage: Record<string, number> = {}
  allOpenDeals.forEach(d => {
    if (d.stage_id) {
      byStage[d.stage_id] = (byStage[d.stage_id] || 0) + 1
    }
  })
  const funnelData = stages
    .sort((a, b) => a.position - b.position)
    .map(s => ({
      name: s.name,
      deals: byStage[s.id] || 0,
      color: s.color,
    }))
    .filter(s => s.deals > 0)

  // Weekly deals (últimas 12 semanas)
  const weeklyData: { week: string; deals: number }[] = []
  const weeksToShow = period === 'last_3_months' || period === 'this_year' ? 12 : 4
  for (let i = weeksToShow - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subMonths(new Date(), 0) )
    const ws = addDays(weekStart, -i * 7)
    const we = addDays(ws, 6)
    const count = periodDeals.filter(d => {
      const created = new Date(d.created_at)
      return created >= ws && created <= we
    }).length
    weeklyData.push({
      week: format(ws, 'dd/MM', { locale: ptBR }),
      deals: count,
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral de performance do time de vendas.</p>
        </div>
        <Suspense>
          <PeriodFilter currentPeriod={period} />
        </Suspense>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Deals Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalOpen}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{fmt(totalOpenValue)} em negociação</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" /> Ganhos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{wonCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{fmt(wonValue)} fechados</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" /> Perdidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{lostCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">no período</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-500" /> Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">ganhos / (ganhos + perdidos)</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-amber-500" /> Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{fmt(avgTicket)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">por deal ganho</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Deals por Responsável</CardTitle>
          </CardHeader>
          <CardContent>
            <DealsByOwnerChart data={ownerChartData} />
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Funil de Conversão por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart_ data={funnelData} />
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Deals Criados por Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyDealsChart data={weeklyData} />
        </CardContent>
      </Card>
    </div>
  )
}
