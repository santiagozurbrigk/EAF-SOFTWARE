'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Activa o suspende una organización.
 * Usa el service client para bypassear RLS — la verificación de super_admin
 * se hace manualmente antes del update.
 */
export async function toggleOrgStatus(
  orgId: string,
  newStatus: 'active' | 'suspended'
): Promise<{ error?: string }> {
  // Verificar que el caller es super_admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') return { error: 'Sin permisos' }

  // Usar service client para evitar problemas de RLS
  const service = createServiceClient()
  const { error } = await service
    .from('organizations')
    .update({ status: newStatus })
    .eq('id', orgId)

  if (error) {
    console.error('[toggleOrgStatus] Error:', error.message)
    return { error: error.message }
  }

  return {}
}
