// Defines the Dashboard Layout layout used by the frontend application.
import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { authApi, clearSession, getAuthToken, setCurrentUser } from '../services/api'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const navigate = useNavigate()

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    const bootstrapUser = async () => {
      try {
        const { data } = await authApi.get('/users/me')
        if (data?.user) {
          setCurrentUser(data.user)
        }
      } catch (error) {
        clearSession()
        navigate('/login')
      }
    }

    bootstrapUser()
  }, [navigate])

  const handleNavigate = () => {
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{
          x: !sidebarOpen && isMobile ? -300 : 0,
          opacity: 1
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="fixed z-30 lg:static h-screen lg:sticky top-0"
      >
        <Sidebar collapsed={!sidebarOpen && !isMobile} onToggle={() => setSidebarOpen((s) => !s)} onNavigate={handleNavigate} />
      </motion.aside>

      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-4">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
