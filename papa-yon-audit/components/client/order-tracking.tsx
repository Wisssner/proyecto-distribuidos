'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoBadge, PagoBadge } from '@/components/status-badge'
import { OrderTimeline } from '@/components/order-timeline'
import { usePedido } from '@/lib/store'
import { CANAL_PEDIDO, formatMoney, METODO_PAGO } from '@/lib/labels'

export function OrderTracking({ id }: { id: string }) {
  const pedido = usePedido(id)
  const [pulse, setPulse] = useState(false)

  // Simulated live polling indicator (matches the doc's polling approach).
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 700)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  if (!pedido) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h2 className="font-display text-xl font-bold">Pedido no encontrado</h2>
        <p className="mt-2 text-muted-foreground">
          No pudimos encontrar este pedido. Puede que haya expirado en esta
          sesión de prototipo.
        </p>
        <Button render={<Link href="/pedido" />} className="mt-5">
          Hacer un nuevo pedido
        </Button>
      </div>
    )
  }

  const pago = pedido.pagos?.[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver al menú
          </Link>
          <h1 className="font-display text-3xl font-extrabold">
            Pedido #{pedido.numero}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw
              className={`size-3.5 ${pulse ? 'animate-spin text-primary' : ''}`}
            />
            En vivo
          </span>
          <EstadoBadge estado={pedido.estado} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        {/* Detail */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Detalle</h2>
              {pago && <PagoBadge estado={pago.estado} />}
            </div>
            <ul className="divide-y divide-border">
              {pedido.detalles.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {d.cantidad}
                    </span>
                    {d.producto?.nombre ?? 'Producto'}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(d.precioUnitario * d.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-xl font-extrabold">
                {formatMoney(pedido.total)}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Canal</dt>
                <dd className="font-medium">{CANAL_PEDIDO[pedido.canal]}</dd>
              </div>
              {pago && (
                <div>
                  <dt className="text-xs text-muted-foreground">Método de pago</dt>
                  <dd className="font-medium">{METODO_PAGO[pago.metodo]}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-bold">
            Seguimiento del pedido
          </h2>
          <OrderTimeline
            historial={pedido.historialEstados ?? []}
            estadoActual={pedido.estado}
          />
        </div>
      </div>
    </div>
  )
}
