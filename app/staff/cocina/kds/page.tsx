'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChefHat, LogOut, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoBadge } from '@/components/status-badge'
import { PapaYonLogo } from '@/components/brand/logo'
import { useSession } from '@/lib/auth'
import { usePedidos, actualizarEstado } from '@/lib/store'
import { formatDateTime } from '@/lib/labels'
import type { Pedido } from '@/lib/types'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function elapsed(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function isUrgent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 15 * 60_000
}

// ─── KDS Card ────────────────────────────────────────────────────────────────

function KDSCard({ pedido }: { pedido: Pedido }) {
  const urgent = isUrgent(pedido.creadoEn)
  const isNew = pedido.estado === 'creado'
  const isPrep = pedido.estado === 'en_preparacion'
  const isReady = pedido.estado === 'listo'
  const canAdvance = isNew || isPrep

  function advance() {
    const next = isNew ? 'en_preparacion' : 'listo'
    actualizarEstado(pedido.id, next, 'worker_cocina')
  }

  // Header accent colours per state
  const headerCn = cn(
    'flex items-center justify-between rounded-t-xl px-4 py-3 border-b',
    isNew && 'bg-estado-creado border-estado-creado-foreground/20',
    isPrep && 'bg-estado-preparacion border-estado-preparacion-foreground/20',
    isReady && 'bg-estado-listo border-estado-listo-foreground/20',
  )

  return (
    <article
      className={cn(
        'flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md',
        urgent ? 'border-destructive/50 ring-1 ring-destructive/20' : 'border-border',
      )}
    >
      {/* Header */}
      <div className={headerCn}>
        <div className="flex items-center gap-2.5">
          <span className="font-display text-base font-extrabold text-foreground">
            #{pedido.numero}
          </span>
          <EstadoBadge estado={pedido.estado} />
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            urgent
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Clock className="size-3.5" aria-hidden="true" />
          {elapsed(pedido.creadoEn)}
        </div>
      </div>

      {/* Items */}
      <ul className="divide-y divide-border px-4 py-1">
        {pedido.detalles.map((d) => (
          <li key={d.id} className="flex items-center gap-3 py-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-extrabold text-primary">
              {d.cantidad}
            </span>
            <span className="text-sm font-medium leading-tight text-foreground">
              {d.producto?.nombre ?? 'Producto'}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between rounded-b-xl border-t border-border bg-muted/30 px-4 py-3">
        <span className="text-xs text-muted-foreground">{formatDateTime(pedido.creadoEn)}</span>
        {canAdvance && (
          <Button size="sm" onClick={advance} className="gap-1.5">
            <ChefHat className="size-3.5" aria-hidden="true" />
            {isNew ? 'Iniciar preparación' : 'Marcar listo'}
          </Button>
        )}
        {isReady && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-estado-listo px-3 py-1 text-xs font-semibold text-estado-listo-foreground">
            <span className="size-1.5 rounded-full bg-estado-listo-foreground" aria-hidden="true" />
            Listo para entrega
          </span>
        )}
      </div>
    </article>
  )
}

// ─── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  title: string
  dotClass: string
  count: number
  items: Pedido[]
  emptyLabel: string
}

function KDSColumn({ title, dotClass, count, items, emptyLabel }: ColumnProps) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-sidebar-foreground/50">
        <span className={cn('size-2 rounded-full', dotClass)} aria-hidden="true" />
        {title}
        <span className="ml-auto rounded-full bg-sidebar-accent px-2 py-0.5 font-mono text-xs text-sidebar-foreground/60">
          {count}
        </span>
      </h2>
      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-sidebar-border/30 py-12 text-sm text-sidebar-foreground/30">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((p) => (
            <KDSCard key={p.id} pedido={p} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KDSPage() {
  const router = useRouter()
  const { usuario, loading, logout } = useSession('cocina')
  const pedidos = usePedidos()

  useEffect(() => {
    if (!loading && usuario === null) {
      router.replace('/staff/cocina')
    }
  }, [loading, usuario, router])

  if (loading || !usuario) return null

  const creados = pedidos.filter((p) => p.estado === 'creado')
  const enPrep = pedidos.filter((p) => p.estado === 'en_preparacion')
  const listos = pedidos.filter((p) => p.estado === 'listo')
  const activos = creados.length + enPrep.length + listos.length

  return (
    <div className="flex min-h-dvh flex-col bg-sidebar">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/staff"
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Volver a selección de portal"
          >
            <ChefHat className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Portales</span>
          </Link>
          <div className="h-5 w-px bg-sidebar-border" aria-hidden="true" />
          <PapaYonLogo variant="light" />
          <span className="hidden rounded-full bg-sidebar-accent px-2.5 py-1 text-xs font-semibold text-sidebar-foreground/60 sm:inline">
            Cocina · KDS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-sidebar-foreground/50 sm:inline">
            {usuario.nombre}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Salir</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        {/* ── Stats strip ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-5">
            {[
              { label: 'Nuevos', value: creados.length, dot: 'bg-estado-creado-foreground' },
              { label: 'Preparando', value: enPrep.length, dot: 'bg-estado-preparacion-foreground' },
              { label: 'Listos', value: listos.length, dot: 'bg-estado-listo-foreground' },
            ].map(({ label, value, dot }, i, arr) => (
              <div key={label} className="flex items-center gap-3">
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold leading-none text-sidebar-foreground">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-sidebar-foreground/40">{label}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-8 w-px bg-sidebar-border" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/40">
            <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
            En vivo
          </div>
        </div>

        {/* ── Empty state ── */}
        {activos === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sidebar-border/40 bg-sidebar-accent/20 py-24 text-center">
            <ChefHat className="size-14 text-sidebar-foreground/15" aria-hidden="true" />
            <h2 className="mt-4 font-display text-lg font-bold text-sidebar-foreground/50">
              Sin pedidos activos
            </h2>
            <p className="mt-2 max-w-xs text-sm text-sidebar-foreground/30">
              Los nuevos pedidos aparecerán aquí al instante.
            </p>
          </div>
        )}

        {/* ── Three-column KDS ── */}
        {activos > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <KDSColumn
              title="Nuevos"
              dotClass="bg-estado-creado-foreground"
              count={creados.length}
              items={creados}
              emptyLabel="Sin pedidos nuevos"
            />
            <KDSColumn
              title="En preparación"
              dotClass="bg-estado-preparacion-foreground"
              count={enPrep.length}
              items={enPrep}
              emptyLabel="Sin pedidos en preparación"
            />
            <KDSColumn
              title="Listos para entrega"
              dotClass="bg-estado-listo-foreground"
              count={listos.length}
              items={listos}
              emptyLabel="Sin pedidos listos"
            />
          </div>
        )}
      </main>
    </div>
  )
}
