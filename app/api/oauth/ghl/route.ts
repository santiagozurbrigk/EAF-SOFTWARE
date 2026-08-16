import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/oauth/ghl
 *
 * Inicia el flujo OAuth 2.0 con GoHighLevel (Marketplace).
 * Requiere organización activa.
 *
 * Scopes solicitados:
 * - contacts.readonly / contacts.write     → gestión de leads
 * - locations.readonly                      → acceso a subcuenta/location
 * - conversations.readonly                 → lectura de conversaciones
 * - calendars.readonly / events.readonly   → detección de agendamientos (B:52)
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

  const clientId    = process.env.GHL_CLIENT_ID!
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL!
  const redirectUri = process.env.GHL_REDIRECT_URI ?? `${appUrl}/api/oauth/ghl/callback`

  const scopes = [
    'contacts.readonly',
    'contacts.write',
    'locations.readonly',
    'conversations.readonly',
    'calendars.readonly',
    'calendars/events.readonly',
  ].join(' ')

  // State lleva el org_id para vincularlo en el callback
  const state = Buffer.from(org.id).toString('base64url')

  const ghlOAuthUrl = new URL('https://marketplace.gohighlevel.com/oauth/chooselocation')
  ghlOAuthUrl.searchParams.set('response_type', 'code')
  ghlOAuthUrl.searchParams.set('redirect_uri', redirectUri)
  ghlOAuthUrl.searchParams.set('client_id', clientId)
  ghlOAuthUrl.searchParams.set('scope', scopes)
  ghlOAuthUrl.searchParams.set('state', state)

  return NextResponse.redirect(ghlOAuthUrl.toString())
}
