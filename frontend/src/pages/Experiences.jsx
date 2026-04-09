import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Trash2, Edit3, Plus, GraduationCap, Sparkles, Languages } from 'lucide-react'
import FormInput from '../components/FormInput'

const initialExperiences = [
  { role: 'Frontend Engineer', company: 'Linear', period: '2023 — Present', summary: 'Built design system + shipping velocity tooling.', skills: ['React', 'Design Systems', 'DX'] },
  { role: 'Product Designer', company: 'Notion', period: '2022 — 2023', summary: 'Redesigned onboarding; +14% activation.', skills: ['UX', 'Prototyping', 'Research'] }
]

export default function Experiences() {
  const [experiences, setExperiences] = useState(initialExperiences)
  const [form, setForm] = useState({ role: '', company: '', period: '', summary: '', skills: '' })
  const [editingIndex, setEditingIndex] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formations, setFormations] = useState([
    { title: 'MSc Computer Science', school: 'EPFL', period: '2020 — 2022' }
  ])
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Tailwind', 'Node.js'])
  const [languages, setLanguages] = useState(['English — Fluent', 'French — Native'])
  const [newFormation, setNewFormation] = useState({ title: '', school: '', period: '' })
  const [newSkill, setNewSkill] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  const resetForm = () => {
    setForm({ role: '', company: '', period: '', summary: '' })
    setEditingIndex(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.role || !form.company) return
    if (editingIndex !== null) {
      const next = [...experiences]
      next[editingIndex] = {
        ...form,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
      }
      setExperiences(next)
    } else {
      setExperiences([
        {
          ...form,
          skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
        },
        ...experiences
      ])
    }
    resetForm()
    setShowForm(false)
  }

  const deleteExp = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const startEdit = (idx) => {
    setEditingIndex(idx)
    setForm(experiences[idx])
    setShowForm(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">Experience</div>
          <h1 className="text-3xl font-semibold text-slate-900">Add your impact</h1>
          <p className="text-slate-500">Quantify outcomes; the generator will reuse them.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl shadow-soft hover:shadow-lg transition"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      <div className="lg:col-span-2 space-y-3 mt-6">
        {experiences.length === 0 && (
          <div className="card text-slate-500 text-sm">No experiences yet. Click "Add Experience" to get started.</div>
        )}
        {experiences.map((exp, idx) => (
          <motion.div
            key={`${exp.company}-${idx}`}
            whileHover={{ y: -2 }}
            className="card flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{exp.role}</p>
                <p className="text-sm text-slate-500">
                  {exp.company} · {exp.period || 'Add timeframe'}
                </p>
                <p className="text-sm text-slate-600 mt-2">{exp.summary || 'Add a short summary.'}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(exp.skills && exp.skills.length ? exp.skills : ['Impact', 'Teamwork']).map((s) => (
                    <span key={s} className="pill bg-primary/10 text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(idx)}
                className="h-9 w-9 rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 transition"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => deleteExp(idx)}
                className="h-9 w-9 rounded-xl border border-slate-200 text-red-500 hover:border-red-200 hover:bg-red-50 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
        <div className="card glass space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Formations</h3>
          </div>
          <div className="space-y-2">
            {formations.map((f, idx) => (
              <div key={`${f.title}-${idx}`} className="p-3 rounded-lg border border-slate-100 bg-white/60">
                <p className="font-semibold text-slate-900">{f.title}</p>
                <p className="text-sm text-slate-500">{f.school}</p>
                <p className="text-xs text-slate-400">{f.period}</p>
              </div>
            ))}
            {formations.length === 0 && <p className="text-sm text-slate-500">No formations yet.</p>}
          </div>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newFormation.title || !newFormation.school) return
              setFormations([newFormation, ...formations])
              setNewFormation({ title: '', school: '', period: '' })
            }}
          >
            <FormInput label="Title" value={newFormation.title} onChange={(e) => setNewFormation((f) => ({ ...f, title: e.target.value }))} />
            <FormInput label="School" value={newFormation.school} onChange={(e) => setNewFormation((f) => ({ ...f, school: e.target.value }))} />
            <FormInput label="Period" value={newFormation.period} onChange={(e) => setNewFormation((f) => ({ ...f, period: e.target.value }))} />
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-primary text-white py-2 rounded-xl shadow-soft" type="submit">
              Add formation
            </motion.button>
          </form>
        </div>

        <div className="card glass space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span key={`${s}-${idx}`} className="pill">
                {s}
              </span>
            ))}
            {skills.length === 0 && <p className="text-sm text-slate-500">No skills yet.</p>}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newSkill) return
              setSkills([newSkill, ...skills])
              setNewSkill('')
            }}
          >
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="Add a skill"
            />
            <button className="px-3 py-2 bg-primary text-white rounded-xl shadow-soft" type="submit">
              Add
            </button>
          </form>
        </div>

        <div className="card glass space-y-3">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Languages</h3>
          </div>
          <div className="space-y-2">
            {languages.map((l, idx) => (
              <div key={`${l}-${idx}`} className="p-3 rounded-lg border border-slate-100 bg-white/60 text-sm text-slate-700">
                {l}
              </div>
            ))}
            {languages.length === 0 && <p className="text-sm text-slate-500">No languages yet.</p>}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newLanguage) return
              setLanguages([newLanguage, ...languages])
              setNewLanguage('')
            }}
          >
            <input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="Add language + level"
            />
            <button className="px-3 py-2 bg-primary text-white rounded-xl shadow-soft" type="submit">
              Add
            </button>
          </form>
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
              initial={{ scale: 0.96, y: 8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 10 }}
              className="bg-white rounded-2xl shadow-soft p-6 w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="pill mb-1">{editingIndex !== null ? 'Edit' : 'Add'} experience</p>
                  <h3 className="text-lg font-semibold text-slate-900">Share your impact</h3>
                </div>
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <FormInput
                  label="Role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Frontend Engineer"
                  required
                />
                <FormInput
                  label="Company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. SmartApply"
                  required
                />
                <FormInput
                  label="Period"
                  value={form.period}
                  onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                  placeholder="2024 — Present"
                />
                <FormInput
                  label="Description"
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Highlight measurable impact"
                  helper="Keep it concise and numbers-first."
                />
                <FormInput
                  label="Skills (comma separated)"
                  value={form.skills}
                  onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                  placeholder="React, UX Writing"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setShowForm(false) }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"
                    disabled={!form.role || !form.company}
                  >
                    {editingIndex !== null ? 'Update' : 'Save'} experience
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
