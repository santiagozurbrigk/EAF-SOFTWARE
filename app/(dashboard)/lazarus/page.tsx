import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Flame, Clock, MessageSquare, TrendingUp, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/metric-card'
import { DispatchButton } from './dispatch-button'

export const metadata: Metadata = { title: 'Lazarus · Emisor de Pulsos' }

const assetLabels: Record<string, string> = {
  pdf_case_study:  '📄 PDF Case Study (P&L)',
  video_breakout:  '🎬 Video Breakout',
  spreadsheet_roi: '📊 ROI Spreadsheet',
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'outline' | 'pending' }> = {
  queued:    { label: 'En cola',    variant: 'warning'  },
  sent:      { label: 'Enviado',    variant: 'success'  },
  responded: { label: 'Respondió', variant: 'success'  },
  failed:    { label: 'Falló',      variant: 'outline'  },
}

function buildSuggestedMessage(leadName: string): string {
  const firstName = leadName.split(' ')[0]
  return `Sé que andamos todos a mil con mil cosas, así que cero drama por la colgada, ${firstName}. Te quería compartir algo que preparé: el P&L real de uno de nuestros casos de Amazon. ¿Te lo mando por acá o preferís por mail?`
}

function formatScheduled(iso: string): string {
  const now  = new Date()
  const date = new Date(iso)
  const diff = date.getTime() - now.getTime()

  if (diff <= 0) return 'Listo para enviar'

  const hours = Math.floor(diff / 1000 / 60 / 60)
  if (hours < 24) return `En ${hours}h`

  const days = Math.floor(hours / 24)
  return `En ${days}d`
}

