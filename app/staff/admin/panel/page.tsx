'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BadgeDollarSign,
  Banknote,
  Bike,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  ArrowLeft,
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

// ─── Order row ────────────────────────────────────────────────────────────────

function OrderRow({
  pedido,
  actions,
}: {
  pedido: Pedido
  actions?: React.ReactNode
}) {
  const pago = pedido.pagos?.[0]
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4">
      {/* Number */}
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-sm font-extrabold text-foreground">
        #{pedido.numero}
      </span>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {pedido.detalles.map((d) => `${d.cantidad}× ${d.producto?.nombre}`).join(', ')}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs text-muted-foreground">
            {formatDateTime(pedido.creadoEn)}
          </span>
          <span className="text-xs text-muted-foreground/40">·</span>
          <span className="text-xs text-muted-foreground">{CANAL_PEDIDO[pedido.canal]}</span>
          {pago && (
            <>
              <span className="text-xs text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">{METODO_PAGO[pago.metodo]}</span>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <EstadoBadge estado={pedido.estado} />
        {pago && <PagoBadge estado={pago.estado} />}
      </div>

      {/* Total + actions */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-display text-base font-extrabold tabular-nums">
          {formatMoney(pedido.total)}
        </span>
        {actions}
      </div>
    </div>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  dotClass,
  title,
  count,
}: {
  dotClass: string
  title: string
  count: number
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className={cn('size-2 rounded-full', dotClass)} aria-hidden="true" />
      <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
        {count}
      </span>
    </div>
  )
}

// ─── Caja tab ─────────────────────────────────────────────────────────────────

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

  const sorted = [...pedidos].sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
  )
  const pendientes = sorted.filter((p) => p.pagos?.[0]?.estado === 'pendiente')
  const pagados = sorted.filter((p) => p.pagos?.[0]?.estado === 'pagado')

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          dotClass="bg-pago-pendiente-foreground"
          title="Cobros pendientes"
          count={pendientes.length}
        />
        {pendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border py-12 text-center">
            <CheckCircle2 className="size-9 text-muted-foreground/25" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Todo al día</p>
          </div>
        ) : (
          <div className="space-y-2.5">
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
                    <Banknote className="size-3.5" aria-hidden="true" />
                    {confirming === p.id ? 'Confirmando…' : 'Confirmar pago'}
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader
          dotClass="bg-pago-pagado-foreground"
          title="Pagados"
          count={pagados.length}
        />
        <div className="space-y-2.5">
          {pagados.map((p) => (
            <OrderRow key={p.id} pedido={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Repartidor tab ───────────────────────────────────────────────────────────

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

  const activos = pedidos.filter((p) => p.estado === 'listo' || p.estado === 'en_camino')
  const entregados = pedidos.filter((p) => p.estado === 'entregado')

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          dotClass="bg-estado-camino-foreground"
          title="Activos"
          count={activos.length}
        />
        {activos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border py-12 text-center">
            <Bike className="size-9 text-muted-foreground/25" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted-foreground">Sin pedidos listos para despacho</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activos.map((p) => (
              <OrderRow
                key={p.id}
                pedido={p}
                actions={
                  <Button
                    size="sm"
                    disabled={advancing === p.id}
                    onClick={() => advance(p)}
                    variant={p.estado === 'listo' ? 'default' : 'secondary'}
                    className="gap-1.5 whitespace-nowrap"
                  >
                    <Bike className="size-3.5" aria-hidden="true" />
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

      <section>
        <SectionHeader
          dotClass="bg-estado-entregado-foreground"
          title="Entregados hoy"
          count={entregados.length}
        />
        <div className="space-y-2.5">
          {entregados.map((p) => (
            <OrderRow key={p.id} pedido={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string | number
  icon: typeof ShoppingBag
  iconClass: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn('flex size-9 items-center justify-center rounded-lg', iconClass)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold tabular-nums">{value}</p>
    </div>
  )
}

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

  const recent = [...pedidos]
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total pedidos"
          value={totalPedidos}
          icon={ShoppingBag}
          iconClass="bg-primary/10 text-primary"
        />
        <KpiCard
          label="Ventas cobradas"
          value={formatMoney(ventasAcumuladas)}
          icon={TrendingUp}
          iconClass="bg-estado-listo/80 text-estado-listo-foreground"
        />
        <KpiCard
          label="Ventas brutas"
          value={formatMoney(ventasBruto)}
          icon={BadgeDollarSign}
          iconClass="bg-accent/60 text-accent-foreground"
        />
      </section>

      {/* Charts row */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* By estado */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-5 font-display text-base font-bold">Pedidos por estado</h3>
          <ul className="space-y-3.5">
            {byEstado.map(({ estado, label, badge, count }) => (
              <li key={estado} className="flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex min-w-[110px] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                    badge,
                  )}
                >
                  {label}
                </span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/20 transition-all"
                      style={{
                        width: totalPedidos > 0 ? `${(count / totalPedidos) * 100}%` : '0%',
                      }}
                      aria-hidden="true"
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

        {/* By método */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-5 font-display text-base font-bold">Por método de pago</h3>
          <ul className="space-y-3.5">
            {byMetodo.map(({ metodo, label, count }) => (
              <li key={metodo} className="flex items-center gap-3">
                <span className="min-w-[110px] text-sm font-medium">{label}</span>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: totalPedidos > 0 ? `${(count / totalPedidos) * 100}%` : '0%',
                      }}
                      aria-hidden="true"
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Últimos 5 pedidos</h3>
          <Clock className="size-4 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div className="space-y-2.5">
          {recent.map((p) => (
            <OrderRow key={p.id} pedido={p} />
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

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
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/staff"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Volver a selección de portal"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Portales</span>
            </Link>
            <div className="h-5 w-px bg-border" aria-hidden="true" />
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
              <LogOut className="size-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Salir</span>
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mx-auto flex w-full max-w-7xl gap-0.5 overflow-x-auto px-4 sm:px-6">
          {TABS.map(({ value, label, Icon }) => {
            const active = tab === value
            return (
              <button
                key={value}
                type="button"
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

      {/* ── Content ── */}
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
