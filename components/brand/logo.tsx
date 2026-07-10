import { Pizza } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PapaYonLogo({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'light'
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg text-primary-foreground',
          variant === 'light' ? 'bg-primary' : 'bg-primary',
        )}
      >
        <Pizza className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          'font-display text-lg font-extrabold leading-none tracking-tight',
          variant === 'light' ? 'text-sidebar-foreground' : 'text-foreground',
        )}
      >
        Papa<span className="text-primary">Yon</span>
      </span>
    </span>
  )
}
