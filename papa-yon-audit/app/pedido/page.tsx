import { Suspense } from 'react'
import { SiteHeader } from '@/components/client/site-header'
import { SiteFooter } from '@/components/client/site-footer'
import { OrderBuilder } from '@/components/client/order-builder'

export default function PedidoPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            Nuevo pedido
          </span>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-balance">
            Arma tu pedido
          </h1>
          <p className="mt-1 text-muted-foreground">
            Elige tus productos, ajusta cantidades y confirma. Podrás seguir su
            estado en tiempo real.
          </p>
        </div>
        <Suspense fallback={<div className="h-64" />}>
          <OrderBuilder />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