export default async function LazarusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Org del usuario
  const { data: org } = await supabase
    .from('organizations')
    .select('id, ghl_access_token, ghl_location_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  const ghlConnected = Boolean(org?.ghl_access_token)

  // Pulsos reales desde Supabase
  let pulses: Array<{
    id: string
    lead_name: string
    lead_email: string
    lead_id: string
    lead_phone: string | null
    asset_offered: string
    status: string
    scheduled_for: string
    sent_at: string | null
    responded_at: string | null
  }> = []

  if (org?.id) {
    const { data: campaigns } = await supabase
      .from('lazarus_campaigns')
      .select('id')
      .eq('organization_id', org.id)

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map((c) => c.id)

      const { data: rawPulses } = await supabase
        .from('lazarus_pulses')
        .select('id, lead_name, lead_email, lead_id, lead_phone, asset_offered, status, scheduled_for, sent_at, responded_at')
        .in('campaign_id', campaignIds)
        .order('scheduled_for', { ascending: true })
        .limit(50)

      pulses = rawPulses ?? []
    }
  }

  const totalQueued    = pulses.filter((p) => p.status === 'queued').length
  const totalSent      = pulses.filter((p) => p.status === 'sent').length
  const totalResponded = pulses.filter((p) => p.status === 'responded').length
  const responseRate   = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : null

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Flame}
        iconColor="text-rose-400"
        name="Emisor de Pulsos"
        codename="Lazarus"
        description='Reactiva leads fríos, no-shows y ghosters mediante "anzuelos de valor" automatizados. Sin seguimiento egoísta — solo valor sin fricción.'
        status={ghlConnected ? 'active' : 'not_configured'}
      />

      {/* Setup si GHL no conectado */}
      {!ghlConnected && (
        <Card className="border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-rose-500/20 p-1.5">
                <Flame className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-300">Para activar Lazarus</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Conectá tu cuenta de GoHighLevel en{' '}
                  <a href="/integrations" className="text-rose-400 hover:underline">Integraciones</a>.
                  Lazarus recibirá los no-shows y ghosters de tu pipeline via webhook.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Lazarus — datos reales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="Tasa de Respuesta"
          value={responseRate !== null ? `${responseRate}%` : '—'}
          subtitle={
            totalSent > 0
              ? `${totalResponded} de ${totalSent} leads respondieron`
              : 'Objetivo: > 50% con PDF P&L'
          }
          icon={TrendingUp}
          iconColor="text-rose-400"
        />
        <MetricCard
          title="Pulsos en Cola"
          value={String(totalQueued)}
          subtitle="Pendientes de envío"
          icon={Clock}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Leads Reactivados"
          value={String(totalResponded)}
          subtitle={totalSent > 0 ? `De ${totalSent} enviados este ciclo` : 'Pasaron a llamada este mes'}
          icon={MessageSquare}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Cola de Leads Inactivos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">🧊 Cola de Leads Inactivos</CardTitle>
              <CardDescription>
                Leads detectados por GHL webhook — ghosters, no-shows o sin respuesta &gt;7 días
              </CardDescription>
            </div>
            {totalQueued > 0 && (
              <Badge variant="pending">{totalQueued} pendiente{totalQueued > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pulses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full bg-muted p-4">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">La cola está vacía</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ghlConnected
                    ? 'Cuando GHL detecte un no-show o fantasma, aparecerá acá automáticamente.'
                    : 'Conectá GHL para recibir leads automáticamente.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pulses.map((pulse) => {
                const s           = statusConfig[pulse.status] ?? statusConfig.queued
                const suggestedMsg = buildSuggestedMessage(pulse.lead_name)

                return (
                  <div
                    key={pulse.id}
                    className="rounded-lg border border-border bg-muted/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{pulse.lead_name}</p>
                          <Badge variant={s.variant} className="text-[10px]">
                            {s.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{pulse.lead_email}</p>
                        {pulse.lead_phone && (
                          <p className="text-xs text-muted-foreground/70">{pulse.lead_phone}</p>
                        )}
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {assetLabels[pulse.asset_offered] ?? pulse.asset_offered}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {pulse.status === 'sent' && pulse.sent_at
                            ? `Enviado ${new Date(pulse.sent_at).toLocaleDateString('es-AR')}`
                            : formatScheduled(pulse.scheduled_for)}
                        </p>
                      </div>
                    </div>

                    {/* Mensaje sugerido + botón dispatch — solo para pulsos en cola */}
                    {pulse.status === 'queued' && (
                      <div className="mt-3 space-y-2">
                        <div className="rounded-md bg-muted/50 px-3 py-2">
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">
                            Mensaje sugerido para setter:
                          </p>
                          <p className="text-xs text-foreground/80 italic">
                            &ldquo;{suggestedMsg}&rdquo;
                          </p>
                        </div>

                        {/* 🔑 Requiere ghl_access_token para enviar via API */}
                        {ghlConnected ? (
                          <div className="flex justify-end">
                            <DispatchButton
                              pulseId={pulse.id}
                              leadName={pulse.lead_name}
                              suggestedMsg={suggestedMsg}
                            />
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground text-right">
                            Conectar GHL para enviar automáticamente
                          </p>
                        )}
                      </div>
                    )}

                    {/* Info de respuesta */}
                    {pulse.status === 'responded' && pulse.responded_at && (
                      <p className="mt-2 text-[10px] text-emerald-400">
                        ✓ Respondió el {new Date(pulse.responded_at).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Red Flags trigger */}
      <Card className="border-rose-500/20 bg-rose-500/5">
        <CardHeader>
          <CardTitle className="text-base text-rose-400">🚩 Gancho Red Flags</CardTitle>
          <CardDescription>
            Para ghosting profundo — psicología inversa para forzar la objeción real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-rose-500/20 bg-background/50 px-4 py-3">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;Me preocupa un poco cuando un cliente potencial no responde preguntas simples,
              se siente como una bandera roja 🚩 Nuestros mejores socios son súper transparentes
              y nos dan feedback rápido. Si vamos a hacer algo grande juntos, te necesito adentro
              al 100%. ¿Sigue el interés o lo dejamos para más adelante?&rdquo;
            </p>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Sprint 3: generación dinámica del mensaje según historial del lead en GHL
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
