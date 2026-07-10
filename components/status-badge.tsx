import { ESTADO_PAGO, ESTADO_PEDIDO } from '@/lib/labels'
import type { EstadoPago, EstadoPedido } from '@/lib/types'
import { cn } from '@/lib/utils'

export function EstadoBadge({
  estado,
  className,
  withDot = true,
}: {
  estado: EstadoPedido
  className?: string
  withDot?: boolean
}) {
  const cfg = ESTADO_PEDIDO[estado]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        cfg.badge,
        className,
      )}
    >
      {withDot && (
        <span
          className={cn('size-1.5 rounded-full', cfg.dot)}
          aria-hidden="true"
        />
      )}
      {cfg.label}
    </span>
  )
}

export function PagoBadge({
  estado,
  className,
}: {
  estado: EstadoPago
  className?: string
}) {
  const cfg = ESTADO_PAGO[estado]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        cfg.badge,
        className,
      )}
    >
      {cfg.label}
    </span>
  )
}
