import Link from 'next/link'
import { ChefHat, LayoutDashboard, ArrowRight } from 'lucide-react'
import { PapaYonLogo } from '@/components/brand/logo'

const PORTALS = [
  {
    href: '/staff/cocina',
    icon: ChefHat,
    title: 'Portal Cocina',
    description:
      'Kitchen Display System: visualiza y avanza pedidos activos en tiempo real.',
    accent: 'bg-estado-preparacion text-estado-preparacion-foreground',
    ring: 'hover:border-estado-preparacion-foreground/40',
  },
  {
    href: '/staff/admin',
    icon: LayoutDashboard,
    title: 'Portal Administración',
    description:
      'Caja, Repartidor y Dashboard: gestiona pagos, despachos y métricas del negocio.',
    accent: 'bg-accent text-accent-foreground',
    ring: 'hover:border-accent/60',
  },
]

export default function StaffPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-sidebar px-4">
      {/* Brand */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <PapaYonLogo variant="light" />
        <p className="text-sm text-sidebar-foreground/50">Selecciona tu portal de acceso</p>
      </div>

      {/* Portal cards */}
      <div className="grid w-full max-w-lg gap-4">
        {PORTALS.map(({ href, icon: Icon, title, description, accent, ring }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-5 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6 shadow-lg transition-all hover:bg-sidebar-accent/60 hover:shadow-xl ${ring} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${accent} shadow-md`}
            >
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-base font-extrabold text-sidebar-foreground">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-snug text-sidebar-foreground/55">
                {description}
              </p>
            </div>
            <ArrowRight
              className="size-5 shrink-0 text-sidebar-foreground/25 transition-transform group-hover:translate-x-1 group-hover:text-sidebar-foreground/60"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="mt-8 text-sm text-sidebar-foreground/30 underline-offset-4 hover:text-sidebar-foreground/60 hover:underline"
      >
        Volver al sitio público
      </Link>
    </div>
  )
}
