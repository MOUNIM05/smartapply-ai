import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'
import FormInput from '../components/FormInput'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 950)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr,1.1fr] bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-400 text-white p-10 flex flex-col justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-white/20 blur-3xl"
            initial={{ x: -60, y: -10 }}
            animate={{ x: 50, y: 40 }}
            transition={{ duration: 9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-accent/40 blur-3xl right-6 bottom-6"
            initial={{ x: 20, y: 10 }}
            animate={{ x: -30, y: -20 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10">
          <p className="pill bg-white/20 text-white">Create your workspace</p>
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight mt-4">
            Build polished applications in minutes with AI.
          </h1>
          <p className="text-slate-50/85 mt-4 max-w-xl">
            SmartApply personalizes your CVs, adapts cover letters, and keeps everything synced in one
            delightful workspace.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/90">
            <div className="h-10 w-10 rounded-full bg-white/15 border border-white/30" />
            <div>
              <p className="font-semibold">Students + early career</p>
              <p>Launch your next application faster than ever.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 lg:px-12 py-10">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="w-full max-w-lg"
        >
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="pill">Get started</p>
                <h2 className="text-2xl font-semibold mt-2">Create your account</h2>
                <p className="text-sm text-slate-500 mt-1">No credit card required. 14-day free trial.</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                🚀
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First name" icon={User} name="firstName" required />
              <FormInput label="Last name" icon={User} name="lastName" required />
              <FormInput
                label="Email"
                icon={Mail}
                type="email"
                name="email"
                className="md:col-span-2"
                required
              />
              <FormInput
                label="Password"
                icon={Lock}
                type="password"
                name="password"
                helper="Use at least 8 characters with a number and symbol."
                required
                className="md:col-span-2"
              />

              <div className="md:col-span-2 space-y-3">
                <label className="inline-flex items-start gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="mt-1 rounded-md border-slate-300 text-primary focus:ring-primary" required />
                  <span>
                    I agree to the <a className="text-primary font-semibold">Terms</a> and{' '}
                    <a className="text-primary font-semibold">Privacy Policy</a>.
                  </span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white py-3 rounded-xl font-semibold shadow-soft hover:shadow-lg transition"
                  disabled={loading}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </form>

            <p className="text-sm text-center text-slate-500 mt-4">
              Already have an account?{' '}
              <Link to="/" className="text-primary font-semibold hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
