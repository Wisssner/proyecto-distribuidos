'use client'

import { useState } from 'react'
import { ProductCard } from '@/components/client/product-card'
import { getProductos } from '@/lib/store'
import type { CategoriaProducto } from '@/lib/types'
import { cn } from '@/lib/utils'

const TABS: Array<{ value: CategoriaProducto | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todo el menú' },
  { value: 'pizzas', label: 'Pizzas' },
  { value: 'entradas', label: 'Entradas' },
  { value: 'bebidas', label: 'Bebidas' },
]

export function MenuCatalog() {
  const [tab, setTab] = useState<CategoriaProducto | 'todos'>('todos')
  const productos = getProductos()
  const visibles =
    tab === 'todos' ? productos : productos.filter((p) => p.categoria === tab)

  return (
    <div>
      <div
        className="sticky top-16 z-30 -mx-4 mb-6 flex gap-2 overflow-x-auto border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:px-2 sm:py-2"
        role="tablist"
        aria-label="Categorías del menú"
      >
        {TABS.map((t) => {
          const active = tab === t.value
          return (
            <button
              key={t.value}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No hay productos en esta categoría.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}
