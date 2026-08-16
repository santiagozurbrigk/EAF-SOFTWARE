import type { Metadata } from 'next'
import { Layers, Eye, TrendingDown } from 'lucide-react'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/metric-card'

export const metadata: Metadata = { title: 'Filtro de Banda · Blackhole' }

const LAYERS = [
  {
    number: 1,
    name: 'Capa 1 — Tesis Macro',
    description: '5 videos largos · Oportunidad de mercado y reencuadre del dolor',
    audience: 'Tráfico frío · Intereses del ICP',
    budget: '50–60% del budget',
    trigger: 'Entrada: audiencia tibia del Sintonizador',
    color: 'border-violet-500/30 bg-violet-500/5',
    badgeColor: 'text-violet-400',
  },
  {
    number: 2,
    name: 'Capa 2 — Mecanismo Único',
    description: '5 videos largos · Metodología vs. alternativas del mercado',
    audience: 'Retargeting: vio ≥25% de Capa 1',
    budget: '25% del budget',
    trigger: 'Trigger automático al cruzar umbral 25%',
    color: 'border-violet-400/20 bg-violet-400/5',
    badgeColor: 'text-violet-300',
  },
  {
    number: 3,
    name: 'Capa 3 — Prueba Social y Objeciones',
    description: '5 videos largos · Casos de éxito + demolición de objeciones',
    audience: 'Retargeting: vio ≥25% de Capa 2',
    budget: '15% del budget',
    trigger: 'Trigger automático al cruzar umbral 25%',
    color: 'border-violet-300/20 bg-violet-300/5',
    badgeColor: 'text-violet-200',
  },
  {
    number: 4,
    name: 'Capa 4 — Conversión (VSL)',
    description: 'Campaña de conversiones · Anuncio de agendamiento',
    audience: 'Retargeting: vio ≥25% de Capa 3',
    budget: '10% del budget',
    trigger: 'Lead llega "adoctrinado" a la llamada',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    badgeColor: 'text-emerald-400',
  },
]

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Layers}
        iconColor="text-violet-400"
        name="Filtro de Banda"
        codename="Blackhole 2.0"
        description="3 capas de videos largos (10–30 min) que avanzan automáticamente al cruzar el umbral del 25% de reproducción."
        status="not_configured"
      />

      {/* Métricas del filtro */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="Costo por Watcher 25%"
          value="—"
          subtitle="Objetivo: < $0.05"
          icon={Eye}
          iconColor="text-violet-400"
        />
        <MetricCard
          title="Drop-off Capa 1→2"
          value="—"
          subtitle="Promedio histórico: ~70%"
          icon={TrendingDown}
          iconColor="text-violet-300"
        />
        <MetricCard
          title="Leads en Conversión"
          value="—"
          subtitle="Pasaron las 3 capas"
          icon={Layers}
          iconColor="text-emerald-400"
        />
      </div>

      {/* Layers visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arquitectura de 4 Capas</CardTitle>
          <CardDescription>
            Cada capa progresa automáticamente solo si el lead vio ≥25% del contenido anterior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {LAYERS.map((layer) => (
            <div
              key={layer.number}
              className={`rounded-lg border p-4 ${layer.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 text-lg font-bold ${layer.badgeColor}`}>
                    {layer.number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{layer.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {layer.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {layer.audience}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {layer.budget}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  Sin configurar
                </Badge>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/70">
                ↳ {layer.trigger}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Sprint 2:</strong> Botón{' '}
            <code className="rounded bg-muted px-1 text-xs">"Activar Filtro de Banda"</code>{' '}
            que crea automáticamente las campañas ABO en Meta Ads API con las exclusiones de
            25% configuradas en el Pixel de Meta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
