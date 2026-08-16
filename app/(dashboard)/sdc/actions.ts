'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Marca o desmarca un video como Winner.
 * Solo puede ejecutarlo el dueño del video.
 */
export async function toggleWinner(
  videoId:  string,
  isWinner: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const service = createServiceClient()

  // Verificar que el video pertenece al usuario
  const { data: video } = await service
    .from('master_videos')
    .select('user_id')
    .eq('id', videoId)
    .single()

  if (!video || video.user_id !== user.id) {
    return { error: 'Sin permisos para este video.' }
  }

  const { error } = await service
    .from('master_videos')
    .update({ is_winner: isWinner })
    .eq('id', videoId)

  if (error) {
    console.error('[toggleWinner] Error:', error.message)
    return { error: error.message }
  }

  return {}
}
