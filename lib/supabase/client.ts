import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para componentes del lado del cliente (browser).
 * Usar en Client Components ('use client').
 *
 * Nota: Los tipos detallados se generan con:
 *   npx supabase gen types typescript --project-id <ID> > lib/supabase/generated.ts
 * y se pasan como genérico cuando el proyecto Supabase esté creado.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): ReturnType<typeof createBrowserClient<any>> {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
