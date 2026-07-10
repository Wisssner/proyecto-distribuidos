'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Banknote, CreditCard, Minus, Plus, Smartphone, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney, METODO_PAGO } from '@/lib/labels'
import { crearPedido, getProductos } from '@/lib/store'
import type { CategoriaProducto, MetodoPago } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const CATS: Array<{ value: CategoriaProducto; label: string }> = [
  { value: 'pizzas', label: 'Pizzas' },
  { value: 'entradas', label: 'Entradas' },
  { value: 'bebidas', label: 'Bebidas' },
]

const PAGOS: Array<{ value: MetodoPago; icon: typeof Banknote }> = [
  { value: 'efectivo', icon: Banknote },
  { value: 'tarjeta', icon: CreditCard },
  { value: 'yape_plin', icon: Smartphone },
]

export function OrderBuilder() {
  const router = useRouter()
  const params = useSearchParams()
  const productos = getProductos()

  const [cart, setCart] = useState<Record<string, number>>(() => {
    const add = params.get('add')
    return add && productos.some((p) => p.id === add) ? { [add]: 1 } : {}
  })
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [submitting, setSubmitting] = useState(false)

  const add = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c }
      const q = (next[id] ?? 0) - 1
      if (q <= 0) delete next[id]
      else next[id] = q
      return next
    })

  const items = useMemo(
    () =>
      Object.entries(cart).map(([id, cantidad]) => {
        const producto = productos.find((p) => p.id === id)!
        return { producto, cantidad }
      }),
    [cart, productos],
  )

  const total = items.reduce(
    (sum, i) => sum + i.producto.precio * i.cantidad,
    0,
  )
  const count = items.reduce((sum, i) => sum + i.cantidad, 0)

  function confirmar() {
    if (count === 0) return
    setSubmitting(true)
    const pedido = crearPedido({
      canal: 'web',
      metodoPago: metodo,
      items: items.map((i) => ({
        productoId: i.producto.id,
        cantidad: i.cantidad,
      })),
    })
    // Simulate API latency, then route to tracking
    setTimeout(() => {
      toast.success(`Pedido #${pedido.numero} registrado`, {
        description: 'Enviado a cocina vía la cola de eventos.',
      })
      router.push(`/pedido/${pedido.id}`)
    }, 650)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Product selection */}
      <div className="space-y-8">
        {CATS.map((cat) => {
          const list = productos.filter((p) => p.categoria === cat.value)
          if (list.length === 0) return null
          return (
            <section key={cat.value}>
              <h2 className="mb-3 font-display text-lg font-bold">
                {cat.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((p) => {
                  const qty = cart[p.id] ?? 0
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        'flex gap-3 rounded-xl border bg-card p-3 transition-colors',
                        qty > 0 ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border',
                      )}
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={p.imagen || '/placeholder.svg'}
                          alt={p.nombre}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h3 className="truncate font-display text-sm font-bold">
                          {p.nombre}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                          {p.descripcion}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="font-display text-sm font-extrabold">
                            {formatMoney(p.precio)}
                          </span>
                          {qty === 0 ? (
                            <Button size="sm" className="gap-1" onClick={() => add(p.id)}>
                              <Plus className="size-3.5" />
                              Agregar
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => remove(p.id)}
                                aria-label={`Quitar ${p.nombre}`}
                              >
                                <Minus className="size-3.5" />
                              </Button>
                              <span className="w-5 text-center text-sm font-bold tabular-nums">
                                {qty}
                              </span>
                              <Button
                                size="icon-sm"
                                onClick={() => add(p.id)}
                                aria-label={`Agregar ${p.nombre}`}
                              >
                                <Plus className="size-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <ShoppingBag className="size-5 text-primary" />
              Tu pedido
            </h2>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aún no agregas productos. Elige del menú para empezar.
              </p>
            ) : (
              items.map((i) => (
                <div key={i.producto.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                      {i.cantidad}
                    </span>
                    <span className="truncate">{i.producto.nombre}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatMoney(i.producto.precio * i.cantidad)}
                  </span>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-4 border-t border-border p-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Método de pago
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PAGOS.map((p) => {
                    const active = metodo === p.value
                    return (
                      <button
                        key={p.value}
                        onClick={() => setMetodo(p.value)}
                        aria-pressed={active}
                        className={cn(
                          'flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        <p.icon className="size-4" />
                        {METODO_PAGO[p.value]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm text-muted-foreground">
                  Total ({count} {count === 1 ? 'ítem' : 'ítems'})
                </span>
                <span className="font-display text-2xl font-extrabold">
                  {formatMoney(total)}
                </span>
              </div>

              <Button
                className="h-11 w-full text-base"
                onClick={confirmar}
                disabled={submitting}
              >
                {submitting ? 'Registrando…' : 'Confirmar pedido'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Se enviará a cocina mediante la cola de eventos (RabbitMQ).
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
