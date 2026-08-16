import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Shield, Users, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/metric-card'
import { ActivationToggle } from './activation-toggle'

export const metadata: Metadata = { title: 'Super Admin' }

interface OrgRow {
  id: string
  name: string
  status: string
  meta_oauth_token: string | null
  ghl_access_token: string | null
  profiles: { email: string; full_name: string | null } | null
}

export default async function SuperAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgs } = await (supabase as any)
    .from('organizations')
    .select('id, name, status, meta_oauth_token, ghl_access_token, profiles!owner_id(email, full_name)')
    .order('created_at', { ascending: false }) as { data: OrgRow[] | null }

  const total   = orgs?.length ?? 0
  const active  = orgs?.filter((o) => o.status === 'active').length ?? 0
  const pending = orgs?.filter((o) => o.status === 'pending_activation').length ?? 0

  const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'outline' }> = {
    active:             { label: 'Activo',    variant: 'success'  },
    pending_activation: { label: 'Pendiente', variant: 'warning'  },
    suspended:          { label: 'Suspendido',variant: 'outline'  },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-yellow-500/10 p-2.5">
          <Shield className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Super Admin</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Panel de control de cuentas y activaciones — acceso restringido
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total de Orgs"  value={String(total)}   icon={Users}    iconColor="text-yellow-400" />
        <MetricCard title="Activas"        value={String(active)}  icon={Activity} iconColor="text-emerald-400" />
        <MetricCard title="Pendientes"     value={String(pending)} icon={Shield}   iconColor="text-amber-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organizaciones</CardTitle>
          <CardDescription>
            Activar, suspender o revisar el estado de tokens de cada cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!orgs || orgs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay organizaciones registradas todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.map((org) => {
                const s = statusConfig[org.status] ?? statusConfig.suspended
                const ownerEmail = org.profiles?.email ?? '—'

                return (
                  <div
                    key={org.id}
                    className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{org.name}</p>
                        <Badge variant={s.variant} className="shrink-0 text-[10px]">
                          {s.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ownerEmail}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge
                          variant={org.meta_oauth_token ? 'success' : 'outline'}
                          className="text-[10px]"
                        >
                          Meta {org.meta_oauth_token ? '✓' : '✗'}
                        </Badge>
                        <Badge
                          variant={org.ghl_access_token ? 'success' : 'outline'}
                          className="text-[10px]"
                        >
                          GHL {org.ghl_access_token ? '✓' : '✗'}
                        </Badge>
                      </div>
                    </div>

                    <ActivationToggle
                      orgId={org.id}
                      currentStatus={org.status}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
