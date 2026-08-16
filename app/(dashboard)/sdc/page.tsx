import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Radio, Star, Play, Zap, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SyncButton } from './sync-button'
import { WinnerToggle } from './winner-toggle'

export const metadata: Metadata = { title: 'Sintonizador · SDC' }

export default async function SDCPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar si tiene Meta conectado
  const { data: org } = await supabase
    .from('organizations')
    .select('id, meta_oauth_token')
    .eq('owner_id', user.id)
    .maybeSingle()

  const metaConnected = Boolean(org?.meta_oauth_token)

  // Cargar videos reales desde Supabase
  const { data: videos } = await supabase
    .from('master_videos')
    .select('id, instagram_media_id, caption, permalink, raw_video_url, organic_views, organic_engagement_rate, is_winner, created_at')
    .eq('user_id', user.id)
    .order('organic_views', { ascending: false })
    .limit(20)

  const hasVideos   = (videos?.length ?? 0) > 0
  const winnerCount = videos?.filter((v) => v.is_winner).length ?? 0

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Radio}
        iconColor="text-blue-400"
        name="Sintonizador de Entrada"
        codename="La Fábrica · SDC"
        description="Detecta Reels ganadores del feed orgánico y genera 5 variaciones automáticas para inyectar en Meta Ads por $0.01 por impacto."
        status={metaConnected ? 'active' : 'not_configured'}
      />

      {/* Setup card si Meta no está conectado */}
      {!metaConnected && (
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
      )}

      {/* Monitor de Reels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Monitor de Reels Orgánicos</CardTitle>
              <CardDescription>
                {hasVideos
                  ? `${videos!.length} Reels sincronizados · ${winnerCount} Winners detectados`
                  : 'Sincronizá para detectar Winners automáticamente (+1σ de engagement)'}
              </CardDescription>
            </div>
            {/* 🔑 Requiere meta_oauth_token para sincronizar */}
            {metaConnected
              ? <SyncButton />
              : (
                <Button size="sm" variant="outline" asChild className="gap-2 opacity-60" disabled>
                  <span><Radio className="h-3.5 w-3.5" /> Sincronizar</span>
                </Button>
              )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasVideos ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full bg-muted p-4">
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Todavía no hay Reels sincronizados</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {metaConnected
                    ? 'Hacé clic en "Sincronizar desde Instagram" para importar tus Reels.'
                    : 'Conectá tu cuenta de Meta para comenzar.'}
                </p>
              </div>
              {metaConnected && <SyncButton />}
            </div>
          ) : (
            <div className="space-y-2">
              {videos!.map((video) => {
                // Título: primeras 60 chars del caption, o el media ID si no hay caption
                const title = video.caption
                  ? video.caption.split('\n')[0].slice(0, 70)
                  : `Reel ${video.instagram_media_id ?? video.id.slice(0, 8)}`

                const viewsLabel = video.organic_views
                  ? video.organic_views.toLocaleString('es-AR') + ' vistas'
                  : 'Vistas: —'

                const engLabel = video.organic_engagement_rate
                  ? `${video.organic_engagement_rate.toFixed(1)}% eng.`
                  : 'Eng.: —'

                return (
                  <div
                    key={video.id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      video.is_winner
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail / Play icon */}
                      <a
                        href={video.permalink ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted hover:bg-muted/60 transition-colors"
                        title="Ver en Instagram"
                      >
                        {video.raw_video_url
                          ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={video.raw_video_url}
                                alt=""
                                className="h-10 w-10 rounded-md object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            )
                          : <Play className="h-4 w-4 text-muted-foreground" />}
                      </a>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{title}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{viewsLabel}</span>
                          <span>·</span>
                          <span>{engLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Toggle winner manual */}
                      <WinnerToggle videoId={video.id} isWinner={video.is_winner ?? false} />

                      {/* Botón Multiplicar — solo para winners */}
                      {video.is_winner && (
                        <Button size="sm" variant="sintonizador" className="gap-1.5 text-xs">
                          <Zap className="h-3 w-3" />
                          Multiplicar
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Constructor de Variaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Constructor de Variaciones</CardTitle>
          <CardDescription>
            Generador automático de 5 variaciones por FFmpeg — Sprint 3 (Railway worker)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {winnerCount > 0 ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <p className="text-sm font-medium text-amber-300">
                  {winnerCount} Winner{winnerCount > 1 ? 's' : ''} listo{winnerCount > 1 ? 's' : ''} para multiplicar
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                El worker de FFmpeg en Railway (Sprint 3) generará automáticamente:{' '}
                Hook Text · Corte · Audio Swap · Zoom · CTA
              </p>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Marcá un Reel como Winner para habilitar el constructor
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Genera: Hook Text · Corte · Audio Swap · Zoom · CTA
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
