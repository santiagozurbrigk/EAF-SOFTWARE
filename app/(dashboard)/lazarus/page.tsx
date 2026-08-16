import type { Metadata } from 'next'
import { Flame, Clock, MessageSquare, TrendingUp } from 'lucide-react'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/metric-card'

export const metadata: Metadata = { title: 'Lazarus · Emisor de Pulsos' }

// TODO Sprint 3: Cargar desde Supabase (lazarus_pulses donde status = 'queued' | 'sent')
const MOCK_PULSES = [
  {
    id: '1',
    name: 'Julián Pérez',
    email: 'julian.perez@coach.com',
    asset: 'pdf_case_study',
    status: 'queued',
    scheduledFor: '+48hs',
    reason: 'No-show en llamada del 12/08',
  },
  {
    id: '2',
    name: 'Martina López',
    email: 'martina@agencia.com',
    asset: 'pdf_case_study',
    status: 'sent',
    scheduledFor: 'Enviado',
    reason: 'Sin respuesta por 7 días',
  },
]

const assetLabels: Record<string, string> = {
  pdf_case_study:  '📄 PDF Case Study (P&L)',
  video_breakout:  '🎬 Video Breakout',
  spreadsheet_roi: '📊 ROI Spreadsheet',
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'outline' | 'pending' }> = {
  queued:    { label: 'En cola',  variant: 'warning'  },
  sent:      { label: 'Enviado',  variant: 'success'  },
  responded: { label: 'Respondió', variant: 'success' },
  failed:    { label: 'Falló',    variant: 'outline'  },
}

export default function LazarusPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Flame}
        iconColor="text-rose-400"
        name="Emisor de Pulsos"
        codename="Lazarus"
        description='Reactiva leads fríos, no-shows y ghosters mediante "anzuelos de valor" automatizados. Sin seguimiento egoísta — solo valor sin fricción.'
        status="not_configured"
      />

      {/* Métricas Lazarus */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="Tasa de Respuesta"
          value="—"
          subtitle="Objetivo: > 50% con PDF P&L"
          icon={TrendingUp}
          iconColor="text-rose-400"
        />
        <MetricCard
          title="Pulsos en Cola"
          value={String(MOCK_PULSES.filter(p => p.status === 'queued').length)}
          subtitle="Pendientes de envío"
          icon={Clock}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Leads Reactivados"
          value="—"
          subtitle="Pasaron a llamada este mes"
          icon={MessageSquare}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Setter Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">🧊 Cola de Leads Inactivos</CardTitle>
              <CardDescription>
                Leads detectados por GHL webhook — ghosters, no-shows o sin respuesta &gt;7 días
              </CardDescription>
            </div>
            <Badge variant="pending">
              {MOCK_PULSES.filter(p => p.status === 'queued').length} pendientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_PULSES.map((pulse) => {
              const s = statusConfig[pulse.status]
              return (
                <div
                  key={pulse.id}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{pulse.name}</p>
                        <Badge variant={s.variant} className="text-[10px]">
                          {s.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{pulse.email}</p>
                      <p className="text-xs text-muted-foreground/70">↳ {pulse.reason}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground">{assetLabels[pulse.asset]}</p>
                      <p className="text-[10px] text-muted-foreground/60">{pulse.scheduledFor}</p>
                    </div>
                  </div>

                  {/* Mensaje de pulso sugerido */}
                  {pulse.status === 'queued' && (
                    <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground font-medium mb-1">
                        Mensaje sugerido para setter:
                      </p>
                      <p className="text-xs text-foreground/80 italic">
                        &ldquo;Sé que andamos todos a mil con mil cosas, así que cero drama por la colgada,{' '}
                        {pulse.name.split(' ')[0]}. Te quería compartir algo que preparé:{' '}
                        el P&L real de uno de nuestros casos de Amazon. ¿Te lo mando por acá o preferís por mail?&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
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
            Sprint 3: generación dinámica del mensaje según el historial del lead en GHL
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
