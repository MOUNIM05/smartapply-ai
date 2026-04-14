// Renders the Subscription page and coordinates its UI state.
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, GraduationCap, ShieldCheck, Sparkles, Stars } from 'lucide-react'

const plans = [
  {
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
    cta: 'Current best start'
  },
  {
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
    cta: 'Choose Student'
  },
  {
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
    cta: 'Go Premium'
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

export default function Subscription() {
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
              Pick a plan for your current stage: free to explore, student to accelerate, premium to go all in.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-300">Why upgrade</p>
                <p className="text-lg font-semibold">More AI power, more speed, more polish</p>
              </div>
            </div>
            <div className="grid gap-3 mt-5">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold text-white shadow-soft bg-gradient-to-r ${plan.accent}`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )
        })}
      </section>

      <section className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="pill mb-3">Simple billing</div>
            <h3 className="text-2xl font-semibold text-slate-900">Choose the plan that fits your current goal</h3>
            <p className="text-slate-500 mt-2">
              Free for discovery, Student at 49€ for faster momentum, and Premium at 99€ for the full experience.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 min-w-[260px]">
            <p className="text-sm text-slate-500">Current recommendation</p>
            <p className="text-xl font-semibold text-slate-900 mt-1">Student plan</p>
            <p className="text-sm text-slate-600 mt-2">
              Best balance if you want stronger applications without jumping straight to premium.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
