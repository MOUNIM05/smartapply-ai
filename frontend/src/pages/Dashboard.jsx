import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock3, Rocket, CheckCircle2, ArrowUpRight } from 'lucide-react'
import Card from '../components/Card'

const stats = [
  { title: 'Experiences', value: '12', sub: 'Updated this week', accent: 'Ex' },
  { title: 'Skills', value: '18', sub: 'Tagged for ATS', accent: 'Sk' },
  { title: 'Documents', value: '9', sub: 'Ready to send', accent: 'Doc' }
]

const timeline = [
  { title: 'Added new leadership bullet', time: 'Just now', status: 'Saved' },
  { title: 'Generated CV for Stripe PM', time: '2h ago', status: 'Completed' },
  { title: 'Uploaded portfolio PDF', time: 'Yesterday', status: 'Synced' }
]

const container = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}
const item = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function Dashboard() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap" variants={item}>
        <div>
          <div className="pill">Dashboard</div>
          <h1 className="text-3xl font-semibold mt-2 text-slate-900">Welcome back, Jane</h1>
          <p className="text-slate-500 mt-1">Your AI copilot keeps applications organized and tailored.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold shadow-soft"
        >
          <Sparkles size={18} />
          New AI draft
        </motion.button>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" variants={container}>
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6" variants={container}>
        <motion.div className="card lg:col-span-2" variants={item}>
          <div className="flex items-center justify-between">
            <div>
              <p className="pill mb-2">Pipeline</p>
              <h3 className="text-lg font-semibold text-slate-900">Active applications</h3>
              <p className="text-sm text-slate-500">Track interviews, offers, and drafts in one view.</p>
            </div>
            <span className="text-xs text-primary font-semibold flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { company: 'Stripe', role: 'Product Manager', status: 'Interview', badge: 'Hot' },
              { company: 'Notion', role: 'Product Designer', status: 'Portfolio sent', badge: 'Review' },
              { company: 'Linear', role: 'Frontend Engineer', status: 'Offer pending', badge: 'Offer' }
            ].map((itemRow) => (
              <motion.div
                key={itemRow.company}
                whileHover={{ scale: 1.005 }}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{itemRow.company}</p>
                  <p className="text-xs text-slate-500">{itemRow.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="pill">{itemRow.badge}</span>
                  <span className="text-sm text-primary font-semibold">{itemRow.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div className="card" variants={item}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-500">ATS score</p>
                <p className="text-xl font-semibold text-slate-900">86%</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Your latest CV matches the target PM role. Add more metrics to strengthen the story.
            </p>
          </motion.div>

          <motion.div className="card" variants={item}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock3 size={18} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Recent activity</p>
                <p className="text-xl font-semibold text-slate-900">3 updates</p>
              </div>
            </div>
            <div className="space-y-3">
              {timeline.map((itemRow) => (
                <div key={itemRow.title} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{itemRow.title}</p>
                    <p className="text-xs text-slate-500">{itemRow.time}</p>
                  </div>
                  <span className="text-xs text-primary font-semibold">{itemRow.status}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="card bg-gradient-to-br from-slate-900 to-dark text-white" variants={item}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Rocket size={18} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-200">Workflow</p>
                <h4 className="text-xl font-semibold">Ship your next application in 10 minutes</h4>
                <ul className="space-y-2 text-sm text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Paste the job description.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Generate tailored CV & cover letter.
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} /> Export and send with confidence.
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
