'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { Usuario } from '@/lib/types'

// Prototype-level simulated auth for internal staff (Cocina / Admin).
// The real backend already ships JWT + roles (auth.module.ts, roles.guard.ts);
// this is the visual/UX layer for that capability, without a live backend.

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

const STORAGE_KEY = 'papayon.session'

const listeners = new Set<() => void>()

function readSession(portal: Portal): Usuario | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_KEY}.${portal}`)
    return raw ? (JSON.parse(raw) as Usuario) : null
  } catch {
    return null
  }
}

function writeSession(portal: Portal, usuario: Usuario | null) {
  if (typeof window === 'undefined') return
  const key = `${STORAGE_KEY}.${portal}`
  if (usuario) {
    window.sessionStorage.setItem(key, JSON.stringify(usuario))
  } else {
    window.sessionStorage.removeItem(key)
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
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
    writeSession(portal, cred.usuario)
    return { ok: true, usuario: cred.usuario }
  }
  return { ok: false, error: 'Correo o contraseña incorrectos.' }
}

export function useSession(portal: Portal) {
  const usuario = useSyncExternalStore(
    subscribe,
    () => readSession(portal),
    () => null,
  )
  const logout = useCallback(() => writeSession(portal, null), [portal])
  return { usuario, logout }
}
