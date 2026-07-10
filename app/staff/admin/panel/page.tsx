'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BadgeDollarSign,
  Bike,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Banknote,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoBadge, PagoBadge } from '@/components/status-badge'
import { PapaYonLogo } from '@/components/brand/logo'
import { useSession } from '@/lib/auth'
import { usePedidos, actualizarEstado, actualizarPago } from '@/lib/store'
import {
  formatDateTime,
  formatMoney,
  METODO_PAGO,
  CANAL_PEDIDO,
  ESTADO_PEDIDO,
} from '@/lib/labels'
import type { EstadoPedido, Pedido } from '@/lib/types'
import { ORDER_FLOW } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = 'caja' | 'repartidor' | 'dashboard'

// ─── Shared order row ───────────────────────────────────────────────────────

function OrderRow({
  pedido,
  actions,
}: {
  pedido: Pedido
  actions?: React.ReactNode
}) {
  const pago = pedido.pagos?.[0]
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[auto_1fr_auto_auto_auto]">
      {/* Number */}
      <span className="font-display text-base font-extrabold text-foreground">
        #{pedido.numero}
      </span>

      {/* Details */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {pedido.detalles.map((d) => `${d.cantidad}× ${d.producto?.nombre}`).join(', ')}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTime(pedido.creadoEn)} · {CANAL_PEDIDO[pedido.canal]}
          {pago && ` · ${METODO_PAGO[pago.metodo]}`}
        </p>
      </div>

      {/* Estado badge (hidden on mobile, visible on sm+) */}
      <EstadoBadge estado={pedido.estado} className="hidden sm:inline-flex" />

      {/* Pago badge */}
      {pago && <PagoBadge estado={pago.estado} className="hidden sm:inline-flex" />}

      {/* Total + actions */}
      <div className="flex flex-col items-end gap-2">
        <span className="font-display text-sm font-extrabold">
          {formatMoney(pedido.total)}
        </span>
        {actions}
      </div>
    </div>
  )
}

// ─── Caja tab ────────────────────────────────────────────────────────────────

