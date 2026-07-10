import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteHeader } from '@/components/client/site-header'
import { SiteFooter } from '@/components/client/site-footer'
import { CartCheckout } from '@/components/client/cart-checkout'

export default function PedidoPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Link
            href="/#menu"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Seguir comprando
          </Link>
          <span className="block text-sm font-semibold uppercase tracking-wide text-primary">
            Tu carrito
          </span>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-balance">
            Revisa y confirma tu pedido
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ajusta cantidades, elige cómo pagar y confirma. Podrás seguir el
            estado en tiempo real.
          </p>
        </div>
        <CartCheckout />
      </main>
      <SiteFooter />
    </div>
  )
}
