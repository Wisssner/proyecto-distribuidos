'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, LogOut, RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoBadge } from '@/components/status-badge'
import { PapaYonLogo } from '@/components/brand/logo'
import { useSession } from '@/lib/auth'
import { usePedidos, actualizarEstado } from '@/lib/store'
import { formatDateTime, formatMoney } from '@/lib/labels'
import type { Pedido } from '@/lib/types'
import { cn } from '@/lib/utils'

function elapsed(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function isUrgent(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 15 * 60_000
}

function KDSCard({ pedido }: { pedido: Pedido }) {
  const urgent = isUrgent(pedido.creadoEn)
  const canAdvance = pedido.estado === 'creado' || pedido.estado === 'en_preparacion'
  const nextLabel = pedido.estado === 'creado' ? 'Iniciar preparación' : 'Marcar listo'

  function advance() {
    const next = pedido.estado === 'creado' ? 'en_preparacion' : 'listo'
    actualizarEstado(pedido.id, next, 'worker_cocina')
  }

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border bg-card shadow-sm transition-all',
        urgent ? 'border-destructive/40 ring-1 ring-destructive/20' : 'border-border',
      )}
    >
      {/* Card header */}
      <div
        className={cn(
          'flex items-center justify-between rounded-t-2xl px-4 py-3',
          urgent ? 'bg-destructive/8' : 'bg-muted/40',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-extrabold text-foreground">
            #{pedido.numero}
          </span>
          <EstadoBadge estado={pedido.estado} />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-semibold',
            urgent ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          <Clock className="size-3.5" aria-hidden="true" />
          {elapsed(pedido.creadoEn)}
        </div>
      </div>

      {/* Items */}
      <ul className="divide-y divide-border px-4 py-2">
        {pedido.detalles.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-3 py-2.5 text-sm"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-display text-sm font-extrabold text-primary">
              {d.cantidad}
            </span>
            <span className="font-medium leading-tight">
              {d.producto?.nombre ?? 'Producto'}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between rounded-b-2xl border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {formatDateTime(pedido.creadoEn)}
        </span>
        {canAdvance && (
          <Button size="sm" onClick={advance} className="gap-1.5">
            <ChefHat className="size-3.5" />
            {nextLabel}
          </Button>
        )}
        {!canAdvance && (
          <span className="rounded-full bg-estado-listo px-2.5 py-0.5 text-xs font-semibold text-estado-listo-foreground">
            Listo para entrega
          </span>
        )}
      </div>
    </article>
  )
}

export default function KDSPage() {
  const router = useRouter()
  const { usuario, loading, logout } = useSession('cocina')
  const pedidos = usePedidos()

  // Guard: once session is loaded, redirect if no user
  useEffect(() => {
    if (!loading && usuario === null) {
      router.replace('/staff/cocina')
    }
  }, [loading, usuario, router])

  // Show nothing while loading session or when unauthenticated
  if (loading || !usuario) return null

  const activos = pedidos.filter(
    (p) => p.estado === 'creado' || p.estado === 'en_preparacion',
  )

  const creados = activos.filter((p) => p.estado === 'creado')
  const enPrep = activos.filter((p) => p.estado === 'en_preparacion')

  return (
    <div className="flex min-h-dvh flex-col bg-sidebar">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <PapaYonLogo variant="light" />
          <span className="hidden rounded-full bg-sidebar-accent px-2.5 py-1 text-xs font-semibold text-sidebar-foreground/70 sm:inline">
            Cocina · KDS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-sidebar-foreground/60 sm:inline">
            {usuario.nombre}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            <span className="sr-only sm:not-sr-only">Salir</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        {/* Stats bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-sidebar-foreground">
                {creados.length}
              </p>
              <p className="text-xs text-sidebar-foreground/50">Nuevos</p>
            </div>
            <div className="h-8 w-px bg-sidebar-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-sidebar-foreground">
                {enPrep.length}
              </p>
              <p className="text-xs text-sidebar-foreground/50">En preparación</p>
            </div>
            <div className="h-8 w-px bg-sidebar-border" />
            <div className="text-center">
              <p className="font-display text-2xl font-extrabold text-sidebar-foreground">
                {activos.length}
              </p>
              <p className="text-xs text-sidebar-foreground/50">Total activos</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/40">
            <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
            En vivo
          </div>
        </div>

        {/* Empty state */}
        {activos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sidebar-border/50 bg-sidebar-accent/20 py-20 text-center">
            <ChefHat className="size-12 text-sidebar-foreground/20" aria-hidden="true" />
            <h2 className="mt-4 font-display text-lg font-bold text-sidebar-foreground/60">
              Sin pedidos activos
            </h2>
            <p className="mt-2 max-w-xs text-sm text-sidebar-foreground/40">
              No hay pedidos en preparación en este momento. Los nuevos pedidos
              aparecerán aquí al instante.
            </p>
          </div>
        )}

        {/* Two-column KDS layout */}
        {activos.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Nuevos */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-sidebar-foreground/50">
                <span className="size-2 rounded-full bg-estado-creado-foreground" />
                Nuevos ({creados.length})
              </h2>
              {creados.length === 0 ? (
                <p className="rounded-xl border border-sidebar-border/30 py-8 text-center text-sm text-sidebar-foreground/30">
                  Sin pedidos nuevos
                </p>
              ) : (
                <div className="grid gap-4">
                  {creados.map((p) => (
                    <KDSCard key={p.id} pedido={p} />
                  ))}
                </div>
              )}
            </section>

            {/* En preparación */}
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-sidebar-foreground/50">
                <span className="size-2 rounded-full bg-estado-preparacion-foreground" />
                En preparación ({enPrep.length})
              </h2>
              {enPrep.length === 0 ? (
                <p className="rounded-xl border border-sidebar-border/30 py-8 text-center text-sm text-sidebar-foreground/30">
                  Sin pedidos en preparación
                </p>
              ) : (
                <div className="grid gap-4">
                  {enPrep.map((p) => (
                    <KDSCard key={p.id} pedido={p} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
