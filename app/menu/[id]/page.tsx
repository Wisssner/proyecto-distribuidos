import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/client/site-header'
import { ProductDetail } from '@/components/client/product-detail'

// Product data defined inline (no 'use client') so it is accessible from the server.
// This mirrors the SEED_PRODUCTOS in lib/store.ts; the in-memory client store keeps
// the authoritative mutable list, but we only need static product metadata here.

const PRODUCTOS = [
  { id: 'prod_margarita', nome: 'Pizza Margarita', nombre: 'Pizza Margarita', descripcion: 'Salsa de tomate, mozzarella fresca y albahaca de la casa.', precio: 32.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-margarita.png', destacado: true },
  { id: 'prod_pepperoni', nombre: 'Pizza Pepperoni', descripcion: 'Doble pepperoni americano y mozzarella gratinada.', precio: 38.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-pepperoni.png', destacado: true },
  { id: 'prod_hawaiana', nombre: 'Pizza Hawaiana', descripcion: 'Jamón, piña natural y mozzarella sobre masa artesanal.', precio: 36.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-hawaiana.png' },
  { id: 'prod_cuatro_quesos', nombre: 'Pizza Cuatro Quesos', descripcion: 'Mozzarella, parmesano, cheddar y queso azul.', precio: 41.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-cuatro-quesos.png' },
  { id: 'prod_suprema', nombre: 'Pizza Suprema', descripcion: 'Pepperoni, pimiento, cebolla, champiñón y aceitunas.', precio: 43.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-suprema.png', destacado: true },
  { id: 'prod_vegetariana', nombre: 'Pizza Vegetariana', descripcion: 'Pimiento, champiñón, tomate cherry, espinaca y cebolla.', precio: 37.9, disponible: true, categoria: 'pizzas' as const, imagen: '/images/pizza-vegetariana.png' },
  { id: 'prod_pan_ajo', nombre: 'Pan al Ajo', descripcion: 'Palitos de pan horneados con ajo, mantequilla y queso.', precio: 14.9, disponible: true, categoria: 'entradas' as const, imagen: '/images/pan-ajo.png' },
  { id: 'prod_alitas', nombre: 'Alitas BBQ', descripcion: '8 alitas glaseadas en salsa buffalo casera.', precio: 24.9, disponible: true, categoria: 'entradas' as const, imagen: '/images/alitas.png' },
  { id: 'prod_gaseosa', nombre: 'Gaseosa 1.5L', descripcion: 'Bebida gaseosa personal o para compartir, bien fría.', precio: 9.9, disponible: true, categoria: 'bebidas' as const, imagen: '/images/gaseosa.png' },
]

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const producto = PRODUCTOS.find((p) => p.id === id)

  if (!producto) notFound()

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <ProductDetail producto={producto} />
    </div>
  )
}
