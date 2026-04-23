// Provides the Card reusable UI component.
import { motion } from 'framer-motion'

function Card({ title, value, accent, sub }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="card w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <p className="text-3xl font-semibold text-slate-100">{value}</p>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
        {accent && (
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-400 text-white flex items-center justify-center font-semibold shadow-[0_10px_24px_rgba(124,58,237,0.35)]">
            {accent}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Card
