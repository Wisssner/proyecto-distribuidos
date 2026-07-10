'use client'

import { useRouter } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { StaffLoginShell } from '@/components/staff/login-shell'
import { DEMO_CREDENTIALS, login } from '@/lib/auth'

export default function LoginAdminPage() {
  const router = useRouter()

  function handleSubmit(correo: string, contrasena: string) {
    const result = login('admin', correo, contrasena)
    if (result.ok) {
      router.push('/staff/admin/panel')
      return undefined
    }
    return result.error
  }

  return (
    <StaffLoginShell
      icon={LayoutDashboard}
      role="Administración"
      subtitle="Panel de gestión: Caja, Repartidor y Dashboard de métricas del negocio."
      submitLabel="Ingresar al panel"
      demoCorreo={DEMO_CREDENTIALS.admin.correo}
      demoContrasena={DEMO_CREDENTIALS.admin.contrasena}
      onSubmit={handleSubmit}
    />
  )
}
