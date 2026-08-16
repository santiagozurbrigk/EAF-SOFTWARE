import type { Metadata } from 'next'
import { Zap, Clock, RotateCcw, Mail } from 'lucide-react'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/metric-card'

export const metadata: Metadata = { title: 'Bucle de Resonancia · B:52' }

const PILLARS = [
  {
    number: 1,
    name: 'Preguntas Core',
    description: '¿Cómo funciona el sistema? ¿Qué te hace único?',
    color: 'text-amber-400',
  },
  {
    number: 2,
    name: 'Preguntas de 2da Capa',
    description: 'Desglose técnico que satisface la curiosidad lógica profunda del lead.',
    color: 'text-amber-300',
  },
  {
    number: 3,
    name: 'Objeciones Reales',
    description: 'Precio, escepticismo, tiempo — atacados por historias, no argumentos.',
    color: 'text-amber-200',
  },
  {
    number: 4,
    name: 'Expectativas Reales',
    description: 'Esfuerzo, plazos y compromiso que se le exige al cliente para tener éxito.',
    color: 'text-amber-100',
  },
]

export default function ResonancePage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Zap}
        iconColor="text-amber-400"
        name="Bucle de Resonancia"
        codename="B:52 · Pre-llamada"
        description="Bombardeo táctico de 15–20 videos en 72hs previas a la llamada. Show Rate objetivo: >80%. Exclusión estricta de 3 segundos por video."
        status="not_configured"
      />

      {/* Métricas B:52 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          title="Show Rate"
          value="—"
          subtitle="Objetivo: > 80%"
          icon={Zap}
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Frecuencia 72hs"
          value="—"
          subtitle="Objetivo: 15–20 impactos"
          icon={RotateCcw}
          iconColor="text-amber-300"
        />
        <MetricCard
          title="Llamadas próximas"
          value="—"
          subtitle="En ventana activa ahora"
          icon={Clock}
          iconColor="text-amber-200"
        />
      </div>

      {/* Arquitectura B:52 */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Pauta pre-llamada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">⚡ Pauta Pre-llamada (Meta Ads)</CardTitle>
            <CardDescription>
              CBO con exclusión automática de 3s por video — rota forzada al siguiente clip
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Mecánica de exclusión de 3 segundos</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cuando el lead ve 3 segundos del Video 1 → entra al público de exclusión
                  de ese ad set → Meta lo rota automáticamente al Video 2, y así sucesivamente.
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <span className="text-xs">Arsenal de videos en B:52</span>
                <Badge variant="warning">0 / 30 cargados</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-xs">Sincronización con GHL Calendar</span>
                <Badge variant="outline">Sin conectar</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails de frecuencia crítica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              Emails de Frecuencia Crítica
            </CardTitle>
            <CardDescription>
              6 correos diarios distribuidos estratégicamente antes de la llamada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.number}
                  className="flex items-start gap-2.5 rounded-md border border-border bg-muted/20 px-3 py-2"
                >
                  <span className={`mt-0.5 text-sm font-bold ${pillar.color}`}>
                    {pillar.number}
                  </span>
                  <div>
                    <p className="text-xs font-medium">{pillar.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Sprint 2: Editor rich text de las 6 plantillas + variables GHL
              <code className="ml-1 rounded bg-muted px-1">
                {'{{contact.first_name}}'}
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
