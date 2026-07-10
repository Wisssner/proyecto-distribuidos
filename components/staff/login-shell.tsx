'use client'

import { useState, type ReactNode } from 'react'
import { Eye, EyeOff, AlertCircle, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PapaYonLogo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'

export interface LoginShellProps {
  /** Icon shown in the brand mark circle above the logo */
  icon: LucideIcon
  /** Role title, e.g. "Cocina" */
  role: string
  /** Subtitle shown below the heading */
  subtitle: string
  /** Text on the submit button */
  submitLabel: string
  /** Demo credential hint */
  demoCorreo: string
  demoContrasena: string
  /** Called on valid submit. Return an error string on failure, undefined on success. */
  onSubmit: (correo: string, contrasena: string) => Promise<string | undefined> | string | undefined
}

export function StaffLoginShell({
  icon: Icon,
  role,
  subtitle,
  submitLabel,
  demoCorreo,
  demoContrasena,
  onSubmit,
}: LoginShellProps) {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await onSubmit(correo, contrasena)
    if (err) {
      setError(err)
      setLoading(false)
    }
    // On success the parent navigates away — loading stays true intentionally
  }

  const fieldId = role.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-sidebar px-4 py-10">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Icon className="size-7 text-primary-foreground" aria-hidden="true" />
        </span>
        <PapaYonLogo variant="light" />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-8 shadow-xl">
        <div className="mb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Acceso personal
          </p>
          <h1 className="font-display text-xl font-extrabold text-sidebar-foreground">
            {role}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-sidebar-foreground/60">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Correo */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`correo-${fieldId}`}
              className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70"
            >
              Correo electrónico
            </Label>
            <Input
              id={`correo-${fieldId}`}
              type="email"
              autoComplete="username"
              placeholder={demoCorreo}
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

          {/* Contraseña */}
          <div className="space-y-1.5">
            <Label
              htmlFor={`contrasena-${fieldId}`}
              className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70"
            >
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id={`contrasena-${fieldId}`}
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
                {showPass ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
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
            {loading ? 'Verificando…' : submitLabel}
          </Button>
        </form>

        {/* Demo hint */}
        <div className="mt-5 rounded-xl border border-sidebar-border/50 bg-sidebar/60 p-3 text-xs text-sidebar-foreground/50">
          <p className="font-semibold text-sidebar-foreground/70">Credenciales de demo</p>
          <p className="mt-0.5 font-mono">{demoCorreo}</p>
          <p className="font-mono">{demoContrasena}</p>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/staff"
        className="mt-6 text-sm text-sidebar-foreground/30 underline-offset-4 hover:text-sidebar-foreground/60 hover:underline"
      >
        Volver a la selección de portal
      </Link>

      <p className="mt-3 text-xs text-sidebar-foreground/20">
        Prototipo académico · Papa Yon · Sistemas Distribuidos
      </p>
    </div>
  )
}
