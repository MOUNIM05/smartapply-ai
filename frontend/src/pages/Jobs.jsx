import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Star, Send, Sparkles, Plus, CheckCircle2 } from 'lucide-react'
import FormInput from '../components/FormInput'

const seedJobs = [
  { title: 'Product Manager', company: 'Stripe', type: 'Remote', level: 'Senior', status: 'Interview', id: 1 },
  { title: 'Frontend Engineer', company: 'Linear', type: 'Hybrid', level: 'Mid', status: 'Applied', id: 2 },
  { title: 'Product Designer', company: 'Notion', type: 'Remote', level: 'Senior', status: 'Offer', id: 3 }
]

export default function Jobs() {
  const [jobs, setJobs] = useState(seedJobs)
  const [selected, setSelected] = useState(seedJobs[0])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', company: '', type: '', level: '', status: 'Applied' })
  const statuses = ['Applied', 'Interview', 'Offer']

  const submit = (e) => {
    e.preventDefault()
    if (!form.title || !form.company) return
    const newJob = { ...form, id: Date.now() }
    setJobs([newJob, ...jobs])
    setSelected(newJob)
    setShowForm(false)
    setForm({ title: '', company: '', type: '', level: '', status: 'Applied' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">Job offers</div>
          <h1 className="text-3xl font-semibold text-slate-900">Curate your pipeline</h1>
          <p className="text-slate-500">Pick a role to highlight — the AI generator will adapt instantly.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-soft hover:shadow-lg transition"
        >
          <Plus size={16} />
          Add Job
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-3">
          {jobs.length === 0 && <div className="card text-sm text-slate-500">No jobs yet. Click “Add Job”.</div>}
          {jobs.map((job) => {
            const isActive = selected?.id === job.id
            return (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.005 }}
                onClick={() => setSelected(job)}
                className={`card cursor-pointer flex items-center justify-between border ${
                  isActive ? 'border-primary/60 shadow-soft' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{job.title}</p>
                    <p className="text-sm text-slate-500">
                      {job.company} • {job.type || 'Remote'} • {job.level || 'Any'}
                    </p>
                  </div>
                </div>
                <div className="pill">{job.status}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="card space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Star size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Highlighted role</p>
              <p className="text-xl font-semibold text-slate-900">{selected?.title || 'None'}</p>
              <p className="text-sm text-slate-500">{selected?.company}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            SmartApply will tailor your CV and cover letter toward this role. Switch roles anytime to
            refresh your materials.
          </p>
          <div className="flex items-center gap-3">
            <button className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-soft hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60" disabled={!selected}>
              <Send size={16} />
              Send application
            </button>
            <button className="flex-1 border border-slate-200 py-3 rounded-xl font-semibold text-slate-700 hover:border-primary/40 hover:text-primary transition disabled:opacity-60" disabled={!selected}>
              Preview JD
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 12 }}
              className="bg-white rounded-2xl shadow-soft p-6 w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="pill mb-1">Add job</p>
                  <h3 className="text-lg font-semibold text-slate-900">Track a new opportunity</h3>
                </div>
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form className="space-y-3" onSubmit={submit}>
                <FormInput label="Job title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                <FormInput label="Company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Location / Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="Remote / Hybrid" />
                  <FormInput label="Level" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} placeholder="Senior" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        form.status === s ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'
                      }`}
                    >
                      {form.status === s && <CheckCircle2 size={14} className="inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"
                    disabled={!form.title || !form.company}
                  >
                    Add Job
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
