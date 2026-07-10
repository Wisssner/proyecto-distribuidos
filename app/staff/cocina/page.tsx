'use client'

import { useRouter } from 'next/navigation'
import { Flame } from 'lucide-react'
import { StaffLoginShell } from '@/components/staff/login-shell'
import { DEMO_CREDENTIALS, login } from '@/lib/auth'

export default function LoginCocinaPage() {
  const router = useRouter()

  function handleSubmit(correo: string, contrasena: string) {
    const result = login('cocina', correo, contrasena)
    if (result.ok) {
      router.push('/staff/cocina/kds')
      return undefined
    }
    return result.error
  }

  return (
    <StaffLoginShell
      icon={Flame}
      role="Cocina"
      subtitle="Kitchen Display System: visualiza y avanza los pedidos activos en tiempo real."
      submitLabel="Ingresar a Cocina"
      demoCorreo={DEMO_CREDENTIALS.cocina.correo}
      demoContrasena={DEMO_CREDENTIALS.cocina.contrasena}
      onSubmit={handleSubmit}
    />
  )
}
