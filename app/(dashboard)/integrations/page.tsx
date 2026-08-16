import type { Metadata } from 'next'
import { Link2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { ModuleHeader } from '@/components/module-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Integraciones' }

// TODO Sprint 2: Leer estado real desde tabla organizations en Supabase
const INTEGRATIONS = [
  {
    id: 'meta',
    name: 'Meta Ads / Business Manager',
    description: 'Conectá tu Pixel, Cuenta Publicitaria y Páginas de Instagram/Facebook para activar el Sintonizador, Filtro de Banda y B:52.',
    icon: '🎯',
    status: 'disconnected' as const,
    authType: 'OAuth 2.0',
    fields: ['Pixel ID', 'Ad Account ID', 'Facebook Page', 'Instagram Account'],
    required: true,
  },
  {
    id: 'ghl',
    name: 'GoHighLevel (GHL)',
    description: 'Sincroniza el pipeline de CRM, estados de contactos, embudos y el envío de emails/SMS del B:52.',
    icon: '🔧',
    status: 'disconnected' as const,
    authType: 'API Key',
    fields: ['API Key', 'Location ID'],
    required: true,
  },
  {
    id: 'hyros',
    name: 'Hyros (Atribución científica)',
    description: 'Atribución First Source / Last Source para el ROAS Blended del Home Dashboard. Requiere parámetro ?sl= en todos los links.',
    icon: '📊',
    status: 'disconnected' as const,
    authType: 'API Key',
    fields: ['API Key'],
    required: false,
  },
  {
    id: 'calendly',
    name: 'Calendly / GHL Calendar',
    description: 'Integración bidireccional para detectar agendamientos en tiempo real y activar el Bucle de Resonancia B:52.',
    icon: '📅',
    status: 'disconnected' as const,
    authType: 'OAuth 2.0 / API Key',
    fields: ['Calendar URL', 'Webhook Secret'],
    required: true,
  },
]

const statusConfig = {
  connected:    { label: 'Conectado',    icon: CheckCircle, color: 'text-emerald-400' },
  disconnected: { label: 'Sin conectar', icon: XCircle,     color: 'text-muted-foreground' },
  error:        { label: 'Error',         icon: XCircle,     color: 'text-destructive' },
}

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <ModuleHeader
        icon={Link2}
        iconColor="text-muted-foreground"
        name="Integraciones y Conexiones"
        description="Conectá las herramientas externas para activar el ecosistema automatizado de EAF. Sin estas conexiones, el sistema no puede operar."
        status="not_configured"
      />

      {/* Warning */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-medium text-amber-300">
                Conectá Meta Ads primero
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Meta Ads es el core del sistema. Sin el token de acceso OAuth de Meta, ningún módulo
                puede crear campañas, audiencias ni exclusiones.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const s = statusConfig[integration.status]
          const StatusIcon = s.icon

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
                    <StatusIcon className={`h-3.5 w-3.5 ${s.color}`} />
                    <span className={`text-xs ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {integration.fields.map((field) => (
                      <Badge key={field} variant="outline" className="text-[10px]">
                        {field}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Auth: {integration.authType}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
                    Conectar
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Sprint 2: Flujos OAuth y formularios de API Key. Los tokens se almacenan encriptados en
        Supabase (tabla <code className="rounded bg-muted px-1">organizations</code>).
        Cron Job diario refresca automáticamente los tokens de Meta (60 días de vigencia).
      </p>
    </div>
  )
}
