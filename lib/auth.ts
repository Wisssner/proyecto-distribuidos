'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Usuario } from '@/lib/types'

type Portal = 'cocina' | 'admin'

interface Credential {
  correo: string
  contrasena: string
  usuario: Usuario
}

export const DEMO_CREDENTIALS: Record<Portal, { correo: string; contrasena: string }> = {
  cocina: { correo: 'cocina@papayon.pe', contrasena: 'cocina123' },
  admin: { correo: 'admin@papayon.pe', contrasena: 'admin123' },
}

const CREDENTIALS: Record<Portal, Credential> = {
  cocina: {
    ...DEMO_CREDENTIALS.cocina,
    usuario: {
      id: 'usr_cocina',
      nombre: 'Equipo de Cocina',
      correo: DEMO_CREDENTIALS.cocina.correo,
      rol: 'cocina',
    },
  },
  admin: {
    ...DEMO_CREDENTIALS.admin,
    usuario: {
      id: 'usr_admin',
      nombre: 'Ana Supervisora',
      correo: DEMO_CREDENTIALS.admin.correo,
      rol: 'admin',
    },
  },
}

const SESSION_KEY = (portal: Portal) => `papayon.session.${portal}`

function readFromStorage(portal: Portal): Usuario | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY(portal))
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

function writeToStorage(portal: Portal, usuario: Usuario): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SESSION_KEY(portal), JSON.stringify(usuario))
}

function removeFromStorage(portal: Portal): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_KEY(portal))
}

export function login(
  portal: Portal,
  correo: string,
  contrasena: string,
): { ok: true; usuario: Usuario } | { ok: false; error: string } {
  const cred = CREDENTIALS[portal]
  if (
    correo.trim().toLowerCase() === cred.correo &&
    contrasena === cred.contrasena
  ) {
    writeToStorage(portal, cred.usuario)
    return { ok: true, usuario: cred.usuario }
  }
  return { ok: false, error: 'Correo o contraseña incorrectos.' }
}

/**
 * Hook that reads session from sessionStorage on mount, and keeps it in
 * local React state. This avoids all useSyncExternalStore cross-module
 * singleton issues — each page instance reads its own storage on mount.
 */
export function useSession(portal: Portal) {
  // null  = not yet loaded (loading)
  // false = loaded, no session
  // Usuario = loaded, has session
  const [usuario, setUsuario] = useState<Usuario | null | false>(null)

  useEffect(() => {
    const stored = readFromStorage(portal)
    setUsuario(stored ?? false)
  }, [portal])

  const logout = useCallback(() => {
    removeFromStorage(portal)
    setUsuario(false)
  }, [portal])

  // Expose null during loading, null when no session (false collapses to null)
  return {
    usuario: usuario === false ? null : usuario,
    loading: usuario === null,
    logout,
  }
}
