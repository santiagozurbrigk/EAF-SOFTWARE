import type { Metadata } from 'next'
import { Radio, Star, Play, Zap } from 'lucide-react'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Sintonizador · SDC' }

// TODO Sprint 2: Conectar Instagram Graph API y mostrar Reels reales
const PLACEHOLDER_REELS = [
  { id: '1', title: 'Video sobre estrategia de CPM',         views: 12400, engagement: 8.2,  isWinner: true  },
  { id: '2', title: 'Caso de éxito cliente Amazon',          views: 8300,  engagement: 5.1,  isWinner: false },
  { id: '3', title: 'Cómo funciona la telaraña algorítmica', views: 31200, engagement: 12.7, isWinner: true  },
  { id: '4', title: 'Los 3 errores del anunciante promedio', views: 5800,  engagement: 3.4,  isWinner: false },
]

export default function SDCPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Radio}
        iconColor="text-blue-400"
        name="Sintonizador de Entrada"
        codename="La Fábrica · SDC"
        description="Detecta Reels ganadores del feed orgánico y genera 5 variaciones automáticas para inyectar en Meta Ads por $0.01 por impacto."
        status="not_configured"
      />

      {/* Instrucción de setup */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-500/20 p-1.5">
              <Radio className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Para activar el Sintonizador</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Conectá tu cuenta de Instagram (vía Meta Business Manager) en la pantalla de{' '}
                <a href="/integrations" className="text-blue-400 hover:underline">Integraciones</a>.
                El sistema comenzará a monitorear tu feed orgánico automáticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Reels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Monitor de Reels Orgánicos</CardTitle>
              <CardDescription>
                Detección automática de Winners (+1σ de engagement en 24hs)
              </CardDescription>
            </div>
            <Badge variant="pending">Sprint 2: Live data</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PLACEHOLDER_REELS.map((reel) => (
              <div
                key={reel.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
              >
                {/* Preview thumb placeholder */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{reel.title}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{reel.views.toLocaleString()} vistas</span>
                      <span>·</span>
                      <span>{reel.engagement}% eng.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {reel.isWinner ? (
                    <Badge variant="winner">
                      <Star className="h-3 w-3" />
                      WINNER
                    </Badge>
                  ) : (
                    <Badge variant="outline">Regular</Badge>
                  )}
                  {reel.isWinner && (
                    <Button size="sm" variant="sintonizador" className="gap-1.5 text-xs">
                      <Zap className="h-3 w-3" />
                      Multiplicar en SDC
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variations Builder — placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Constructor de Variaciones</CardTitle>
          <CardDescription>
            Generador automático de 5 variaciones por FFmpeg — disponible al hacer clic en "Multiplicar"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Seleccioná un Winner Reel para abrir el editor de variaciones
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Genera: Hook Text · Corte · Audio Swap · Zoom · CTA
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
