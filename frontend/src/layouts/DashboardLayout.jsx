// Defines the Dashboard Layout layout used by the frontend application.
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { authApi, clearSession, getAuthToken, setCurrentUser } from '../services/api'

export default function DashboardLayout() {
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

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="neo-frame neo-app h-full w-full max-w-none rounded-none border-0 shadow-none flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pb-8 pt-3">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
