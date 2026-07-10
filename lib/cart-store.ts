'use client'

/**
 * Client-side cart store.
 *
 * Each CartItem holds a product plus the frontend-only customisation the user
 * selected in the PDP (size, masa, extras). When the order is confirmed these
 * fields are NOT sent to the backend; the cart is resolved to the same
 * { productoId, cantidad } structure that crearPedido() already expects.
 */

import { useSyncExternalStore } from 'react'
import type { Producto } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PizzaSize = 'personal' | 'mediana' | 'familiar'
export type PizzaMasa = 'clasica' | 'delgada' | 'borde_relleno'

export interface PizzaExtra {
  id: string
  label: string
  precio: number
}

export const PIZZA_SIZES: Array<{ value: PizzaSize; label: string; desc: string; factor: number }> = [
  { value: 'personal', label: 'Personal', desc: '6 porciones · 26 cm', factor: 0 },
  { value: 'mediana', label: 'Mediana', desc: '8 porciones · 32 cm', factor: 8 },
  { value: 'familiar', label: 'Familiar', desc: '12 porciones · 40 cm', factor: 16 },
]

export const PIZZA_MASAS: Array<{ value: PizzaMasa; label: string; desc: string }> = [
  { value: 'clasica', label: 'Clásica', desc: 'Masa gruesa y esponjosa' },
  { value: 'delgada', label: 'Delgada', desc: 'Crocante y liviana' },
  { value: 'borde_relleno', label: 'Borde relleno', desc: '+S/ 6.00' },
]

export const PIZZA_EXTRAS: PizzaExtra[] = [
  { id: 'extra_queso', label: 'Extra queso', precio: 4 },
  { id: 'extra_pepperoni', label: 'Extra pepperoni', precio: 5 },
  { id: 'extra_champi', label: 'Champiñones', precio: 3 },
  { id: 'extra_jamon', label: 'Jamón', precio: 4 },
]

export interface CartItem {
  /** Unique key in the cart (product + customisation hash) */
  cartKey: string
  producto: Producto
  cantidad: number
  // Customisation – only relevant for pizzas, optional for other categories
  size?: PizzaSize
  masa?: PizzaMasa
  extras?: string[] // extra ids
  /** Resolved unit price (base + size surcharge + borde + extras) */
  precioUnitario: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcPrice(producto: Producto, size?: PizzaSize, masa?: PizzaMasa, extras?: string[]): number {
  let price = producto.precio
  if (producto.categoria === 'pizzas') {
    const sizeFactor = PIZZA_SIZES.find((s) => s.value === size)?.factor ?? 0
    price += sizeFactor
    if (masa === 'borde_relleno') price += 6
    for (const eid of extras ?? []) {
      price += PIZZA_EXTRAS.find((e) => e.id === eid)?.precio ?? 0
    }
  }
  return price
}

function makeKey(productoId: string, size?: PizzaSize, masa?: PizzaMasa, extras?: string[]): string {
  return [productoId, size ?? '', masa ?? '', ...(extras ?? []).sort()].join('|')
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let cart: CartItem[] = []
const listeners = new Set<() => void>()

function emit() {
  cart = [...cart]
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function snapshot(): CartItem[] {
  return cart
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export interface AddToCartInput {
  producto: Producto
  size?: PizzaSize
  masa?: PizzaMasa
  extras?: string[]
}

export function addToCart(input: AddToCartInput): void {
  const { producto, size, masa, extras } = input
  const key = makeKey(producto.id, size, masa, extras)
  const precioUnitario = calcPrice(producto, size, masa, extras)

  const existing = cart.find((i) => i.cartKey === key)
  if (existing) {
    cart = cart.map((i) =>
      i.cartKey === key ? { ...i, cantidad: i.cantidad + 1 } : i,
    )
  } else {
    cart = [
      ...cart,
      { cartKey: key, producto, cantidad: 1, size, masa, extras, precioUnitario },
    ]
  }
  emit()
}

export function updateQty(cartKey: string, delta: number): void {
  cart = cart
    .map((i) => (i.cartKey === cartKey ? { ...i, cantidad: i.cantidad + delta } : i))
    .filter((i) => i.cantidad > 0)
  emit()
}

export function removeFromCart(cartKey: string): void {
  cart = cart.filter((i) => i.cartKey !== cartKey)
  emit()
}

export function clearCart(): void {
  cart = []
  emit()
}

export function cartTotal(): number {
  return cart.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0)
}

export function cartCount(): number {
  return cart.reduce((sum, i) => sum + i.cantidad, 0)
}

// ---------------------------------------------------------------------------
// React hooks
// ---------------------------------------------------------------------------

export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}
