import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface IGMedia {
  id:             string
  caption?:       string
  media_type:     string
  permalink?:     string
  thumbnail_url?: string
  media_url?:     string
  timestamp:      string
}

interface IGMediaResponse {
  data:   IGMedia[]
  paging?: { cursors: { after: string }; next?: string }
  error?: { message: string }
}

/**
 * POST /api/sdc/sync
 *
 * Sincroniza los Reels de Instagram del usuario con la tabla master_videos.
 *
 * 🔑 Para probar en flujo real: requiere meta_oauth_token guardado en la org.
 *    El token debe tener los scopes: instagram_basic, instagram_manage_insights.
 *    Conectar en /integrations → botón "Conectar Meta".
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()

  // 1. Obtener org y token de Meta
  const { data: org } = await service
    .from('organizations')
    .select('id, meta_oauth_token')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!org?.meta_oauth_token) {
    return NextResponse.json(
      { error: 'Meta no conectado — ve a Integraciones para conectar tu cuenta.' },
      { status: 400 }
    )
  }

  // 2. Llamar a la Instagram Basic Display API para obtener medios
  const fields = 'id,caption,media_type,permalink,thumbnail_url,media_url,timestamp'
  const mediaUrl =
    `https://graph.instagram.com/me/media?fields=${fields}&limit=50&access_token=${org.meta_oauth_token}`

  const mediaRes = await fetch(mediaUrl)
  if (!mediaRes.ok) {
    const errData = await mediaRes.json() as { error?: { message: string } }
    const msg = errData.error?.message ?? `Instagram API error ${mediaRes.status}`
    console.error('[/api/sdc/sync] Instagram API error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const mediaData = await mediaRes.json() as IGMediaResponse

  // 3. Filtrar solo Reels/Videos
  const reels = (mediaData.data ?? []).filter(
    (m) => m.media_type === 'VIDEO' || m.media_type === 'REEL'
  )

  if (reels.length === 0) {
    return NextResponse.json({ success: true, synced: 0, winners: 0, message: 'No se encontraron Reels en la cuenta.' })
  }

  // 4. Intentar obtener insights (plays, reach) para calcular engagement
  //    Puede fallar si el token no tiene instagram_manage_insights o no es cuenta Business.
  //    En ese caso seguimos sin engagement y asignamos 0.
  const withInsights = await Promise.all(
    reels.map(async (reel) => {
      let organic_views = 0
      let organic_engagement_rate = 0

      try {
        const insightUrl =
          `https://graph.instagram.com/${reel.id}/insights?metric=plays,reach,likes,comments,shares&access_token=${org.meta_oauth_token}`
        const ir = await fetch(insightUrl)
        if (ir.ok) {
          const id = await ir.json() as { data: Array<{ name: string; values?: Array<{ value: number }>; value?: number }> }
          const get = (name: string) => {
            const found = id.data.find((d) => d.name === name)
            // El campo puede venir como .values[0].value o como .value directamente
            return found?.value ?? found?.values?.[0]?.value ?? 0
          }
          const plays    = get('plays')
          const reach    = get('reach')
          const likes    = get('likes')
          const comments = get('comments')
          const shares   = get('shares')

          organic_views = plays
          organic_engagement_rate =
            reach > 0 ? (((likes + comments + shares) / reach) * 100) : 0
        }
      } catch {
        // Si insights falla, continuamos con 0
      }

      return {
        instagram_media_id:        reel.id,
        caption:                   reel.caption?.slice(0, 500) ?? null,
        permalink:                 reel.permalink ?? null,
        raw_video_url:             reel.thumbnail_url ?? reel.media_url ?? reel.permalink ?? '',
        organic_views,
        organic_engagement_rate:   Math.round(organic_engagement_rate * 100) / 100,
        user_id:                   user.id,
        is_winner:                 false, // se calcula abajo
      }
    })
  )

  // 5. Calcular winners: engagement > media + 1 desviación estándar
  const rates = withInsights.map((v) => v.organic_engagement_rate).filter((r) => r > 0)
  let winnerThreshold = Infinity

  if (rates.length >= 2) {
    const mean     = rates.reduce((a, b) => a + b, 0) / rates.length
    const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length
    const stdDev   = Math.sqrt(variance)
    winnerThreshold = mean + stdDev
  }

  const toUpsert = withInsights.map((v) => ({
    ...v,
    is_winner: v.organic_engagement_rate >= winnerThreshold && v.organic_engagement_rate > 0,
  }))

  // 6. Upsert en master_videos — el índice único es instagram_media_id
  const { error: upsertError } = await service
    .from('master_videos')
    .upsert(toUpsert, { onConflict: 'instagram_media_id', ignoreDuplicates: false })

  if (upsertError) {
    console.error('[/api/sdc/sync] Upsert error:', upsertError.message)
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  const winnersCount = toUpsert.filter((v) => v.is_winner).length

  return NextResponse.json({
    success:  true,
    synced:   toUpsert.length,
    winners:  winnersCount,
    message:  `${toUpsert.length} Reels sincronizados — ${winnersCount} Winners detectados.`,
  })
}
