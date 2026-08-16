import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Link2, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Integraciones' }

const ERROR_MESSAGES: Record<string, string> = {
  meta_cancelled:      'Cancelaste la conexión con Meta.',
  meta_invalid_params: 'Parámetros inválidos en el callback de Meta.',
  meta_invalid_state:  'Estado OAuth inválido. Intentá de nuevo.',
  meta_token_failed:   'Meta rechazó el intercambio de token. Verificá los permisos de tu app.',
  meta_save_failed:    'Token de Meta obtenido pero no se pudo guardar. Contactá soporte.',
  meta_unexpected:     'Error inesperado conectando Meta.',
  ghl_cancelled:       'Cancelaste la conexión con GoHighLevel.',
  ghl_invalid_params:  'Parámetros inválidos en el callback de GHL.',
  ghl_invalid_state:   'Estado OAuth inválido. Intentá de nuevo.',
  ghl_token_failed:    'GHL rechazó el intercambio de token. Verificá las credenciales.',
  ghl_save_failed:     'Token de GHL obtenido pero no se pudo guardar. Contactá soporte.',
  ghl_unexpected:      'Error inesperado conectando GoHighLevel.',
}

const SUCCESS_MESSAGES: Record<string, string> = {
  meta: '🎯 Meta Ads conectado correctamente. ¡Ya podés lanzar campañas!',
  ghl:  '🔧 GoHighLevel conectado. El pipeline y Lazarus están activos.',
}

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function IntegrationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  // Leer tokens reales de la org del usuario
  const { data: org } = await supabase
    .from('organizations')
    .select('id, status, meta_oauth_token, meta_business_id, ghl_access_token, ghl_location_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  const { error: errorKey, success: successKey } = await searchParams

  const metaConnected = Boolean(org?.meta_oauth_token)
  const ghlConnected  = Boolean(org?.ghl_access_token)
  const isActive      = org?.status === 'active'
  // Super admin puede conectar con cualquier estado de org; clientes solo si están activos
  const canOAuth      = Boolean(org) && (isActive || isSuperAdmin)

  const integrations = [
    {
      id:          'meta',
      name:        'Meta Ads / Business Manager',
      description: 'Conectá tu Pixel, Cuenta Publicitaria y Páginas de Instagram/Facebook para activar el Sintonizador, Filtro de Banda y B:52.',
      icon:        '🎯',
      connected:   metaConnected,
      authType:    'OAuth 2.0',
      connectHref: '/api/oauth/meta',
      detail:      org?.meta_business_id ? `Business ID: ${org.meta_business_id}` : null,
      required:    true,
    },
    {
      id:          'ghl',
      name:        'GoHighLevel (GHL)',
      description: 'Sincroniza el pipeline de CRM, estados de contactos y el envío de mensajes del Lazarus y B:52.',
      icon:        '🔧',
      connected:   ghlConnected,
      authType:    'OAuth 2.0',
      connectHref: '/api/oauth/ghl',
      detail:      org?.ghl_location_id ? `Location ID: ${org.ghl_location_id}` : null,
      required:    true,
    },
    {
      id:          'hyros',
      name:        'Hyros (Atribución científica)',
      description: 'Atribución First Source / Last Source para el ROAS Blended del Dashboard. Requiere parámetro ?sl= en todos los links.',
      icon:        '📊',
      connected:   false,
      authType:    'API Key',
      connectHref: null,
      detail:      null,
      required:    false,
    },
    {
      id:          'calendly',
      name:        'Calendly / GHL Calendar',
      description: 'Integración bidireccional para detectar agendamientos y activar el Bucle de Resonancia B:52.',
      icon:        '📅',
      connected:   false,
      authType:    'OAuth 2.0 / API Key',
      connectHref: null,
      detail:      null,
      required:    true,
    },
  ]

  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Link2}
        iconColor="text-muted-foreground"
        name="Integraciones y Conexiones"
        description="Conectá las herramientas externas para activar el ecosistema EAF."
        status="not_configured"
      />

      {/* Feedback de OAuth */}
      {errorKey && ERROR_MESSAGES[errorKey] && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{ERROR_MESSAGES[errorKey]}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {successKey && SUCCESS_MESSAGES[successKey] && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">{SUCCESS_MESSAGES[successKey]}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Super admin sin org: necesita crear la suya primero */}
      {isSuperAdmin && !org && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-medium text-blue-300">
                    Creá tu organización primero
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Para conectar Meta y GHL a tu propia cuenta, necesitás crear tu organización.
                    Como super admin, quedará activa de inmediato.
                  </p>
                </div>
              </div>
              <a href="/onboarding">
                <Button size="sm" variant="outline" className="shrink-0">
                  Crear mi org →
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning si org no está activa (solo para clientes, no super_admin) */}
      {!isActive && org && !isSuperAdmin && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">⏳</span>
              <div>
                <p className="text-sm font-medium text-amber-300">
                  Cuenta pendiente de activación
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Las integraciones estarán disponibles una vez que el equipo de EAF active tu cuenta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Meta primero — solo cuando ya puede conectar pero todavía no lo hizo */}
      {canOAuth && !metaConnected && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-amber-300">
                  Conectá Meta Ads primero
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Meta Ads es el core del sistema. Sin el token OAuth, ningún módulo
                  puede crear campañas, audiencias ni exclusiones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Cards */}
      <div className="space-y-4">
        {integrations.map((integration) => {
          const isConnected  = integration.connected
          const canConnect   = canOAuth && Boolean(integration.connectHref)
          const StatusIcon   = isConnected ? CheckCircle : XCircle
          const statusColor  = isConnected ? 'text-emerald-400' : 'text-muted-foreground'
          const statusLabel  = isConnected ? 'Conectado' : 'Sin conectar'

          return (
            <Card key={integration.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        {integration.required && (
                          <Badge variant="destructive" className="text-[10px]">
                            Requerido
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-0.5">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
                    <span className={`text-xs ${statusColor}`}>{statusLabel}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Auth: {integration.authType}
                    </Badge>
                    {integration.detail && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
                        {integration.detail}
                      </span>
                    )}
                  </div>

                  {integration.connectHref ? (
                    isConnected ? (
                      <a href={integration.connectHref}>
                        <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                          <RefreshCw className="h-3 w-3" />
                          Reconectar
                        </Button>
                      </a>
                    ) : canConnect ? (
                      <a href={integration.connectHref}>
                        <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                          Conectar
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="gap-1.5 shrink-0">
                        Conectar
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    )
                  ) : (
                    <Button size="sm" variant="outline" disabled className="gap-1.5 shrink-0 opacity-50">
                      Próximamente
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Los tokens se almacenan en Supabase (tabla{' '}
        <code className="rounded bg-muted px-1">organizations</code>).
        Los tokens de GHL se renuevan automáticamente cada 24 hs via cron.
        Los de Meta duran 60 días — el sistema avisa cuando faltan 7 días para renovar.
      </p>
    </div>
  )
}
