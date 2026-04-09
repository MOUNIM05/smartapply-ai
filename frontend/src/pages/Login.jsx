import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import FormInput from '../components/FormInput'
import api from '../services/api'

const blobProps = {
  transition: { duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
}

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const token = data?.token || data?.access_token
      if (token) {
        localStorage.setItem('access_token', token)
      }
      if (data?.user?._id) localStorage.setItem('user_id', data.user._id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr,1fr] bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-dark via-slate-900 to-primary text-white p-10 flex flex-col justify-between">
        <div className="absolute inset-0">
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-primary/50 blur-3xl"
            initial={{ x: -40, y: 20 }}
            animate={{ x: 40, y: -30 }}
            {...blobProps}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-accent/40 blur-3xl right-10 bottom-0"
            initial={{ x: 0, y: 0 }}
            animate={{ x: -20, y: -20 }}
            {...blobProps}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg font-bold">
              SA
            </div>
            <div>
              <p className="text-sm text-slate-200">SmartApply AI</p>
              <p className="text-2xl font-semibold">Your career copilot</p>
            </div>
          </div>
          <div className="space-y-4 max-w-xl">
            <div className="pill bg-white/15 text-white/90">Powered by AI workflows</div>
            <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
              Apply faster with tailored CVs, cover letters, and live insights.
            </h1>
            <p className="text-slate-200/80 leading-relaxed">
              SmartApply AI helps you ship compelling applications in minutes. Upload your experience,
              target a role, and let the copilot craft ATS-friendly materials instantly.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-slate-200">
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20" />
          <div>
            <p className="font-semibold text-white">Trusted by students & grads</p>
            <p className="text-slate-200/80">Built for fast-paced applications.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 lg:px-12 py-10 bg-background">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="w-full max-w-md"
        >
          <div className="card shadow-soft/60">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="pill">Welcome back</p>
                <h2 className="text-2xl font-semibold mt-2">Sign in to SmartApply</h2>
                <p className="text-sm text-slate-500 mt-1">Continue crafting applications with AI.</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                AI
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput label="Email" icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
              <FormInput label="Password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} required />

              <div className="flex items-center justify-between text-sm text-slate-500">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="rounded-md border-slate-300 text-primary focus:ring-primary" />
                  Remember me
                </label>
                <button type="button" className="text-primary font-medium hover:text-indigo-500">Forgot password?</button>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white py-3 rounded-xl font-semibold shadow-soft hover:shadow-lg transition"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
                <ArrowRight size={16} />
              </motion.button>
            </form>

            <p className="text-sm text-center text-slate-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:text-indigo-500">
                Start free trial
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
