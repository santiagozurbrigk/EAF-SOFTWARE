'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirm] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [emailSent, setEmailSent]     = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() || email },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })

    if (signUpError) {
      // Supabase devuelve "User already registered" si el email ya existe
      if (signUpError.message.toLowerCase().includes('already registered')) {
        setError('Ya existe una cuenta con ese email. Intentá iniciar sesión.')
      } else {
        setError('Error al crear la cuenta. Verificá los datos e intentá de nuevo.')
      }
      setLoading(false)
      return
    }

    // Si hay sesión activa inmediatamente (email confirmation desactivado en Supabase)
    if (data.session) {
      router.push('/onboarding')
      router.refresh()
      return
    }

    // Email de confirmación enviado — mostrar pantalla de éxito
    setEmailSent(true)
    setLoading(false)
  }

  // ─── Pantalla de "revisá tu email" ───────────────────────────────────────
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Revisá tu email</h1>
          <p className="text-sm text-muted-foreground">
            Te enviamos un link de confirmación a{' '}
            <span className="font-medium text-foreground">{email}</span>.
            Hacé clic en el link para activar tu cuenta.
          </p>
        </div>
        <div className="rounded-md bg-muted/50 px-4 py-3 text-xs text-muted-foreground text-left space-y-1">
          <p>✉️ Revisá también la carpeta de spam.</p>
          <p>🕐 El link expira en 24 horas.</p>
          <p>🔒 Una vez confirmado, podrás configurar tu workspace.</p>
        </div>
        <a href="/login" className="block text-sm text-primary hover:underline">
          ← Volver al inicio de sesión
        </a>
      </div>
    )
  }

  // ─── Formulario de registro ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <span className="text-sm font-bold text-white">EAF</span>
        </div>
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evergreen de Alta Frecuencia
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleRegister} className="space-y-3">
        {/* Nombre completo */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9"
            required
            minLength={8}
          />
        </div>

        {/* Confirmar contraseña */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirmá la contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-9"
            required
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear cuenta →'}
        </Button>
      </form>

      {/* Info sobre el proceso */}
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground/70">¿Cómo funciona?</p>
        <p>1. Creás tu cuenta y confirmás el email</p>
        <p>2. Ingresás el nombre de tu organización</p>
        <p>3. El equipo de EAF activa tu acceso (24 hs)</p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <a href="/login" className="text-primary hover:underline">
          Iniciá sesión
        </a>
      </p>
    </div>
  )
}
