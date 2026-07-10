import { Check } from 'lucide-react'
import { ESTADO_PEDIDO, formatTime, ORIGEN_LABEL } from '@/lib/labels'
import type { EstadoPedidoHistorial } from '@/lib/types'
import { ORDER_FLOW } from '@/lib/types'
import { cn } from '@/lib/utils'

export function OrderTimeline({
  historial,
  estadoActual,
}: {
  historial: EstadoPedidoHistorial[]
  estadoActual: string
}) {
  const reachedIndex = ORDER_FLOW.indexOf(estadoActual as never)

  return (
    <ol className="relative space-y-0">
      {ORDER_FLOW.map((estado, i) => {
        const cfg = ESTADO_PEDIDO[estado]
        const entry = historial.find((h) => h.estadoNuevo === estado)
        const done = i <= reachedIndex
        const current = i === reachedIndex
        const isLast = i === ORDER_FLOW.length - 1
        return (
          <li key={estado} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground',
                  current && 'ring-4 ring-primary/15',
                )}
              >
                {done ? (
                  <Check className="size-4" />
                ) : (
                  <span className="size-2 rounded-full bg-current" />
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    'my-1 w-0.5 flex-1',
                    i < reachedIndex ? 'bg-primary' : 'bg-border',
                  )}
                  style={{ minHeight: '2rem' }}
                />
              )}
            </div>
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p
                className={cn(
                  'font-display text-sm font-bold',
                  done ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {cfg.label}
              </p>
              {entry ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTime(entry.creadoEn)} ·{' '}
                  <span className="font-medium">
                    {ORIGEN_LABEL[entry.origen]}
                  </span>
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground/60">
                  Pendiente
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
