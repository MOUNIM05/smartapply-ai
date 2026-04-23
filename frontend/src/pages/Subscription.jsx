// Renders the Subscription page and coordinates checkout actions.
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, GraduationCap, Loader2, ShieldCheck, Sparkles, Stars } from 'lucide-react'
import { authApi, getCurrentUser, setCurrentUser } from '../services/api'

const plans = [
  {
    planKey: 'free',
    name: 'Free',
    price: '0€',
    badge: 'Start',
    icon: Sparkles,
    accent: 'from-slate-800 to-slate-700',
    ring: 'ring-slate-200',
    description: 'Perfect to discover the platform and build your first application flow.',
    features: [
      'Basic dashboard access',
      'Profile editing',
      'Limited CV generation',
      'Access to notifications'
    ],
    cta: 'Included by default'
  },
  {
    planKey: 'student',
    name: 'Student',
    price: '49€',
    badge: 'Popular',
    icon: GraduationCap,
    accent: 'from-primary to-indigo-500',
    ring: 'ring-primary/30',
    description: 'Made for students and fresh graduates who want stronger applications faster.',
    features: [
      'Everything in Free',
      'More AI generations',
      'Priority CV and letter workflows',
      'Student-focused application boost'
    ],
    cta: 'Upgrade monthly'
  },
  {
    planKey: 'premium',
    name: 'Premium',
    price: '99€',
    badge: 'Best value',
    icon: Stars,
    accent: 'from-amber-400 via-orange-400 to-rose-500',
    ring: 'ring-orange-200',
    description: 'For serious candidates who want the full SmartApply AI experience.',
    features: [
      'Everything in Student',
      'High-volume AI generation',
      'Priority support',
      'Premium profile and application tools'
    ],
    cta: 'Upgrade monthly'
  }
]

const highlights = [
  {
    title: 'Sharper AI workflows',
    text: 'Generate stronger CVs, letters, and application emails with a smoother flow.'
  },
  {
    title: 'Better application speed',
    text: 'Move from profile setup to polished documents in a much shorter time.'
  },
  {
    title: 'Cleaner candidate experience',
    text: 'Stay organized with documents, notifications, and profile details in one place.'
  }
]

const planLabel = {
  free: 'Free',
  student: 'Student',
  premium: 'Premium'
}

const clearSubscriptionQueryParams = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('session_id')
  url.searchParams.delete('checkout')
  const cleanUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', cleanUrl)
}

