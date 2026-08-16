import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Configurar workspace — EAF' }

async function createOrgAction(formData: FormData) {
  'use server'

  const name = (formData.get('name') as string)?.trim()
  if (!name) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('organizations')
    .insert({ name, owner_id: user.id })

  if (error) {
    console.error('[onboarding] Error creando org:', error.message)
    // El redirect igual ocurre — el super_admin verá la org en pending_activation
  }

  redirect('/dashboard')
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Si ya tiene org, ir al dashboard directamente
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (org) redirect('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">EAF</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Configurá tu workspace
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingresá el nombre de tu empresa o agencia para crear tu cuenta en EAF.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form action={createOrgAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none"
            >
              Nombre de la organización
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="Ej. Agencia Rocket Media"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Crear organización →
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Tu cuenta quedará en revisión y será activada por el equipo de EAF
          en las próximas 24 hs.
        </p>
      </div>
    </div>
  )
}
