'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  ChefHat,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Globe,
  Clock,
  Wifi,
} from 'lucide-react'
import { PapaYonLogo } from '@/components/brand/logo'

const PORTALS = [
  {
    href: '/staff/cocina',
    icon: ChefHat,
    title: 'Portal Cocina',
    subtitle: 'Kitchen Display System',
    description:
      'Visualiza y avanza pedidos activos en tiempo real. Gestiona el flujo de preparación desde la cocina.',
    accent: 'bg-estado-preparacion text-estado-preparacion-foreground',
    borderHover: 'hover:border-estado-preparacion-foreground/50',
    indicator: 'bg-estado-listo-foreground',
    badge: 'KDS activo',
  },
  {
    href: '/staff/admin',
    icon: LayoutDashboard,
    title: 'Portal Administración',
    subtitle: 'Back Office',
    description:
      'Caja, repartidor y dashboard: gestiona pagos, despachos y métricas del negocio en un solo lugar.',
    accent: 'bg-accent text-accent-foreground',
    borderHover: 'hover:border-accent/60',
    indicator: 'bg-estado-listo-foreground',
    badge: 'Sistema en línea',
  },
]

const SYSTEM_STATS = [
  { icon: Wifi, label: 'Conexión', value: 'En línea' },
  { icon: ShieldCheck, label: 'Acceso', value: 'Seguro' },
  { icon: Globe, label: 'Entorno', value: 'Prototipo' },
]

function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-sm tabular-nums text-sidebar-foreground/70">
      {time || '––:––:––'}
    </span>
  )
}

export default function StaffPage() {
  return (
    <div className="flex min-h-dvh bg-sidebar">
      {/* ── Left panel (decorative / brand) ── hidden on mobile */}
      <aside
        className="hidden lg:flex lg:w-[420px] lg:shrink-0 lg:flex-col lg:justify-between lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:px-10 lg:py-12"
        aria-hidden="true"
      >
        {/* Top: brand + system status */}
        <div>
          <PapaYonLogo variant="light" className="mb-10" />

          <h2 className="font-display text-3xl font-extrabold leading-tight text-sidebar-foreground">
            Panel de
            <br />
            <span className="text-primary">Operaciones</span>
          </h2>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-sidebar-foreground/50">
            Acceso exclusivo para personal autorizado. Selecciona tu área de
            trabajo para comenzar la jornada.
          </p>

          {/* System stats */}
          <div className="mt-10 space-y-3">
            {SYSTEM_STATS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/30 px-4 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent">
                  <Icon className="size-4 text-sidebar-foreground/60" />
                </span>
                <div className="flex flex-1 items-center justify-between">
                  <span className="text-xs font-medium text-sidebar-foreground/50">
                    {label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-estado-listo-foreground" />
                    <span className="text-xs font-semibold text-sidebar-foreground/80">
                      {value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: live clock + version */}
        <div className="space-y-1 border-t border-sidebar-border pt-6">
          <div className="flex items-center gap-2 text-sidebar-foreground/40">
            <Clock className="size-3.5 shrink-0" />
            <LiveClock />
          </div>
          <p className="text-xs text-sidebar-foreground/25">
            Papa Yon · Sistemas Distribuidos · v1.0
          </p>
        </div>
      </aside>

      {/* ── Right panel (portal selector) ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        {/* Mobile brand (only shown below lg) */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <PapaYonLogo variant="light" />
        </div>

        <div className="w-full max-w-md">
          {/* Section heading */}
          <div className="mb-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Área restringida
            </p>
            <h1 className="font-display text-2xl font-extrabold text-sidebar-foreground sm:text-3xl">
              Selecciona tu portal
            </h1>
            <p className="mt-1.5 text-sm text-sidebar-foreground/50">
              Cada portal requiere credenciales específicas para tu rol.
            </p>
          </div>

          {/* Portal cards */}
          <div className="space-y-4" role="list">
            {PORTALS.map(
              ({
                href,
                icon: Icon,
                title,
                subtitle,
                description,
                accent,
                borderHover,
                indicator,
                badge,
              }) => (
                <Link
                  key={href}
                  href={href}
                  role="listitem"
                  className={`group relative flex items-start gap-5 rounded-2xl border border-sidebar-border bg-sidebar-accent/30 p-6 shadow-md transition-all duration-200 hover:bg-sidebar-accent/60 hover:shadow-lg hover:-translate-y-px ${borderHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar`}
                >
                  {/* Icon */}
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accent} shadow-sm`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-extrabold text-sidebar-foreground">
                        {title}
                      </h2>
                      <span className="rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/40">
                        {subtitle}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-sidebar-foreground/55">
                      {description}
                    </p>
                    {/* Status badge */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${indicator}`} />
                      <span className="text-xs font-medium text-sidebar-foreground/45">
                        {badge}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    className="mt-0.5 size-5 shrink-0 text-sidebar-foreground/20 transition-all duration-200 group-hover:translate-x-1 group-hover:text-sidebar-foreground/70"
                    aria-hidden="true"
                  />
                </Link>
              ),
            )}
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sidebar-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-sidebar px-3 text-xs text-sidebar-foreground/30">
                acceso público
              </span>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sidebar-foreground/40 underline-offset-4 transition-colors hover:text-sidebar-foreground/70 hover:underline"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              Volver al sitio público
            </Link>
          </div>

          {/* Mobile footer note */}
          <p className="mt-8 text-center text-xs text-sidebar-foreground/20 lg:hidden">
            Papa Yon · Sistemas Distribuidos · v1.0
          </p>
        </div>
      </main>
    </div>
  )
}