export default function Subscription() {
  const [user, setUserState] = useState(getCurrentUser())
  const [loadingUser, setLoadingUser] = useState(!getCurrentUser())
  const [processingPlan, setProcessingPlan] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const hasHandledCheckoutReturn = useRef(false)

  const currentPlan = user?.subscription?.plan || 'free'
  const currentStatus = user?.subscription?.status || 'inactive'

  const renewalDate = useMemo(() => {
    const renewalRaw = user?.subscription?.renewal_at
    if (!renewalRaw) return ''

    const parsed = new Date(renewalRaw)
    if (Number.isNaN(parsed.getTime())) return ''

    return parsed.toLocaleDateString('fr-FR')
  }, [user?.subscription?.renewal_at])

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setError('')
        const { data } = await authApi.get('/users/me')

        if (data?.user) {
          setUserState(data.user)
          setCurrentUser(data.user)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your current subscription.')
      } finally {
        setLoadingUser(false)
      }
    }

    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (hasHandledCheckoutReturn.current) {
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    const sessionId = searchParams.get('session_id')
    const checkout = searchParams.get('checkout')

    if (!sessionId && checkout !== 'cancel') {
      return
    }

    hasHandledCheckoutReturn.current = true

    if (checkout === 'cancel') {
      setNotice('Paiement annule. Aucun changement na ete applique.')
      clearSubscriptionQueryParams()
      return
    }

    const confirmCheckout = async () => {
      try {
        setProcessingPlan('confirm')
        setError('')
        setNotice('')

        const { data } = await authApi.post('/subscriptions/confirm', {
          session_id: sessionId
        })

        if (data?.user) {
          setUserState(data.user)
          setCurrentUser(data.user)
        }

        setNotice('Paiement confirme. Votre abonnement mensuel est actif.')
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to confirm the checkout session.')
      } finally {
        setProcessingPlan('')
        clearSubscriptionQueryParams()
      }
    }

    confirmCheckout()
  }, [])

  const startCheckout = async (planKey) => {
    if (planKey === 'free') {
      setNotice('Le plan Free est deja disponible sans paiement.')
      return
    }

    if (currentPlan === planKey && currentStatus === 'active') {
      setNotice(`Votre abonnement ${planLabel[planKey]} est deja actif.`)
      return
    }

    try {
      setProcessingPlan(planKey)
      setError('')
      setNotice('')

      const { data } = await authApi.post('/subscriptions/checkout-session', {
        plan: planKey
      })

      if (!data?.checkout_url) {
        throw new Error('Checkout URL was not returned by the server.')
      }

      window.location.assign(data.checkout_url)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start checkout.')
      setProcessingPlan('')
    }
  }

  const resolveCtaLabel = (plan) => {
    if (processingPlan === 'confirm') {
      return 'Confirming payment...'
    }

    if (processingPlan === plan.planKey) {
      return 'Redirecting to checkout...'
    }

    if (plan.planKey === currentPlan && (plan.planKey === 'free' || currentStatus === 'active')) {
      return 'Current plan'
    }

    return plan.cta
  }

  const isPlanButtonDisabled = (plan) =>
    Boolean(processingPlan) || (plan.planKey === currentPlan && (plan.planKey === 'free' || currentStatus === 'active'))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      className="space-y-6"
    >
      <section className="relative overflow-hidden rounded-[2rem] bg-dark text-white px-6 py-8 md:px-8 md:py-10 shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,90,78,0.22),transparent_28%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
          <div>
            <div className="pill bg-white/10 text-white border border-white/10 mb-4">Subscription plans</div>
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight max-w-3xl">
              Upgrade your application workflow with a plan that matches your ambition.
            </h1>
            <p className="text-slate-300 mt-4 max-w-2xl text-base md:text-lg">
              Pick a monthly plan for your current stage: free to explore, student to accelerate, premium to go all in.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-300">Current subscription</p>
                <p className="text-lg font-semibold">
                  {planLabel[currentPlan]} {currentStatus === 'active' ? '(active)' : '(inactive)'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 mt-5">
              <p className="text-sm text-slate-300">Renewal date</p>
              <p className="font-semibold">{renewalDate || 'Not applicable yet'}</p>
            </div>
          </div>
        </div>
      </section>

      {(loadingUser || error || notice) && (
        <section className="card">
          {loadingUser && <p className="text-sm text-slate-500">Loading your subscription details...</p>}
          {!loadingUser && error && <p className="text-sm text-red-500">{error}</p>}
          {!loadingUser && notice && <p className="text-sm text-primary">{notice}</p>}
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = plan.icon

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className={`card relative overflow-hidden ring-1 ${plan.ring}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${plan.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="pill">{plan.badge}</div>
                  <h2 className="text-2xl font-semibold text-slate-900 mt-4">{plan.name}</h2>
                </div>
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${plan.accent} text-white flex items-center justify-center shadow-soft`}>
                  <Icon size={22} />
                </div>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-semibold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 pb-1">/month</span>
              </div>

              <p className="text-sm text-slate-500 mt-3 min-h-[3rem]">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                    <BadgeCheck size={18} className="text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => startCheckout(plan.planKey)}
                disabled={isPlanButtonDisabled(plan)}
                className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white shadow-soft bg-gradient-to-r ${plan.accent} disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {processingPlan === plan.planKey || processingPlan === 'confirm' ? <Loader2 size={16} className="animate-spin" /> : null}
                {resolveCtaLabel(plan)}
                {processingPlan ? null : <ArrowRight size={16} />}
              </button>
            </motion.div>
          )
        })}
      </section>

      <section className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="pill mb-3">Simple billing</div>
            <h3 className="text-2xl font-semibold text-slate-900">Monthly plans with Stripe checkout</h3>
            <p className="text-slate-500 mt-2">
              Student at 49€ and Premium at 99€ are billed monthly. Free stays available for discovery.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 min-w-[260px]">
            <p className="text-sm text-slate-500">Current plan</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">{planLabel[currentPlan]}</p>
            <p className="text-sm text-slate-600 mt-2">
              Status: <span className="font-semibold capitalize">{currentStatus}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="grid gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
