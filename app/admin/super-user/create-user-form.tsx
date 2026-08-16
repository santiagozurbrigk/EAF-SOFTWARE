'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, UserPlus, Copy, Check, Eye, EyeOff, X } from 'lucide-react'

interface CreatedClient {
  email: string
  password: string
  fullName: string
  orgName: string
}

export function CreateUserForm() {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedClient | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [orgName, setOrgName]   = useState('')

  const [showPwd, setShowPwd]                  = useState(false)
  const [copied, setCopied]                    = useState<'email' | 'password' | 'all' | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/create-user', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ full_name: fullName.trim(), email: email.trim(), org_name: orgName.trim() }),
    })

    const data = await res.json() as { email?: string; password?: string; fullName?: string; error?: string }

    if (!res.ok || data.error) {
      setError(data.error ?? 'Error desconocido')
      setLoading(false)
      return
    }

    setCreated({ email: data.email!, password: data.password!, fullName: data.fullName!, orgName: orgName.trim() })
    setLoading(false)
  }

  async function copy(text: string, key: 'email' | 'password' | 'all') {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function reset() {
    setCreated(null)
    setFullName('')
    setEmail('')
    setOrgName('')
    setError(null)
    setOpen(false)
    setShowPwd(false)
  }

  // ─── Botón de entrada ────────────────────────────────────────────────────
  if (!open && !created) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-2">
        <UserPlus className="h-4 w-4" />
        Crear cliente
      </Button>
    )
  }

  // ─── Pantalla de credenciales ─────────────────────────────────────────────
  if (created) {
    const allText = `Email: ${created.email}\nContraseña: ${created.password}`
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✅ Cliente creado exitosamente</CardTitle>
          <CardDescription>
            Enviá estas credenciales a <strong>{created.fullName}</strong> — puede cambiar la contraseña después.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border border-border bg-background p-3 space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="text-sm font-mono truncate">{created.email}</p>
              </div>
              <Button
                size="icon" variant="ghost" className="h-7 w-7 shrink-0"
                onClick={() => copy(created.email, 'email')}
              >
                {copied === 'email'
                  ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                  : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {/* Contraseña */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Contraseña temporal</p>
                <p className="text-sm font-mono">
                  {showPwd ? created.password : '•'.repeat(created.password.length)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd
                    ? <EyeOff className="h-3.5 w-3.5" />
                    : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon" variant="ghost" className="h-7 w-7"
                  onClick={() => copy(created.password, 'password')}
                >
                  {copied === 'password'
                    ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                    : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            {/* Org */}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Organización</p>
              <p className="text-sm">{created.orgName}</p>
            </div>
          </div>

          {/* Copiar todo */}
          <Button
            variant="outline" size="sm" className="w-full gap-2"
            onClick={() => copy(allText, 'all')}
          >
            {copied === 'all'
              ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copiado</>
              : <><Copy className="h-3.5 w-3.5" /> Copiar email + contraseña</>}
          </Button>

          <p className="text-xs text-amber-400/80">
            ⚠️ Guardá la contraseña ahora — no se puede recuperar desde acá.
          </p>

          <Button size="sm" variant="ghost" onClick={reset} className="w-full text-muted-foreground">
            Crear otro cliente
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ─── Formulario ───────────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Crear nuevo cliente</CardTitle>
            <CardDescription className="mt-0.5">
              Se crea el usuario, la org y la cuenta queda activa de inmediato.
            </CardDescription>
          </div>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground -mt-1 -mr-1"
            onClick={() => { setOpen(false); setError(null) }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="email"
              placeholder="Email del cliente"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Input
            placeholder="Nombre de la organización / agencia"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={loading} className="flex-1">
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Crear cliente →'}
            </Button>
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => { setOpen(false); setError(null) }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
