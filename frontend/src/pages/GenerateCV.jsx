import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Copy, Download, FileText } from 'lucide-react'

export default function GenerateCV() {
  const [input, setInput] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState('cv')
  const [template, setTemplate] = useState('Aurora')
  const [generated, setGenerated] = useState(false)
  const actions = [
    { id: 'cv', label: 'Generate CV' },
    { id: 'motivation', label: 'Generate Motivation Letter' },
    { id: 'email', label: 'Generate Email' },
    { id: 'improve', label: 'Improve Content' },
    { id: 'adapt', label: 'Adapt to Job Offer' }
  ]
  const templates = ['Aurora', 'Minimal', 'Gradient', 'Slate']

  const handleGenerate = () => {
    setLoading(true)
    setGenerated(false)
    setTimeout(() => {
      setResult(
        `Action: ${actions.find((a) => a.id === action)?.label}\nTemplate: ${template}\n\nSummary\n• Led cross-functional pods to launch AI features that improved activation by 12%.\n• Partnered with design to ship a design system in 6 weeks.\n\nExperience\n- Product Manager, Stripe — 2023–Present\n  Drove roadmap for billing APIs; reduced integration time by 30%.\n- Frontend Engineer, Linear — 2021–2023\n  Built real-time collaboration and accessibility upgrades.`
      )
      setLoading(false)
      setGenerated(true)
    }, 1200)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">AI Generator</div>
          <h1 className="text-3xl font-semibold text-slate-900">Craft tailored materials</h1>
          <p className="text-slate-500">Paste a job description or bullet points. SmartApply does the rest.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="pill bg-accent/10 text-accent border border-accent/40">Beta</div>
          <div className="pill">Fast draft mode</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Input</h3>
            <span className="text-xs text-slate-500">Job description or context</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => setAction(a.id)}
                className={`px-3 py-2 rounded-xl text-sm border transition ${
                  action === a.id ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          <input
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Job title / company / keywords"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the job description, required skills, or your bullet points..."
            className="w-full h-56 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
          />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGenerate}
            disabled={loading || (!input && !jd)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white px-4 py-3 rounded-xl font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Generating…' : 'Generate with AI'}
          </motion.button>
          {!input && !jd && <p className="text-xs text-slate-500">Add some context to enable generation.</p>}
          {generated && !loading && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-2">
              <Sparkles size={14} /> Result ready — you can download or copy now.
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card bg-slate-900 text-white relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Result</h3>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition disabled:opacity-50" disabled={!result}>
                  <Copy size={16} />
                </button>
                <button className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition disabled:opacity-50" disabled={!result}>
                  <Download size={16} />
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 min-h-[260px] relative overflow-hidden">
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex items-center gap-3 text-sm text-slate-100">
                    <Loader2 className="animate-spin" size={18} />
                    Generating…
                  </div>
                </motion.div>
              )}
              {loading && (
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <Loader2 className="animate-spin" size={16} />
                  Generating a tailored CV…
                </div>
              )}
              {!loading && result && (
                <motion.pre
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100"
                >
                  {result}
                </motion.pre>
              )}
              {!loading && !result && (
                <div className="text-sm text-slate-300 flex items-center gap-2">
                  <FileText size={16} /> Waiting for your prompt…
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">CV Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.02 }}
              onClick={() => setTemplate(t)}
              className={`p-4 rounded-xl border text-sm font-semibold transition ${
                template === t ? 'border-primary bg-primary/10 text-primary shadow-soft' : 'border-slate-200 bg-white hover:border-primary/40'
              }`}
            >
              {t}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Selected template: {template}</p>
      </div>
    </motion.div>
  )
}
