'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/labels'
import {
  addToCart,
  cartCount,
  PIZZA_EXTRAS,
  PIZZA_MASAS,
  PIZZA_SIZES,
  type PizzaMasa,
  type PizzaSize,
} from '@/lib/cart-store'
import type { Producto } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Option selector card (size / masa)
// ---------------------------------------------------------------------------

function OptionCard({
  label,
  desc,
  selected,
  completed,
  onClick,
}: {
  label: string
  desc?: string
  selected: boolean
  completed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-1 flex-col gap-0.5 rounded-xl border px-3 py-3 text-left transition-all',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      {completed && (
        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="size-3" strokeWidth={3} />
        </span>
      )}
      <span className="pr-6 text-sm font-bold leading-tight">{label}</span>
      {desc && (
        <span className="text-xs leading-snug text-muted-foreground">{desc}</span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Extra toggle chip
// ---------------------------------------------------------------------------

function ExtraChip({
  label,
  precio,
  selected,
  onClick,
}: {
  label: string
  precio: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground hover:border-primary/40',
      )}
    >
      {selected && <Check className="size-3.5" strokeWidth={3} />}
      {label}
      <span className={cn('text-xs', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
        +{formatMoney(precio)}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function ConfigSection({
  title,
  badge,
  children,
}: {
  title: string
  badge?: 'completado' | 'pendiente'
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">{title}</h2>
        {badge === 'completado' && (
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
            <Check className="size-3" strokeWidth={3} />
            Completado
          </span>
        )}
        {badge === 'pendiente' && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            Elige uno
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Price calculator (pizza-aware)
// ---------------------------------------------------------------------------

function calcPrecio(producto: Producto, size?: PizzaSize, masa?: PizzaMasa, extras?: string[]): number {
  let price = producto.precio
  if (producto.categoria === 'pizzas') {
    price += PIZZA_SIZES.find((s) => s.value === size)?.factor ?? 0
    if (masa === 'borde_relleno') price += 6
    for (const eid of extras ?? []) {
      price += PIZZA_EXTRAS.find((e) => e.id === eid)?.precio ?? 0
    }
  }
  return price
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductDetail({ producto }: { producto: Producto }) {
  const router = useRouter()
  const isPizza = producto.categoria === 'pizzas'

  const [size, setSize] = useState<PizzaSize>('familiar')
  const [masa, setMasa] = useState<PizzaMasa>('clasica')
  const [extras, setExtras] = useState<string[]>([])
  const [added, setAdded] = useState(false)

  const precio = calcPrecio(producto, isPizza ? size : undefined, isPizza ? masa : undefined, isPizza ? extras : undefined)

  function toggleExtra(id: string) {
    setExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    )
  }

  function handleAdd() {
    addToCart({
      producto,
      size: isPizza ? size : undefined,
      masa: isPizza ? masa : undefined,
      extras: isPizza ? extras : undefined,
    })
    setAdded(true)
    const count = cartCount()
    toast.success('Producto agregado al carrito', {
      description: `${count} ${count === 1 ? 'ítem' : 'ítems'} en tu pedido.`,
      action: {
        label: 'Ver carrito',
        onClick: () => router.push('/pedido'),
      },
    })
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* ------------------------------------------------------------------ */}
      {/* Hero image — full-bleed, tall */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative h-[42vh] min-h-64 w-full overflow-hidden bg-muted sm:h-[52vh]">
        <Image
          src={producto.imagen || '/placeholder.svg'}
          alt={producto.nombre}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

        {/* Back button */}
        <div className="absolute left-4 top-4 sm:left-6">
          <Link
            href="/#menu"
            className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-2 text-sm font-semibold text-foreground shadow backdrop-blur-sm transition-colors hover:bg-background"
          >
            <ArrowLeft className="size-4" />
            Menú
          </Link>
        </div>

        {/* Badge */}
        {producto.destacado && (
          <div className="absolute right-4 top-4 sm:right-6">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow">
              Favorito de la casa
            </span>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Content */}
      {/* ------------------------------------------------------------------ */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-32 pt-6 sm:px-6">
        {/* Title & base price */}
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {isPizza ? 'Pizza artesanal' : producto.categoria === 'entradas' ? 'Entrada' : 'Bebida'}
          </span>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-balance">
            {producto.nombre}
          </h1>
          {producto.descripcion && (
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {producto.descripcion}
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Personaliza tu pedido (only for pizzas) */}
        {/* ---------------------------------------------------------------- */}
        {isPizza && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-extrabold">
              Personaliza tu pedido
            </h2>

            {/* Size */}
            <ConfigSection
              title="Elige el tamaño"
              badge={size ? 'completado' : 'pendiente'}
            >
              <div className="flex gap-2">
                {PIZZA_SIZES.map((s) => (
                  <OptionCard
                    key={s.value}
                    label={s.label}
                    desc={s.value === 'personal' ? s.desc : `${s.desc} · +${formatMoney(s.factor)}`}
                    selected={size === s.value}
                    completed={size === s.value}
                    onClick={() => setSize(s.value)}
                  />
                ))}
              </div>
            </ConfigSection>

            {/* Masa */}
            <ConfigSection
              title="Tipo de masa"
              badge={masa ? 'completado' : 'pendiente'}
            >
              <div className="flex gap-2">
                {PIZZA_MASAS.map((m) => (
                  <OptionCard
                    key={m.value}
                    label={m.label}
                    desc={m.desc}
                    selected={masa === m.value}
                    completed={masa === m.value}
                    onClick={() => setMasa(m.value)}
                  />
                ))}
              </div>
            </ConfigSection>

            {/* Extras */}
            <ConfigSection
              title="Adicionales"
              badge={extras.length > 0 ? 'completado' : undefined}
            >
              <div className="flex flex-wrap gap-2">
                {PIZZA_EXTRAS.map((e) => (
                  <ExtraChip
                    key={e.id}
                    label={e.label}
                    precio={e.precio}
                    selected={extras.includes(e.id)}
                    onClick={() => toggleExtra(e.id)}
                  />
                ))}
              </div>
            </ConfigSection>
          </div>
        )}

        {/* Non-pizza products: simple "no customisation needed" note */}
        {!isPizza && (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Este producto no requiere personalización. Solo agrégalo a tu carrito.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Sticky CTA */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Precio total</p>
            <p className="font-display text-2xl font-extrabold">{formatMoney(precio)}</p>
          </div>
          <Button
            size="lg"
            className="h-12 gap-2 px-6 text-base"
            onClick={handleAdd}
            disabled={added}
          >
            <ShoppingBag className="size-5" />
            {added ? 'Agregado' : `Agregar al pedido — ${formatMoney(precio)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
