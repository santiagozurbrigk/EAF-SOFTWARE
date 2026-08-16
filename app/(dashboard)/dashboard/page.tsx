import type { Metadata } from 'next'
import {
  DollarSign,
  Users,
  Radio,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Dashboard' }

// TODO Sprint 2: Reemplazar con datos reales de Supabase + Meta Ads API
const MOCK_METRICS = {
  blendedROAS:   { value: '—',    subtitle: 'Conectar Meta Ads para ver dato' },
  dailySpend:    { value: '—',    subtitle: 'Sin campaña activa' },
  warmAudience:  { value: '—',    subtitle: 'Espectro 365 días' },
  cpmSintonizador: { value: '—',  subtitle: 'Objetivo: < $0.01' },
  showRate:      { value: '—',    subtitle: 'Objetivo: > 80%' },
  activeCalls:   { value: '—',    subtitle: 'Llamadas en ventana 72hs' },
}

const FUNNEL_STAGES = [
  { label: 'Tráfico Frío',          module: 'Sintonizador',  color: 'bg-blue-500',    pct: 100 },
  { label: 'Espectro Tibio 365d',   module: 'Warm Bucket',   color: 'bg-blue-400',    pct: 60  },
  { label: 'Filtro de Banda (25%)', module: 'Blackhole',     color: 'bg-violet-500',  pct: 30  },
  { label: 'VSL / Aplicación',      module: 'Conversión',    color: 'bg-violet-400',  pct: 12  },
  { label: 'Llamada Agendada',       module: 'B:52',          color: 'bg-amber-500',   pct: 7   },
  { label: 'Venta Cerrada',         module: 'CRM',           color: 'bg-emerald-500', pct: 2   },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Frecuencia e intensidad del sistema EAF en tiempo real.
        </p>
      </div>

      {/* KPI Hero Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="ROAS Blended"
          value={MOCK_METRICS.blendedROAS.value}
          subtitle={MOCK_METRICS.blendedROAS.subtitle}
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
        <MetricCard
          title="Spend Diario · Sintonizador"
          value={MOCK_METRICS.dailySpend.value}
          subtitle={MOCK_METRICS.dailySpend.subtitle}
          icon={Radio}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Audiencia Tibia"
          value={MOCK_METRICS.warmAudience.value}
          subtitle={MOCK_METRICS.warmAudience.subtitle}
          icon={Users}
          iconColor="text-violet-400"
        />
        <MetricCard
          title="CPM Sintonizador"
          value={MOCK_METRICS.cpmSintonizador.value}
          subtitle={MOCK_METRICS.cpmSintonizador.subtitle}
          icon={TrendingUp}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Show Rate"
          value={MOCK_METRICS.showRate.value}
          subtitle={MOCK_METRICS.showRate.subtitle}
          icon={Zap}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Llamadas Activas B:52"
          value={MOCK_METRICS.activeCalls.value}
          subtitle={MOCK_METRICS.activeCalls.subtitle}
          icon={Target}
          iconColor="text-rose-400"
        />
      </div>

      {/* Fila: Tanque de Agua + Funnel */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Tanque de Agua */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🪣 Tanque de Agua</CardTitle>
            <CardDescription>
              Crecimiento del Espectro Tibio Consolidado 365 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {/* Placeholder — Sprint 2: Recharts AreaChart con datos reales */}
              {[20, 35, 28, 50, 45, 60, 55, 72, 68, 85, 80, 95].map((h, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-sm bg-blue-500/30 transition-all"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Sprint 2: datos reales de Meta Ads API</span>
              <Badge variant="outline" className="text-[10px]">Preview</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Funnel de Frecuencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎯 Embudo de Frecuencias</CardTitle>
            <CardDescription>
              Flujo de leads por cada etapa del sistema EAF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FUNNEL_STAGES.map((stage) => (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="font-mono text-muted-foreground/60">
                    {stage.module}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color} opacity-70`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-2 text-[10px] text-muted-foreground">
              Sprint 2: datos reales de audiencias Meta + GHL pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de módulos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del Sistema</CardTitle>
          <CardDescription>
            Conectá las integraciones para activar cada módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: '📡 Sintonizador',   status: 'not_configured' },
              { name: '🎛️ Filtro de Banda', status: 'not_configured' },
              { name: '⚡ B:52',            status: 'not_configured' },
              { name: '☄️ Lazarus',         status: 'not_configured' },
            ].map((m) => (
              <div
                key={m.name}
                className="rounded-lg border border-border bg-muted/50 p-3 text-center"
              >
                <p className="text-xs font-medium">{m.name}</p>
                <Badge variant="outline" className="mt-1.5 text-[10px]">
                  Sin configurar
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
