'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { PapaYonLogo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Menú' },
  { href: '/pedido', label: 'Mi pedido' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const cart = useCart()
  const cartCount = cart.reduce((sum, i) => sum + i.cantidad, 0)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Papa Yon, inicio">
          <PapaYonLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
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

          {/* Cart button with live badge */}
          <Link
            href="/pedido"
            aria-label={`Ver carrito${cartCount > 0 ? ` · ${cartCount} ítems` : ''}`}
            className={cn(
              'relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Mi pedido</span>
            {cartCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-foreground">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
