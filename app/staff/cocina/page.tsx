'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Flame, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PapaYonLogo } from '@/components/brand/logo'
import { DEMO_CREDENTIALS, login } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function LoginCocinaPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = login('cocina', correo, contrasena)
    if (result.ok) {
      router.push('/staff/cocina/kds')
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-sidebar px-4">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Flame className="size-7 text-primary-foreground" aria-hidden="true" />
        </span>
        <PapaYonLogo variant="light" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-6">
          <h1 className="font-display text-xl font-extrabold text-sidebar-foreground">
            Acceso Cocina
          </h1>
          <p className="mt-1 text-sm text-sidebar-foreground/60">
            Sistema de visualización de pedidos (KDS).
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="correo"
              className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70"
            >
              Correo electrónico
            </Label>
            <Input
              id="correo"
              type="email"
              autoComplete="username"
              placeholder={DEMO_CREDENTIALS.cocina.correo}
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              aria-invalid={!!error}
              className={cn(
                'border-sidebar-border bg-sidebar text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:ring-primary',
                error && 'border-destructive',
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="contrasena"
              className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70"
            >
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="contrasena"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                aria-invalid={!!error}
                className={cn(
                  'border-sidebar-border bg-sidebar pr-10 text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus-visible:ring-primary',
                  error && 'border-destructive',
                )}
              />
              <button
                type="button"
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground/80"
              >
                {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full text-base"
          >
            {loading ? 'Verificando…' : 'Ingresar a Cocina'}
          </Button>
        </form>

        {/* Demo hint */}
        <div className="mt-5 rounded-lg border border-sidebar-border/50 bg-sidebar/50 p-3 text-xs text-sidebar-foreground/50">
          <p className="font-semibold text-sidebar-foreground/70">Credenciales de demo</p>
          <p className="mt-0.5">{DEMO_CREDENTIALS.cocina.correo}</p>
          <p>{DEMO_CREDENTIALS.cocina.contrasena}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-sidebar-foreground/30">
        Prototipo académico · Papa Yon · Sistemas Distribuidos
      </p>
    </div>
  )
}
