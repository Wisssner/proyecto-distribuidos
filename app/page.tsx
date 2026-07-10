import Image from 'next/image'
import Link from 'next/link'
import { Clock, Flame, ShieldCheck } from 'lucide-react'
import { SiteHeader } from '@/components/client/site-header'
import { SiteFooter } from '@/components/client/site-footer'
import { MenuCatalog } from '@/components/client/menu-catalog'
import { Button } from '@/components/ui/button'

const HIGHLIGHTS = [
  {
    icon: Flame,
    title: 'Horneada al momento',
    desc: 'Masa fermentada 48h y horno de piedra en cada pedido.',
  },
  {
    icon: Clock,
    title: 'Trazabilidad real',
    desc: 'Sigue tu orden en vivo: registrado, en preparación, en camino.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin pedidos perdidos',
    desc: 'Arquitectura resiliente: tu orden nunca se pierde en cola.',
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border bg-sidebar">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-accent">
                Pizzería artesanal · Delivery y recojo
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-balance text-sidebar-foreground sm:text-5xl md:text-6xl">
                Pizza recién horneada,{' '}
                <span className="text-primary">seguida al instante.</span>
              </h1>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-sidebar-foreground/70">
                Arma tu pedido en segundos y observa cómo pasa por cocina hasta
                tu puerta. Ingredientes frescos, sabor de siempre.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button render={<Link href="/#menu" />} size="lg" className="h-11 px-6 text-base">
                  Ver el menú
                </Button>
                <Button
                  render={<Link href="/pedido" />}
                  size="lg"
                  variant="outline"
                  className="h-11 border-sidebar-border bg-transparent px-6 text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  Mi pedido
                </Button>
              </div>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-sidebar-border shadow-xl">
              <Image
                src="/images/hero-pizza.png"
                alt="Rebanada de pizza de pepperoni caliente con queso derretido"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <h.icon className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-sm font-bold">{h.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16">
          <div className="mb-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Nuestro menú
            </span>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-balance">
              Elige tus favoritos
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Precios en soles (PEN). Todas nuestras pizzas son familiares y
              alcanzan para compartir.
            </p>
          </div>
          <MenuCatalog />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
