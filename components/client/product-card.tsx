import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatMoney } from '@/lib/labels'
import type { Producto } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_LABEL: Record<string, string> = {
  pizzas: 'Pizza',
  entradas: 'Entrada',
  bebidas: 'Bebida',
}

export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link
      href={`/menu/${producto.id}`}
      className="group block"
      aria-label={`Ver detalle de ${producto.nombre}`}
    >
      <article
        className={cn(
          'flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
          'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        )}
      >
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <Image
            src={producto.imagen || '/placeholder.svg'}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {producto.destacado && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow-sm">
              Favorito
            </span>
          )}
          {!producto.disponible && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                No disponible
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {CATEGORY_LABEL[producto.categoria] ?? producto.categoria}
            </span>
            <h3 className="mt-0.5 font-display text-base font-bold leading-tight text-balance">
              {producto.nombre}
            </h3>
            {producto.descripcion && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {producto.descripcion}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] text-muted-foreground">Desde</span>
              <div className="font-display text-lg font-extrabold text-foreground">
                {formatMoney(producto.precio)}
              </div>
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-110">
              <ChevronRight className="size-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
