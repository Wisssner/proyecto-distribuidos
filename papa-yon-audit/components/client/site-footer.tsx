import Link from 'next/link'
import { MapPin, Phone, Send } from 'lucide-react'
import { PapaYonLogo } from '@/components/brand/logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <PapaYonLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Pizzería artesanal con masa fermentada 48 horas. Pedidos trazables
            de principio a fin, horneados al momento para ti.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[Send, Phone, MapPin].map((Icon, i) => (
              <span
                key={i}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-4" />
                <span className="sr-only">Red social</span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold">Navegación</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Menú
              </Link>
            </li>
            <li>
              <Link href="/pedido" className="hover:text-foreground">
                Hacer pedido
              </Link>
            </li>
            <li>
              <Link href="/staff" className="hover:text-foreground">
                Acceso personal
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold">Métodos de pago</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Efectivo</li>
            <li>Tarjeta de crédito / débito</li>
            <li>Yape / Plin</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Papa Yon. Prototipo académico.</p>
          <p>Universidad Nacional Mayor de San Marcos · Grupo 07</p>
        </div>
      </div>
    </footer>
  )
}
