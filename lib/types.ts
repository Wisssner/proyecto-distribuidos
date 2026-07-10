// Domain types mirroring the real Papa Yon backend (libs/shared/src/entities + enums).
// Source of truth: proyecto-distribuidos NestJS backend.

export type EstadoPedido =
  | 'creado'
  | 'en_preparacion'
  | 'listo'
  | 'en_camino'
  | 'entregado'

export type CanalPedido = 'web' | 'mostrador' | 'telefono'

export type MetodoPago = 'efectivo' | 'tarjeta' | 'yape_plin'

export type EstadoPago = 'pendiente' | 'pagado' | 'rechazado'

export type OrigenEstado = 'api_core' | 'worker_cocina'

export type RolUsuario = 'cliente' | 'cajero' | 'cocina' | 'repartidor' | 'admin'

export interface Producto {
  id: string
  nombre: string
  descripcion?: string | null
  precio: number
  disponible: boolean
  // Frontend-only display augmentations (not part of the persisted entity)
  categoria: CategoriaProducto
  imagen: string
  destacado?: boolean
}

export type CategoriaProducto = 'pizzas' | 'entradas' | 'bebidas'

export interface DetallePedido {
  id: string
  productoId: string
  cantidad: number
  precioUnitario: number
  producto?: Producto
}

export interface Pago {
  id: string
  metodo: MetodoPago
  monto: number
  estado: EstadoPago
}

export interface EstadoPedidoHistorial {
  id: string
  estadoAnterior?: EstadoPedido | null
  estadoNuevo: EstadoPedido
  origen: OrigenEstado
  creadoEn: string
}

export interface Pedido {
  id: string
  numero: number
  estado: EstadoPedido
  canal: CanalPedido
  total: number
  creadoEn: string
  actualizadoEn: string
  detalles: DetallePedido[]
  pagos?: Pago[]
  historialEstados?: EstadoPedidoHistorial[]
}

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: RolUsuario
}

export const ORDER_FLOW: EstadoPedido[] = [
  'creado',
  'en_preparacion',
  'listo',
  'en_camino',
  'entregado',
]
