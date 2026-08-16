import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const GHL_TOKEN_URL = 'https://services.leadconnectorhq.com/oauth/token'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

interface GHLTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
  locationId?: string
  userId?: string
  companyId?: string
}

/**
 * GET /api/oauth/ghl/callback
 *
 * Callback del flujo OAuth 2.0 de GoHighLevel.
 * 1. Intercambia el code por access_token + refresh_token
 * 2. Extrae el locationId de la respuesta
 * 3. Guarda los tokens en la tabla organizations
 *
 * Nota: El access_token de GHL expira en 24 horas.
 * El refresh_token se usa para renovarlo automáticamente.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('[oauth/ghl/callback] Usuario canceló:', error)
    return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_cancelled`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_invalid_params`)
  }

  let orgId: string
  try {
    orgId = Buffer.from(state, 'base64url').toString('utf-8')
  } catch {
    return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_invalid_state`)
  }

  const clientId     = process.env.GHL_CLIENT_ID!
  const clientSecret = process.env.GHL_CLIENT_SECRET!
  const redirectUri  = process.env.GHL_REDIRECT_URI ?? `${APP_URL}/api/oauth/ghl/callback`

  try {
    // 1. Intercambiar code por tokens
    const tokenRes = await fetch(GHL_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
        user_type:     'Location',
      }).toString(),
    })

    const tokenData = await tokenRes.json() as GHLTokenResponse & {
      error?: string
      message?: string
    }

    if (!tokenData.access_token) {
      console.error('[oauth/ghl/callback] Error obteniendo tokens:', tokenData)
      return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_token_failed`)
    }

    const locationId = tokenData.locationId ?? null

    // 2. Guardar en Supabase
    const supabase = createServiceClient()
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        ghl_access_token:  tokenData.access_token,
        ghl_refresh_token: tokenData.refresh_token,
        ghl_location_id:   locationId,
      })
      .eq('id', orgId)

    if (updateError) {
      console.error('[oauth/ghl/callback] Error guardando tokens:', updateError.message)
      return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_save_failed`)
    }

    return NextResponse.redirect(`${APP_URL}/integrations?success=ghl`)
  } catch (err) {
    console.error('[oauth/ghl/callback] Error inesperado:', err)
    return NextResponse.redirect(`${APP_URL}/integrations?error=ghl_unexpected`)
  }
}