function CajaTab() {
  const pedidos = usePedidos()
  const [confirming, setConfirming] = useState<string | null>(null)

  function confirmarPago(id: string) {
    setConfirming(id)
    setTimeout(() => {
      actualizarPago(id, 'pagado')
      setConfirming(null)
    }, 400)
  }

  // Sort: newest first
  const sorted = [...pedidos].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
  )

  const pendientes = sorted.filter((p) => p.pagos?.[0]?.estado === 'pendiente')
  const pagados = sorted.filter((p) => p.pagos?.[0]?.estado === 'pagado')

  return (
    <div className="space-y-8">
      {/* Pending payments */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <span className="size-2 rounded-full bg-pago-pendiente-foreground" />
          Cobros pendientes ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-border py-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-muted-foreground/30" />
          </div>
        ) : (
          <div className="space-y-2">
            {pendientes.map((p) => (
              <OrderRow
                key={p.id}
                pedido={p}
                actions={
                  <Button
                    size="sm"
                    disabled={confirming === p.id}
                    onClick={() => confirmarPago(p.id)}
                    className="gap-1.5 whitespace-nowrap"
                  >
                    <Banknote className="size-3.5" />
                    {confirming === p.id ? 'Confirmando…' : 'Confirmar pago'}
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Paid */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <span className="size-2 rounded-full bg-pago-pagado-foreground" />
          Pagados ({pagados.length})
        </h2>
        <div className="space-y-2">
          {pagados.map((p) => (
            <OrderRow key={p.id} pedido={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Repartidor tab ──────────────────────────────────────────────────────────

function RepartidorTab() {
  const pedidos = usePedidos()
  const [advancing, setAdvancing] = useState<string | null>(null)

  function advance(pedido: Pedido) {
    const next: EstadoPedido = pedido.estado === 'listo' ? 'en_camino' : 'entregado'
    setAdvancing(pedido.id)
    setTimeout(() => {
      actualizarEstado(pedido.id, next, 'api_core')
      setAdvancing(null)
    }, 400)
  }

  const activos = pedidos.filter(
    (p) => p.estado === 'listo' || p.estado === 'en_camino',
  )
  const entregados = pedidos.filter((p) => p.estado === 'entregado')

  return (
    <div className="space-y-8">
      {/* Active deliveries */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <span className="size-2 rounded-full bg-estado-camino-foreground" />
          Activos ({activos.length})
        </h2>
        {activos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border py-10 text-center">
            <Bike className="size-8 text-muted-foreground/30" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Sin pedidos listos para despacho</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activos.map((p) => (
              <OrderRow
                key={p.id}
                pedido={p}
                actions={
                  <Button
                    size="sm"
                    disabled={advancing === p.id}
                    onClick={() => advance(p)}
                    className="gap-1.5 whitespace-nowrap"
                    variant={p.estado === 'listo' ? 'default' : 'secondary'}
                  >
                    <Bike className="size-3.5" />
                    {advancing === p.id
                      ? 'Actualizando…'
                      : p.estado === 'listo'
                        ? 'Marcar en camino'
                        : 'Marcar entregado'}
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Delivered */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <span className="size-2 rounded-full bg-estado-entregado-foreground" />
          Entregados hoy ({entregados.length})
        </h2>
        <div className="space-y-2">
          {entregados.map((p) => (
            <OrderRow key={p.id} pedido={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Dashboard tab ───────────────────────────────────────────────────────────

function DashboardTab() {
  const pedidos = usePedidos()

  const totalPedidos = pedidos.length
  const ventasAcumuladas = pedidos
    .filter((p) => p.pagos?.[0]?.estado === 'pagado')
    .reduce((sum, p) => sum + p.total, 0)
  const ventasBruto = pedidos.reduce((sum, p) => sum + p.total, 0)

  const byEstado = ORDER_FLOW.map((estado) => ({
    estado,
    label: ESTADO_PEDIDO[estado].label,
    badge: ESTADO_PEDIDO[estado].badge,
    count: pedidos.filter((p) => p.estado === estado).length,
  }))

  const byMetodo = (['efectivo', 'tarjeta', 'yape_plin'] as const).map((m) => ({
    metodo: m,
    label: METODO_PAGO[m],
    count: pedidos.filter((p) => p.pagos?.[0]?.metodo === m).length,
  }))

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total pedidos</p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold">{totalPedidos}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Ventas cobradas</p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-estado-listo/80 text-estado-listo-foreground">
              <TrendingUp className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold">
            {formatMoney(ventasAcumuladas)}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Ventas totales (bruto)</p>
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent/60 text-accent-foreground">
              <BadgeDollarSign className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-extrabold">
            {formatMoney(ventasBruto)}
          </p>
        </div>
      </section>

      {/* By estado */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-base font-bold">Pedidos por estado</h3>
          <ul className="space-y-3">
            {byEstado.map(({ estado, label, badge, count }) => (
              <li key={estado} className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                    badge,
                  )}
                >
                  {label}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'h-2 rounded-full bg-border transition-all',
                    )}
                    style={{
                      width: totalPedidos > 0 ? `${(count / totalPedidos) * 100}%` : '0%',
                      backgroundColor: 'currentColor',
                      maxWidth: '100%',
                    }}
                    aria-hidden="true"
                  />
                </div>
                <span className="w-6 text-right font-display text-sm font-extrabold tabular-nums">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-display text-base font-bold">Por método de pago</h3>
          <ul className="space-y-3">
            {byMetodo.map(({ metodo, label, count }) => (
              <li key={metodo} className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: totalPedidos > 0 ? `${(count / totalPedidos) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
                <span className="w-6 text-right font-display text-sm font-extrabold tabular-nums">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent orders */}
      <section>
        <h3 className="mb-3 font-display text-base font-bold">Últimos 5 pedidos</h3>
        <div className="space-y-2">
          {[...pedidos]
            .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
            .slice(0, 5)
            .map((p) => (
              <OrderRow key={p.id} pedido={p} />
            ))}
        </div>
      </section>
    </div>
  )
}

// ─── Main panel ──────────────────────────────────────────────────────────────

const TABS: Array<{ value: Tab; label: string; Icon: typeof LayoutDashboard }> = [
  { value: 'caja', label: 'Caja', Icon: Banknote },
  { value: 'repartidor', label: 'Repartidor', Icon: Bike },
  { value: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
]

export default function AdminPanelPage() {
  const router = useRouter()
  const { usuario, loading, logout } = useSession('admin')
  const [tab, setTab] = useState<Tab>('caja')

  useEffect(() => {
    if (!loading && usuario === null) {
      router.replace('/staff/admin')
    }
  }, [loading, usuario, router])

  if (loading || !usuario) return null

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <PapaYonLogo />
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline">
              Administración
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {usuario.nombre}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="sr-only sm:not-sr-only">Salir</span>
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-4 pb-0 sm:px-6">
          {TABS.map(({ value, label, Icon }) => {
            const active = tab === value
            return (
              <button
                key={value}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(value)}
                className={cn(
                  'flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">
            {TABS.find((t) => t.value === tab)?.label}
          </h1>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
            En vivo
          </span>
        </div>

        {tab === 'caja' && <CajaTab />}
        {tab === 'repartidor' && <RepartidorTab />}
        {tab === 'dashboard' && <DashboardTab />}
      </main>
    </div>
  )
}
