import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('card-hover', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="metric-value">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('rounded-md p-2 bg-primary/10', iconColor.replace('text-', 'bg-').replace('-400', '-500/10').replace('-500', '-500/10'))}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <span
              className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-xs text-muted-foreground">vs. 30 días</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
