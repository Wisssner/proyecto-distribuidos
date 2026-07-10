'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { PapaYonLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Menú' },
  { href: '/pedido', label: 'Hacer pedido' },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Papa Yon, inicio">
          <PapaYonLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/staff" />}
            variant="ghost"
            size="sm"
            className="hidden text-muted-foreground sm:inline-flex"
          >
            Acceso personal
          </Button>
          <Button render={<Link href="/pedido" />} size="lg" className="gap-2">
            <ShoppingBag className="size-4" />
            Ordenar
          </Button>
        </div>
      </div>
    </header>
  )
}
