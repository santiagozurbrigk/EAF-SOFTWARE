import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Cliente de Supabase para componentes del lado del cliente (browser).
 * Usar en Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
