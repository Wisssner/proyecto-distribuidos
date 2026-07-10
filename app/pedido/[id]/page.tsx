import { SiteHeader } from '@/components/client/site-header'
import { SiteFooter } from '@/components/client/site-footer'
import { OrderTracking } from '@/components/client/order-tracking'

export default async function SeguimientoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <OrderTracking id={id} />
      </main>
      <SiteFooter />
    </div>
  )
}
