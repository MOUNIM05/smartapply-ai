import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Shield, UserRound } from 'lucide-react'
import { authApi, getCurrentUser, setCurrentUser } from '../services/api'

export default function Account() {
  const [user, setUser] = useState(getCurrentUser())
  const [loading, setLoading] = useState(!getCurrentUser())
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setError('')
        const { data } = await authApi.get('/users/me')
        if (data?.user) {
          setUser(data.user)
          setCurrentUser(data.user)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load account.')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      loadAccount()
    }
  }, [user])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="pill mb-2">Account</div>
        <h1 className="text-3xl font-semibold text-slate-900">Your account</h1>
        <p className="text-slate-500 mt-1">Review the main information of the connected user.</p>

        {error && <div className="card mt-6 text-sm text-red-500">{error}</div>}

        {loading ? (
          <div className="card mt-6 text-sm text-slate-500">Loading account...</div>
        ) : (
          <div className="card mt-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-indigo-300 ring-2 ring-indigo-100" />
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Connected user'}
                </h2>
                <p className="text-sm text-slate-500">SmartApply AI account</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-8">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Full name</p>
                    <p className="font-semibold text-slate-900">
                      {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-900">{user?.email || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-semibold text-slate-900 capitalize">{user?.role || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
