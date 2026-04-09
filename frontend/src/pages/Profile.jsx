import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mail, Phone, MapPin, Save, CheckCircle2, GraduationCap, Sparkles, Languages } from 'lucide-react'
import FormInput from '../components/FormInput'
import api from '../services/api'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const container = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
}

export default function Profile() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [educations, setEducations] = useState([
    { title: 'MSc Computer Science', school: 'EPFL', period: '2020 — 2022' }
  ])
  const [newEdu, setNewEdu] = useState({ title: '', school: '', period: '' })
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Tailwind'])
  const [newSkill, setNewSkill] = useState('')
  const [languages, setLanguages] = useState(['English — Fluent', 'French — Native'])
  const [newLang, setNewLang] = useState('')

  const handleSave = () => {
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1000)
  }

  const userId = localStorage.getItem('user_id')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/')
      return
    }
    const loadProfile = async () => {
      try {
        if (!userId) {
          setLoading(false)
          return
        }
        const { data } = await api.get(`/profile/${userId}`)
        if (data) {
          setForm((f) => ({
            ...f,
            fullName: data.fullName || f.fullName,
            headline: data.headline || f.headline,
            email: data.email || f.email,
            phone: data.phone || f.phone,
            location: data.location || f.location
          }))
          if (Array.isArray(data.education)) setEducations(data.education)
          if (Array.isArray(data.skills)) setSkills(data.skills)
          if (Array.isArray(data.languages)) setLanguages(data.languages)
        }
      } catch (err) {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [navigate, userId])

  const [form, setForm] = useState({
    fullName: 'Jane Cooper',
    headline: 'Product Lead · AI UX',
    email: 'jane@smartapply.ai',
    phone: '+1 234 567 8910',
    location: 'Remote · San Francisco'
  })

  const submitProfile = async () => {
    if (!userId) return
    setSaving(true)
    setError('')
    try {
      await api.put(`/profile/${userId}`, {
        fullName: form.fullName,
        headline: form.headline,
        email: form.email,
        phone: form.phone,
        location: form.location,
        education: educations,
        skills,
        languages
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="pill mb-2">Profile</div>
            <h1 className="text-3xl font-semibold text-slate-900">Edit your profile</h1>
            <p className="text-slate-500">Keep your details fresh for one-click applications.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pill bg-primary/15 text-primary flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Saved
              </motion.span>
            )}
            {error && <span className="text-sm text-red-500">{error}</span>}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={submitProfile}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-soft"
              disabled={saving || loading}
            >
              {saving ? 'Saving…' : 'Save changes'}
              <Save size={16} />
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div className="card text-center text-sm text-slate-500">Loading profile…</div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 25px 80px rgba(15,23,42,0.16)' }}
            className="card glass flex flex-col items-center text-center p-6"
          >
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 20px 50px rgba(99,102,241,0.35)' }}
              className="relative mb-4"
            >
              <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary via-indigo-500 to-purple-500 shadow-xl" />
              <button className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-soft flex items-center justify-center border border-slate-100">
                <Camera size={16} className="text-slate-700" />
              </button>
            </motion.div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900">Jane Cooper</p>
              <p className="text-sm text-slate-500">Product Lead · Remote</p>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              Tip: add 2-3 bullet points summarizing your impact. SmartApply will reuse them in cover letters.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, boxShadow: '0 20px 70px rgba(15,23,42,0.12)' }}
            className="card glass lg:col-span-2 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account details</h3>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="grid md:grid-cols-2 gap-4"
            >
              <FormInput label="Full name" value={form.fullName} onChange={(e)=>setForm(f=>({...f, fullName:e.target.value}))} />
              <FormInput label="Headline" value={form.headline} onChange={(e)=>setForm(f=>({...f, headline:e.target.value}))} />
              <FormInput label="Email" icon={Mail} value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} />
              <FormInput label="Phone" icon={Phone} value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} />
              <FormInput label="Location" icon={MapPin} value={form.location} onChange={(e)=>setForm(f=>({...f, location:e.target.value}))} className="md:col-span-2" />
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="card glass space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Education</h3>
            </div>
            <div className="space-y-2">
              {educations.map((edu, idx) => (
                <div key={`${edu.title}-${idx}`} className="p-3 rounded-lg border border-slate-100 bg-white/70">
                  <p className="font-semibold text-slate-900">{edu.title}</p>
                  <p className="text-sm text-slate-500">{edu.school}</p>
                  <p className="text-xs text-slate-400">{edu.period}</p>
                </div>
              ))}
              {educations.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
            </div>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newEdu.title || !newEdu.school) return
                setEducations([newEdu, ...educations])
                setNewEdu({ title: '', school: '', period: '' })
              }}
            >
              <FormInput label="Title" value={newEdu.title} onChange={(e) => setNewEdu((f) => ({ ...f, title: e.target.value }))} />
              <FormInput label="School" value={newEdu.school} onChange={(e) => setNewEdu((f) => ({ ...f, school: e.target.value }))} />
              <FormInput label="Period" value={newEdu.period} onChange={(e) => setNewEdu((f) => ({ ...f, period: e.target.value }))} />
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-primary text-white py-2 rounded-xl shadow-soft" type="submit">
                Add education
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
                <div key={`${l}-${idx}`} className="p-3 rounded-lg border border-slate-100 bg-white/70 text-sm text-slate-700">
                  {l}
                </div>
              ))}
              {languages.length === 0 && <p className="text-sm text-slate-500">No languages yet.</p>}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!newLang) return
                setLanguages([newLang, ...languages])
                setNewLang('')
              }}
            >
              <input
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                placeholder="Add language + level"
              />
              <button className="px-3 py-2 bg-primary text-white rounded-xl shadow-soft" type="submit">
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </motion.div>
  )
}
