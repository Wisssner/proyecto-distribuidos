import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/labels'
import type { Producto } from '@/lib/types'

export function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <Image
          src={producto.imagen || '/placeholder.svg'}
          alt={producto.nombre}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {producto.destacado && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground shadow-sm">
            Favorito
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <h3 className="font-display text-base font-bold leading-tight text-balance">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {producto.descripcion}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-extrabold text-foreground">
            {formatMoney(producto.precio)}
          </span>
          <Button
            render={<Link href={`/pedido?add=${producto.id}`} />}
            size="sm"
            className="gap-1"
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
      </div>
    </article>
  )
}
