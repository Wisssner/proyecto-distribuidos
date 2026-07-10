'use client'

import { useSyncExternalStore } from 'react'
import type {
  CanalPedido,
  DetallePedido,
  EstadoPago,
  EstadoPedido,
  MetodoPago,
  Pago,
  Pedido,
  Producto,
} from '@/lib/types'

// ---------------------------------------------------------------------------
// Prototype in-memory store. Mirrors the real API surface
// (GET /productos, POST /pedidos, GET /pedidos, PATCH /pedidos/:id/estado,
//  PATCH /pedidos/:id/pago) with client-side simulated persistence + a
// simulated RabbitMQ "worker cocina" event origin on state transitions.
// ---------------------------------------------------------------------------

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

const SEED_PRODUCTOS: Producto[] = [
  {
    id: 'prod_margarita',
    nombre: 'Pizza Margarita',
    descripcion: 'Salsa de tomate, mozzarella fresca y albahaca de la casa.',
    precio: 32.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-margarita.png',
    destacado: true,
  },
  {
    id: 'prod_pepperoni',
    nombre: 'Pizza Pepperoni',
    descripcion: 'Doble pepperoni americano y mozzarella gratinada.',
    precio: 38.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-pepperoni.png',
    destacado: true,
  },
  {
    id: 'prod_hawaiana',
    nombre: 'Pizza Hawaiana',
    descripcion: 'Jamón, piña natural y mozzarella sobre masa artesanal.',
    precio: 36.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-hawaiana.png',
  },
  {
    id: 'prod_cuatro_quesos',
    nombre: 'Pizza Cuatro Quesos',
    descripcion: 'Mozzarella, parmesano, cheddar y queso azul.',
    precio: 41.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-cuatro-quesos.png',
  },
  {
    id: 'prod_suprema',
    nombre: 'Pizza Suprema',
    descripcion: 'Pepperoni, pimiento, cebolla, champiñón y aceitunas.',
    precio: 43.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-suprema.png',
    destacado: true,
  },
  {
    id: 'prod_vegetariana',
    nombre: 'Pizza Vegetariana',
    descripcion: 'Pimiento, champiñón, tomate cherry, espinaca y cebolla.',
    precio: 37.9,
    disponible: true,
    categoria: 'pizzas',
    imagen: '/images/pizza-vegetariana.png',
  },
  {
    id: 'prod_pan_ajo',
    nombre: 'Pan al Ajo',
    descripcion: 'Palitos de pan horneados con ajo, mantequilla y queso.',
    precio: 14.9,
    disponible: true,
    categoria: 'entradas',
    imagen: '/images/pan-ajo.png',
  },
  {
    id: 'prod_alitas',
    nombre: 'Alitas BBQ',
    descripcion: '8 alitas glaseadas en salsa buffalo casera.',
    precio: 24.9,
    disponible: true,
    categoria: 'entradas',
    imagen: '/images/alitas.png',
  },
  {
    id: 'prod_gaseosa',
    nombre: 'Gaseosa 1.5L',
    descripcion: 'Bebida gaseosa personal o para compartir, bien fría.',
    precio: 9.9,
    disponible: true,
    categoria: 'bebidas',
    imagen: '/images/gaseosa.png',
  },
]

