/**
 * lib/ghl/client.ts
 *
 * Utilidades para interactuar con la API de GoHighLevel.
 * Incluye refresh automático de tokens (acceso expira en 24h).
 */
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Refresca el access token de GHL usando el refresh token guardado en Supabase.
 * Si el refresh falla, devuelve null.
 */
export async function refreshGHLToken(orgId: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('ghl_refresh_token')
    .eq('id', orgId)
    .single()

  if (!org?.ghl_refresh_token) return null

  const res = await fetch('https://services.leadconnectorhq.com/oauth/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     process.env.GHL_CLIENT_ID!,
      client_secret: process.env.GHL_CLIENT_SECRET!,
      grant_type:    'refresh_token',
      refresh_token: org.ghl_refresh_token,
      user_type:     'Location',
      redirect_uri:  process.env.GHL_REDIRECT_URI!,
    }),
  })

  if (!res.ok) {
    console.error('[refreshGHLToken] Refresh falló:', res.status, await res.text())
    return null
  }

  const tokens = await res.json() as { access_token: string; refresh_token: string }

  await supabase
    .from('organizations')
    .update({
      ghl_access_token:  tokens.access_token,
      ghl_refresh_token: tokens.refresh_token,
    })
    .eq('id', orgId)

  return tokens.access_token
}

/**
 * Envía un SMS a un contacto de GHL.
 * Si el token expiró (401), intenta refresh automático y reintenta una vez.
 */
export async function sendGHLMessage(
  orgId:       string,
  contactId:   string,
  locationId:  string,
  message:     string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const supabase = createServiceClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('ghl_access_token')
    .eq('id', orgId)
    .single()

  if (!org?.ghl_access_token) {
    return { success: false, error: 'GHL no conectado — falta access token.' }
  }

  const attempt = async (token: string) =>
    fetch('https://services.leadconnectorhq.com/conversations/messages', {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
        Version:        '2021-04-15',
      },
      body: JSON.stringify({
        type:       'SMS',
        contactId,
        locationId,
        message,
      }),
    })

  let res = await attempt(org.ghl_access_token)

  // Si 401, refrescar y reintentar una vez
  if (res.status === 401) {
    const newToken = await refreshGHLToken(orgId)
    if (!newToken) return { success: false, error: 'Token de GHL expirado y no se pudo refrescar.' }
    res = await attempt(newToken)
  }

  if (!res.ok) {
    const errText = await res.text()
    return { success: false, error: `GHL API ${res.status}: ${errText}` }
  }

  const data = await res.json() as { id?: string; conversationId?: string }
  return { success: true, messageId: data.id ?? data.conversationId }
}
