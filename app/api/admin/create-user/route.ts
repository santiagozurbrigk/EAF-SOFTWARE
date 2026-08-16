import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

/**
 * POST /api/admin/create-user
 *
 * Solo super_admin puede invocar esta ruta.
 * Crea un usuario en Supabase Auth + su organización en un solo paso.
 * La cuenta queda activa de inmediato (sin pasar por pending_activation).
 *
 * Body: { full_name: string, email: string, org_name: string }
 * Response: { email, password, fullName }
 */
export async function POST(req: NextRequest) {
  // 1. Verificar que el caller es super_admin
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()

  if (!caller) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (profile?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Sin permisos de super_admin' }, { status: 403 })
  }

  // 2. Parsear body
  let body: { full_name?: string; email?: string; org_name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const full_name = body.full_name?.trim()
  const email     = body.email?.trim().toLowerCase()
  const org_name  = body.org_name?.trim()

  if (!email || !org_name) {
    return NextResponse.json({ error: 'Email y nombre de organización son requeridos' }, { status: 400 })
  }

  // 3. Generar contraseña temporal (12 chars, URL-safe base64)
  const password = randomBytes(9).toString('base64url')  // 12 chars exactos en base64url

  // 4. Crear usuario en Supabase Auth (email_confirm: true → ya está verificado)
  const service = createServiceClient()
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name || email },
  })

  if (createError || !created.user) {
    console.error('[admin/create-user] Error creando usuario:', createError?.message)
    // Mensaje amigable para email duplicado
    if (createError?.message?.toLowerCase().includes('already been registered')) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }
    return NextResponse.json(
      { error: createError?.message || 'Error creando usuario' },
      { status: 500 }
    )
  }

  // 5. Crear organización activa
  const { error: orgError } = await service
    .from('organizations')
    .insert({ name: org_name, owner_id: created.user.id, status: 'active' })

  if (orgError) {
    // Rollback: borrar el usuario recién creado
    await service.auth.admin.deleteUser(created.user.id)
    console.error('[admin/create-user] Error creando org, rollback ejecutado:', orgError.message)
    return NextResponse.json(
      { error: 'Error creando la organización. El usuario fue eliminado.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ email, password, fullName: full_name || email })
}