function nowMinus(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function makeDetalle(productoId: string, cantidad: number): DetallePedido {
  const producto = SEED_PRODUCTOS.find((p) => p.id === productoId)!
  return {
    id: uid('det'),
    productoId,
    cantidad,
    precioUnitario: producto.precio,
    producto,
  }
}

function totalOf(detalles: DetallePedido[]): number {
  return detalles.reduce((sum, d) => sum + d.precioUnitario * d.cantidad, 0)
}

let numeroSeq = 100

function seedPedido(
  estado: EstadoPedido,
  canal: CanalPedido,
  metodo: MetodoPago,
  estadoPago: EstadoPago,
  minsAgo: number,
  items: Array<{ productoId: string; cantidad: number }>,
): Pedido {
  const detalles = items.map((i) => makeDetalle(i.productoId, i.cantidad))
  const total = totalOf(detalles)
  const numero = numeroSeq++
  const flow: EstadoPedido[] = [
    'creado',
    'en_preparacion',
    'listo',
    'en_camino',
    'entregado',
  ]
  const idx = flow.indexOf(estado)
  const historial = flow.slice(0, idx + 1).map((e, i) => ({
    id: uid('est'),
    estadoAnterior: i === 0 ? null : flow[i - 1],
    estadoNuevo: e,
    origen: (i === 0 ? 'api_core' : 'worker_cocina') as
      | 'api_core'
      | 'worker_cocina',
    creadoEn: nowMinus(minsAgo - i * 2),
  }))
  return {
    id: uid('ped'),
    numero,
    estado,
    canal,
    total,
    creadoEn: nowMinus(minsAgo),
    actualizadoEn: nowMinus(Math.max(0, minsAgo - idx * 2)),
    detalles,
    pagos: [
      {
        id: uid('pago'),
        metodo,
        monto: total,
        estado: estadoPago,
      },
    ],
    historialEstados: historial,
  }
}

let pedidos: Pedido[] = [
  seedPedido('creado', 'web', 'yape_plin', 'pendiente', 4, [
    { productoId: 'prod_pepperoni', cantidad: 1 },
    { productoId: 'prod_gaseosa', cantidad: 1 },
  ]),
  seedPedido('creado', 'mostrador', 'efectivo', 'pendiente', 7, [
    { productoId: 'prod_margarita', cantidad: 2 },
  ]),
  seedPedido('en_preparacion', 'web', 'tarjeta', 'pagado', 12, [
    { productoId: 'prod_suprema', cantidad: 1 },
    { productoId: 'prod_alitas', cantidad: 1 },
  ]),
  seedPedido('en_preparacion', 'telefono', 'efectivo', 'pendiente', 15, [
    { productoId: 'prod_hawaiana', cantidad: 1 },
    { productoId: 'prod_pan_ajo', cantidad: 1 },
  ]),
  seedPedido('listo', 'web', 'yape_plin', 'pagado', 22, [
    { productoId: 'prod_cuatro_quesos', cantidad: 1 },
  ]),
  seedPedido('en_camino', 'web', 'tarjeta', 'pagado', 34, [
    { productoId: 'prod_vegetariana', cantidad: 1 },
    { productoId: 'prod_gaseosa', cantidad: 2 },
  ]),
  seedPedido('entregado', 'mostrador', 'efectivo', 'pagado', 58, [
    { productoId: 'prod_pepperoni', cantidad: 2 },
    { productoId: 'prod_pan_ajo', cantidad: 1 },
  ]),
  seedPedido('entregado', 'web', 'yape_plin', 'pagado', 74, [
    { productoId: 'prod_margarita', cantidad: 1 },
  ]),
]

// --- pub/sub ---------------------------------------------------------------

const listeners = new Set<() => void>()

function emit() {
  // new array reference so useSyncExternalStore detects the change
  pedidos = [...pedidos]
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

// --- read helpers ----------------------------------------------------------

export function getProductos(): Producto[] {
  return SEED_PRODUCTOS
}

export function getPedidos(): Pedido[] {
  return pedidos
}

function snapshot() {
  return pedidos
}

// --- mutations (mirror API endpoints) --------------------------------------

export interface CrearPedidoInput {
  canal?: CanalPedido
  metodoPago?: MetodoPago
  items: Array<{ productoId: string; cantidad: number }>
}

export function crearPedido(input: CrearPedidoInput): Pedido {
  const detalles = input.items.map((i) =>
    makeDetalle(i.productoId, i.cantidad),
  )
  const total = totalOf(detalles)
  const iso = new Date().toISOString()
  const metodo = input.metodoPago ?? 'efectivo'
  const pago: Pago = {
    id: uid('pago'),
    metodo,
    monto: total,
    estado: 'pendiente',
  }
  const pedido: Pedido = {
    id: uid('ped'),
    numero: numeroSeq++,
    estado: 'creado',
    canal: input.canal ?? 'web',
    total,
    creadoEn: iso,
    actualizadoEn: iso,
    detalles,
    pagos: [pago],
    historialEstados: [
      {
        id: uid('est'),
        estadoAnterior: null,
        estadoNuevo: 'creado',
        origen: 'api_core',
        creadoEn: iso,
      },
    ],
  }
  pedidos = [pedido, ...pedidos]
  emit()
  return pedido
}

export function actualizarEstado(
  id: string,
  estado: EstadoPedido,
  origen: 'api_core' | 'worker_cocina' = 'worker_cocina',
) {
  pedidos = pedidos.map((p) => {
    if (p.id !== id) return p
    const iso = new Date().toISOString()
    return {
      ...p,
      estado,
      actualizadoEn: iso,
      historialEstados: [
        ...(p.historialEstados ?? []),
        {
          id: uid('est'),
          estadoAnterior: p.estado,
          estadoNuevo: estado,
          origen,
          creadoEn: iso,
        },
      ],
    }
  })
  emit()
}

export function actualizarPago(id: string, estado: EstadoPago) {
  pedidos = pedidos.map((p) => {
    if (p.id !== id) return p
    const iso = new Date().toISOString()
    const pagos = (p.pagos ?? []).map((pago) => ({ ...pago, estado }))
    return { ...p, pagos, actualizadoEn: iso }
  })
  emit()
}

export function getPedido(id: string): Pedido | undefined {
  return pedidos.find((p) => p.id === id)
}

// --- React hooks -----------------------------------------------------------

export function usePedidos(): Pedido[] {
  return useSyncExternalStore(subscribe, snapshot, snapshot)
}

export function usePedido(id: string): Pedido | undefined {
  const all = useSyncExternalStore(subscribe, snapshot, snapshot)
  return all.find((p) => p.id === id)
}
