'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Banknote,
  ChevronRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney, METODO_PAGO } from '@/lib/labels'
import {
  clearCart,
  removeFromCart,
  updateQty,
  useCart,
  type PizzaMasa,
  type PizzaSize,
  PIZZA_MASAS,
  PIZZA_SIZES,
} from '@/lib/cart-store'
import { crearPedido } from '@/lib/store'
import type { MetodoPago } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE_LABEL: Record<PizzaSize, string> = {
  personal: 'Personal',
  mediana: 'Mediana',
  familiar: 'Familiar',
}

const MASA_LABEL: Record<PizzaMasa, string> = {
  clasica: 'Masa clásica',
  delgada: 'Masa delgada',
  borde_relleno: 'Borde relleno',
}

const PAGOS: Array<{ value: MetodoPago; icon: typeof Banknote; label: string }> = [
  { value: 'efectivo', icon: Banknote, label: 'Efectivo' },
  { value: 'tarjeta', icon: CreditCard, label: 'Tarjeta' },
  { value: 'yape_plin', icon: Smartphone, label: 'Yape / Plin' },
]

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <ShoppingBag className="size-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold">Tu carrito está vacío</h2>
        <p className="mt-1 text-muted-foreground">
          Explora el menú y agrega tus pizzas favoritas para empezar.
        </p>
      </div>
      <Button render={<Link href="/#menu" />} size="lg" className="gap-2">
        Ver el menú
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cart item row
// ---------------------------------------------------------------------------

function CartRow({ item }: { item: ReturnType<typeof useCart>[number] }) {
  const { cartKey, producto, cantidad, size, masa, extras, precioUnitario } = item

  const customLines: string[] = []
  if (size) customLines.push(SIZE_LABEL[size])
  if (masa) customLines.push(MASA_LABEL[masa])
  if (extras && extras.length > 0) {
    customLines.push(`+ ${extras.length} adicional${extras.length > 1 ? 'es' : ''}`)
  }

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={producto.imagen || '/placeholder.svg'}
          alt={producto.nombre}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-1.5">
        <div>
          <h3 className="font-display text-sm font-bold leading-tight">
            {producto.nombre}
          </h3>
          {customLines.length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {customLines.join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Qty control */}
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-1.5 py-1">
            <button
              type="button"
              onClick={() => updateQty(cartKey, -1)}
              aria-label="Quitar uno"
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-bold tabular-nums">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => updateQty(cartKey, 1)}
              aria-label="Agregar uno"
              className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          {/* Price + remove */}
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-extrabold tabular-nums">
              {formatMoney(precioUnitario * cantidad)}
            </span>
            <button
              type="button"
              onClick={() => removeFromCart(cartKey)}
              aria-label={`Eliminar ${producto.nombre}`}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main checkout
// ---------------------------------------------------------------------------

export function CartCheckout() {
  const router = useRouter()
  const items = useCart()
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [submitting, setSubmitting] = useState(false)

  const total = items.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0)
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
    setTimeout(() => {
      clearCart()
      toast.success(`Pedido #${pedido.numero} registrado`, {
        description: 'Enviado a cocina vía la cola de eventos.',
      })
      router.push(`/pedido/${pedido.id}`)
    }, 650)
  }

  if (items.length === 0) {
    return (
      <div className="py-4">
        <EmptyCart />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ------------------------------------------------------------------ */}
      {/* Left – Item list */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <ShoppingBag className="size-5 text-primary" />
            Tu carrito
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {count} {count === 1 ? 'ítem' : 'ítems'}
            </span>
          </h2>
        </div>

        <div className="divide-y divide-border px-5">
          {items.map((item) => (
            <CartRow key={item.cartKey} item={item} />
          ))}
        </div>

        <div className="border-t border-border px-5 py-4">
          <Button
            render={<Link href="/#menu" />}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <Plus className="size-3.5" />
            Agregar más productos
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right – Summary & confirm */}
      {/* ------------------------------------------------------------------ */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-bold">Resumen del pedido</h2>
          </div>

          <div className="space-y-4 p-5">
            {/* Line items */}
            <div className="space-y-2">
              {items.map((i) => (
                <div
                  key={i.cartKey}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                      {i.cantidad}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {i.producto.nombre}
                      {i.size && (
                        <span className="ml-1 text-xs text-muted-foreground/70">
                          ({SIZE_LABEL[i.size]})
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatMoney(i.precioUnitario * i.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div className="border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Método de pago
              </p>
              <div className="grid grid-cols-3 gap-2">
                {PAGOS.map((p) => {
                  const active = metodo === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setMetodo(p.value)}
                      aria-pressed={active}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition-colors',
                        active
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <p.icon className="size-5" />
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Total a pagar</p>
                <p className="font-display text-3xl font-extrabold">
                  {formatMoney(total)}
                </p>
              </div>
            </div>

            {/* Confirm */}
            <Button
              className="h-12 w-full gap-2 text-base"
              onClick={confirmar}
              disabled={submitting}
            >
              <ShoppingBag className="size-5" />
              {submitting ? 'Registrando…' : 'Confirmar pedido'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Se enviará a cocina vía la cola de eventos (RabbitMQ).
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}
