import { type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ModuleHeaderProps {
  icon: LucideIcon
  iconColor?: string
  name: string
  codename?: string
  description: string
  status?: 'active' | 'paused' | 'not_configured'
  className?: string
}

const statusConfig = {
  active:          { label: 'Activo',         variant: 'success'  as const },
  paused:          { label: 'Pausado',         variant: 'warning'  as const },
  not_configured:  { label: 'Sin configurar',  variant: 'outline'  as const },
}

export function ModuleHeader({
  icon: Icon,
  iconColor = 'text-primary',
  name,
  codename,
  description,
  status = 'not_configured',
  className,
}: ModuleHeaderProps) {
  const s = statusConfig[status]

  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex items-start gap-4">
        <div className={cn('mt-0.5 rounded-lg p-2.5 bg-primary/10')}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{name}</h1>
            {codename && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {codename}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge variant={s.variant}>{s.label}</Badge>
    </div>
  )
}
