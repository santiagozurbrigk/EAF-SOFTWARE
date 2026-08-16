'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Radio,
  Layers,
  Zap,
  Flame,
  Link2,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-foreground',
    activeColor: 'text-white',
    activeBg: 'bg-white/10',
  },
  {
    label: 'Sintonizador',
    href: '/sdc',
    icon: Radio,
    color: 'text-blue-400',
    activeColor: 'text-blue-300',
    activeBg: 'bg-blue-500/10',
    sublabel: 'La Fábrica · SDC',
  },
  {
    label: 'Filtro de Banda',
    href: '/campaigns',
    icon: Layers,
    color: 'text-violet-400',
    activeColor: 'text-violet-300',
    activeBg: 'bg-violet-500/10',
    sublabel: 'Blackhole 2.0',
  },
  {
    label: 'Resonancia',
    href: '/resonance',
    icon: Zap,
    color: 'text-amber-400',
    activeColor: 'text-amber-300',
    activeBg: 'bg-amber-500/10',
    sublabel: 'B:52 · Pre-llamada',
  },
  {
    label: 'Lazarus',
    href: '/lazarus',
    icon: Flame,
    color: 'text-rose-400',
    activeColor: 'text-rose-300',
    activeBg: 'bg-rose-500/10',
    sublabel: 'Emisor de Pulsos',
  },
  {
    label: 'Integraciones',
    href: '/integrations',
    icon: Link2,
    color: 'text-muted-foreground',
    activeColor: 'text-white',
    activeBg: 'bg-white/10',
  },
]

interface SidebarProps {
  userEmail?: string
  isSuperAdmin?: boolean
}

export function Sidebar({ userEmail, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <span className="text-xs font-bold text-white">EAF</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">EAF</p>
          <p className="text-[10px] text-muted-foreground">Alta Frecuencia</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? `${item.activeBg} ${item.activeColor} font-medium`
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? item.activeColor : item.color
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate">{item.label}</p>
                {item.sublabel && (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {item.sublabel}
                  </p>
                )}
              </div>
              {isActive && (
                <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
              )}
            </Link>
          )
        })}

        {/* Super Admin (solo visible si es super_admin) */}
        {isSuperAdmin && (
          <>
            <div className="my-2 border-t border-border" />
            <Link
              href="/admin/super-user"
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-yellow-500/10 text-yellow-300 font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Shield className="h-4 w-4 shrink-0 text-yellow-500" />
              <span>Super Admin</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer — usuario */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
            {userEmail?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
