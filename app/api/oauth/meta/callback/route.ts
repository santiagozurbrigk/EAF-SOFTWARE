import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const META_GRAPH_URL = 'https://graph.facebook.com/v20.0'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

/**
 * GET /api/oauth/meta/callback
 *
 * Callback del flujo OAuth 2.0 de Meta.
 * 1. Intercambia el code de autorización por un short-lived token
 * 2. Convierte a long-lived token (válido 60 días)
 * 3. Obtiene el Business ID del usuario
 * 4. Guarda tokens en la tabla organizations
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Meta devuelve error si el usuario cancela
  if (error) {
    console.error('[oauth/meta/callback] Usuario canceló:', error)
    return NextResponse.redirect(`${APP_URL}/integrations?error=meta_cancelled`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=meta_invalid_params`)
  }

  // Decodificar el org_id del state
  let orgId: string
  try {
    orgId = Buffer.from(state, 'base64url').toString('utf-8')
  } catch {
    return NextResponse.redirect(`${APP_URL}/integrations?error=meta_invalid_state`)
  }

  const appId       = process.env.META_APP_ID!
  const appSecret   = process.env.META_APP_SECRET!
  const redirectUri = `${APP_URL}/api/oauth/meta/callback`

  try {
    // 1. Short-lived access token
    const tokenRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${appSecret}` +
      `&code=${code}`
    )
    const tokenData = await tokenRes.json() as {
      access_token?: string
      error?: { message: string }
    }

    if (!tokenData.access_token) {
      console.error('[oauth/meta/callback] Error obteniendo token:', tokenData.error)
      return NextResponse.redirect(`${APP_URL}/integrations?error=meta_token_failed`)
    }

    // 2. Long-lived token (válido 60 días)
    const longLivedRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${tokenData.access_token}`
    )
    const longLivedData = await longLivedRes.json() as {
      access_token?: string
      error?: { message: string }
    }

    const finalToken = longLivedData.access_token ?? tokenData.access_token

    // 3. Business ID del usuario
    const businessRes = await fetch(
      `${META_GRAPH_URL}/me/businesses?access_token=${finalToken}`
    )
    const businessData = await businessRes.json() as {
      data?: Array<{ id: string; name: string }>
    }
    const businessId = businessData.data?.[0]?.id ?? null

    // 4. Guardar en Supabase (service role bypasa RLS)
    const supabase = createServiceClient()
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        meta_oauth_token: finalToken,
        meta_business_id: businessId,
      })
      .eq('id', orgId)

    if (updateError) {
      console.error('[oauth/meta/callback] Error guardando token:', updateError.message)
      return NextResponse.redirect(`${APP_URL}/integrations?error=meta_save_failed`)
    }

    return NextResponse.redirect(`${APP_URL}/integrations?success=meta`)
  } catch (err) {
    console.error('[oauth/meta/callback] Error inesperado:', err)
    return NextResponse.redirect(`${APP_URL}/integrations?error=meta_unexpected`)
  }
}
