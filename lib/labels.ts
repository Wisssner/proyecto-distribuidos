import type {
  CanalPedido,
  EstadoPago,
  EstadoPedido,
  MetodoPago,
} from '@/lib/types'

// Static class strings so Tailwind can detect them at build time.

export const ESTADO_PEDIDO: Record<
  EstadoPedido,
  { label: string; badge: string; dot: string }
> = {
  creado: {
    label: 'Registrado',
    badge: 'bg-estado-creado text-estado-creado-foreground',
    dot: 'bg-estado-creado-foreground',
  },
  en_preparacion: {
    label: 'En preparación',
    badge: 'bg-estado-preparacion text-estado-preparacion-foreground',
    dot: 'bg-estado-preparacion-foreground',
  },
  listo: {
    label: 'Listo',
    badge: 'bg-estado-listo text-estado-listo-foreground',
    dot: 'bg-estado-listo-foreground',
  },
  en_camino: {
    label: 'En camino',
    badge: 'bg-estado-camino text-estado-camino-foreground',
    dot: 'bg-estado-camino-foreground',
  },
  entregado: {
    label: 'Entregado',
    badge: 'bg-estado-entregado text-estado-entregado-foreground',
    dot: 'bg-estado-entregado-foreground',
  },
}

export const ESTADO_PAGO: Record<
  EstadoPago,
  { label: string; badge: string }
> = {
  pendiente: {
    label: 'Pago pendiente',
    badge: 'bg-pago-pendiente text-pago-pendiente-foreground',
  },
  pagado: {
    label: 'Pagado',
    badge: 'bg-pago-pagado text-pago-pagado-foreground',
  },
  rechazado: {
    label: 'Rechazado',
    badge: 'bg-pago-rechazado text-pago-rechazado-foreground',
  },
}

export const METODO_PAGO: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  yape_plin: 'Yape / Plin',
}

export const CANAL_PEDIDO: Record<CanalPedido, string> = {
  web: 'Web',
  mostrador: 'Mostrador',
  telefono: 'Teléfono',
}

export const ORIGEN_LABEL: Record<'api_core' | 'worker_cocina', string> = {
  api_core: 'API Core',
  worker_cocina: 'Worker Cocina',
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
