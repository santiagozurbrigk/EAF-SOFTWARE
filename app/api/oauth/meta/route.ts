import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/oauth/meta
 *
 * Inicia el flujo OAuth 2.0 con Meta (Facebook / Instagram).
 * Requiere que el usuario esté autenticado y tenga una organización activa.
 *
 * Scopes solicitados:
 * - ads_management         → crear y gestionar campañas
 * - ads_read               → leer métricas de anuncios
 * - business_management    → acceso al Business Manager
 * - instagram_basic        → perfil de Instagram
 * - instagram_manage_insights → insights de Instagram para SDC Monitor
 * - pages_read_engagement  → métricas de páginas de Facebook
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Verificar rol del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSuperAdmin = profile?.role === 'super_admin'

  const { data: org } = await supabase
    .from('organizations')
    .select('id, status')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!org) {
    return NextResponse.redirect(new URL('/onboarding', process.env.NEXT_PUBLIC_APP_URL!))
  }

  // Solo bloquear si la org está pendiente Y el usuario no es super_admin
  if (org.status !== 'active' && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_APP_URL!))
  }

  const appId     = process.env.META_APP_ID!
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL!
  const redirectUri = `${appUrl}/api/oauth/meta/callback`

  const scopes = [
    'ads_management',
    'ads_read',
    'business_management',
    'instagram_basic',
    'instagram_manage_insights',
    'pages_read_engagement',
  ].join(',')

  // El state lleva el org_id para vincularlo en el callback
  const state = Buffer.from(org.id).toString('base64url')

  const metaOAuthUrl = new URL('https://www.facebook.com/v20.0/dialog/oauth')
  metaOAuthUrl.searchParams.set('client_id', appId)
  metaOAuthUrl.searchParams.set('redirect_uri', redirectUri)
  metaOAuthUrl.searchParams.set('scope', scopes)
  metaOAuthUrl.searchParams.set('state', state)
  metaOAuthUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(metaOAuthUrl.toString())
}
