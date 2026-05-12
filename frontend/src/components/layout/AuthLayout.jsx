import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

const AuthLayout = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  // Nếu đã đăng nhập, redirect về dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  )
}

export default AuthLayout
