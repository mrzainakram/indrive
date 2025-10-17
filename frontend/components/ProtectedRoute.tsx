'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/login')
    }
  }, [user, isAuthenticated, allowedRoles, router])

  if (!isAuthenticated() || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}

