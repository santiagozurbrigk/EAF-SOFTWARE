import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  DollarSign,
  Users,
  Radio,
  TrendingUp,
  Zap,
  Target,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/metric-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Dashboard' }

const FUNNEL_STAGES = [
  { label: 'Tráfico Frío',          module: 'Sintonizador',  color: 'bg-blue-500',    pct: 100 },
  { label: 'Espectro Tibio 365d',   module: 'Warm Bucket',   color: 'bg-blue-400',    pct: 60  },
  { label: 'Filtro de Banda (25%)', module: 'Blackhole',     color: 'bg-violet-500',  pct: 30  },
  { label: 'VSL / Aplicación',      module: 'Conversión',    color: 'bg-violet-400',  pct: 12  },
  { label: 'Llamada Agendada',       module: 'B:52',          color: 'bg-amber-500',   pct: 7   },
  { label: 'Venta Cerrada',         module: 'CRM',           color: 'bg-emerald-500', pct: 2   },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ─── Datos reales desde Supabase ────────────────────────────────────────────

  // Org del usuario — tokens de integración
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, meta_oauth_token, ghl_access_token, ghl_location_id, meta_business_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  const metaConnected = Boolean(org?.meta_oauth_token)
  const ghlConnected  = Boolean(org?.ghl_access_token)

  // Conteo de videos en master_videos
  const { count: totalVideos } = await supabase
    .from('master_videos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: winnerVideos } = await supabase
    .from('master_videos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_winner', true)

  // Conteo de pulsos Lazarus por estado (requiere ir por lazarus_campaigns → org)
  let totalQueued = 0
  let totalSent   = 0
  let totalResponded = 0

  if (org?.id) {
    const { data: campaigns } = await supabase
      .from('lazarus_campaigns')
      .select('id')
      .eq('organization_id', org.id)

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map((c) => c.id)

      const { count: queued } = await supabase
        .from('lazarus_pulses')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
        .eq('status', 'queued')

      const { count: sent } = await supabase
        .from('lazarus_pulses')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
        .eq('status', 'sent')

      const { count: responded } = await supabase
        .from('lazarus_pulses')
        .select('id', { count: 'exact', head: true })
        .in('campaign_id', campaignIds)
        .eq('status', 'responded')

      totalQueued    = queued    ?? 0
      totalSent      = sent      ?? 0
      totalResponded = responded ?? 0
    }
  }

  const totalPulses = totalQueued + totalSent + totalResponded
  const responseRate = totalSent > 0
    ? Math.round((totalResponded / totalSent) * 100)
    : null

  // ─── Estado de módulos ───────────────────────────────────────────────────────
  const moduleStatus = [
    {
      name:    '📡 Sintonizador',
      active:  metaConnected && (totalVideos ?? 0) > 0,
      detail:  metaConnected
        ? `${totalVideos ?? 0} videos · ${winnerVideos ?? 0} winners`
        : 'Conectar Meta en Integraciones',
    },
    {
      name:    '🎛️ Filtro de Banda',
      active:  metaConnected,
      detail:  metaConnected ? 'Meta conectado' : 'Conectar Meta en Integraciones',
    },
    {
      name:    '⚡ B:52',
      active:  ghlConnected,
      detail:  ghlConnected ? 'GHL conectado' : 'Conectar GHL en Integraciones',
    },
    {
      name:    '☄️ Lazarus',
      active:  ghlConnected && totalPulses > 0,
      detail:  ghlConnected
        ? `${totalQueued} en cola · ${totalSent} enviados`
        : 'Conectar GHL en Integraciones',
    },
  ]

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
      {/* 🔑 ROAS, Spend y Audience requieren Meta Ads API (Sprint 3) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="ROAS Blended"
          value="—"
          subtitle={metaConnected ? 'Requiere Meta Ads API — Sprint 3' : 'Conectar Meta Ads para ver dato'}
          icon={DollarSign}
          iconColor="text-emerald-400"
        />
        <MetricCard
          title="Spend Diario · Sintonizador"
          value="—"
          subtitle={metaConnected ? 'Requiere Meta Ads API — Sprint 3' : 'Sin campaña activa'}
          icon={Radio}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Audiencia Tibia"
          value="—"
          subtitle={metaConnected ? 'Requiere Meta Ads API — Sprint 3' : 'Espectro 365 días'}
          icon={Users}
          iconColor="text-violet-400"
        />
        <MetricCard
          title="Videos Reels · SDC"
          value={String(totalVideos ?? 0)}
          subtitle={`${winnerVideos ?? 0} winners detectados`}
          icon={TrendingUp}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Tasa de Respuesta · Lazarus"
          value={responseRate !== null ? `${responseRate}%` : '—'}
          subtitle={
            totalSent > 0
              ? `${totalResponded} de ${totalSent} leads respondieron`
              : 'Sin pulsos enviados aún'
          }
          icon={Zap}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Pulsos en Cola · Lazarus"
          value={String(totalQueued)}
          subtitle={`${totalSent} enviados · ${totalResponded} reactivados`}
          icon={Target}
          iconColor="text-rose-400"
        />
      </div>

      {/* Fila: Tanque de Agua + Funnel */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tanque de Agua — placeholder hasta Sprint 3 con Meta Ads API */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🪣 Tanque de Agua</CardTitle>
            <CardDescription>
              Crecimiento del Espectro Tibio Consolidado 365 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
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
              <span>
                {metaConnected
                  ? 'Meta conectado — datos de audiencia disponibles en Sprint 3'
                  : 'Conectar Meta Ads para ver datos reales'}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {metaConnected ? 'Meta ✓' : 'Sin datos'}
              </Badge>
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
              Sprint 3: datos reales de audiencias Meta + pipeline GHL
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de módulos — datos reales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado del Sistema</CardTitle>
          <CardDescription>
            Módulos activos según las integraciones conectadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {moduleStatus.map((m) => (
              <div
                key={m.name}
                className={`rounded-lg border p-3 text-center ${
                  m.active
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border bg-muted/50'
                }`}
              >
                <p className="text-xs font-medium">{m.name}</p>
                <div className="mt-1.5 flex items-center justify-center gap-1">
                  {m.active
                    ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    : <XCircle className="h-3 w-3 text-muted-foreground" />}
                  <Badge
                    variant={m.active ? 'success' : 'outline'}
                    className="text-[10px]"
                  >
                    {m.active ? 'Activo' : 'Sin configurar'}
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{m.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
