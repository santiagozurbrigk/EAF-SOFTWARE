import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org } = await (supabase as any)
    .from('organizations')
    .select('id, name, status')
    .eq('owner_id', user.id)
    .single() as { data: { id: string; name: string; status: string } | null }

  if (org?.status === 'pending_activation') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Cuenta pendiente de activación</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu acceso está siendo revisado. Recibirás un email de confirmación en
              las próximas 24 horas.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            ¿Tenés urgencia? Escribí a{' '}
            <a href="mailto:hola@eaf.com" className="text-primary hover:underline">
              hola@eaf.com
            </a>
          </p>
        </div>
      </div>
    )
  }

  const isSuperAdmin = profile?.role === 'super_admin'

  return (
    <div className="flex min-h-screen">
      <Sidebar userEmail={user.email} isSuperAdmin={isSuperAdmin} />
      <main className="flex-1 pl-[var(--sidebar-width)]">
        <div className="h-full min-h-screen p-6">{children}</div>
      </main>
    </div>
  )
}
