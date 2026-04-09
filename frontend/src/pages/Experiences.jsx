import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Trash2, Edit3, Plus, GraduationCap, Sparkles, Languages } from 'lucide-react'
import FormInput from '../components/FormInput'
import { getCurrentUserRole, profileApi } from '../services/api'

export default function Experiences() {
  const isAdmin = getCurrentUserRole() === 'admin'
  const [experiences, setExperiences] = useState([])
  const [educations, setEducations] = useState([])
  const [skills, setSkills] = useState([])
  const [languages, setLanguages] = useState([])
  const [form, setForm] = useState({
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    skills: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newFormation, setNewFormation] = useState({ title: '', school: '', period: '' })
  const [editingEducationId, setEditingEducationId] = useState(null)

  const [newSkill, setNewSkill] = useState('')
  const [editingSkillId, setEditingSkillId] = useState(null)

  const [newLanguage, setNewLanguage] = useState({ name: '', level: '' })
  const [editingLanguageId, setEditingLanguageId] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      setLoading(false)
      return
    }

    const loadResources = async () => {
      try {
        const [experiencesResponse, educationsResponse, skillsResponse, languagesResponse] =
          await Promise.all([
            profileApi.get('/experiences/me'),
            profileApi.get('/educations/me'),
            profileApi.get('/skills/me'),
            profileApi.get('/languages/me')
          ])

        setExperiences(experiencesResponse.data?.experiences || [])
        setEducations(educationsResponse.data?.educations || [])
        setSkills(skillsResponse.data?.skills || [])
        setLanguages(languagesResponse.data?.languages || [])
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load profile resources.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [isAdmin])

  const resetForm = () => {
    setForm({
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: '',
      skills: ''
    })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.jobTitle || !form.company) {
      return
    }

    const payload = {
      jobTitle: form.jobTitle,
      company: form.company,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      skills: form.skills
        ? form.skills.split(',').map((item) => item.trim()).filter(Boolean)
        : []
    }

    try {
      setError('')

      if (editingId) {
        const { data } = await profileApi.put(`/experiences/${editingId}`, payload)
        const updatedExperience = data?.experience

        if (updatedExperience) {
          setExperiences((current) =>
            current.map((experience) =>
              experience.id === editingId ? updatedExperience : experience
            )
          )
        }
      } else {
        const { data } = await profileApi.post('/experiences', payload)
        const newExperience = data?.experience

        if (newExperience) {
          setExperiences((current) => [newExperience, ...current])
        }
      }

      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save experience.')
    }
  }

  const deleteExp = async (experienceId) => {
    try {
      setError('')
      await profileApi.delete(`/experiences/${experienceId}`)
      setExperiences((current) =>
        current.filter((experience) => experience.id !== experienceId)
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete experience.')
    }
  }

  const startEdit = (experience) => {
    setEditingId(experience.id)
    setForm({
      jobTitle: experience.jobTitle || '',
      company: experience.company || '',
      startDate: experience.startDate || '',
      endDate: experience.endDate || '',
      description: experience.description || '',
      skills: Array.isArray(experience.skills) ? experience.skills.join(', ') : ''
    })
    setShowForm(true)
  }

  const submitEducation = async (e) => {
    e.preventDefault()
    if (!newFormation.title || !newFormation.school) return

    try {
      setError('')
      if (editingEducationId) {
        const { data } = await profileApi.put(`/educations/${editingEducationId}`, newFormation)
        const updatedEducation = data?.education

        if (updatedEducation) {
          setEducations((current) =>
            current.map((education) =>
              education.id === editingEducationId ? updatedEducation : education
            )
          )
        }
      } else {
        const { data } = await profileApi.post('/educations', newFormation)
        const education = data?.education

        if (education) {
          setEducations((current) => [education, ...current])
        }
      }

      setNewFormation({ title: '', school: '', period: '' })
      setEditingEducationId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save education.')
    }
  }

  const editEducation = (education) => {
    setEditingEducationId(education.id)
    setNewFormation({
      title: education.title || '',
      school: education.school || '',
      period: education.period || ''
    })
  }

  const deleteEducation = async (educationId) => {
    try {
      setError('')
      await profileApi.delete(`/educations/${educationId}`)
      setEducations((current) =>
        current.filter((education) => education.id !== educationId)
      )
      if (editingEducationId === educationId) {
        setNewFormation({ title: '', school: '', period: '' })
        setEditingEducationId(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete education.')
    }
  }

  const submitSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return

    try {
      setError('')
      if (editingSkillId) {
        const { data } = await profileApi.put(`/skills/${editingSkillId}`, {
          name: newSkill
        })
        const updatedSkill = data?.skill

        if (updatedSkill) {
          setSkills((current) =>
            current.map((skill) =>
              skill.id === editingSkillId ? updatedSkill : skill
            )
          )
        }
      } else {
        const { data } = await profileApi.post('/skills', { name: newSkill })
        const skill = data?.skill

        if (skill) {
          setSkills((current) => [skill, ...current])
        }
      }

      setNewSkill('')
      setEditingSkillId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill.')
    }
  }

  const editSkill = (skill) => {
    setEditingSkillId(skill.id)
    setNewSkill(skill.name || '')
  }

  const deleteSkill = async (skillId) => {
    try {
      setError('')
      await profileApi.delete(`/skills/${skillId}`)
      setSkills((current) => current.filter((skill) => skill.id !== skillId))
      if (editingSkillId === skillId) {
        setNewSkill('')
        setEditingSkillId(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete skill.')
    }
  }

  const submitLanguage = async (e) => {
    e.preventDefault()
    if (!newLanguage.name.trim()) return

    try {
      setError('')
      if (editingLanguageId) {
        const { data } = await profileApi.put(`/languages/${editingLanguageId}`, newLanguage)
        const updatedLanguage = data?.language

        if (updatedLanguage) {
          setLanguages((current) =>
            current.map((language) =>
              language.id === editingLanguageId ? updatedLanguage : language
            )
          )
        }
      } else {
        const { data } = await profileApi.post('/languages', newLanguage)
        const language = data?.language

        if (language) {
          setLanguages((current) => [language, ...current])
        }
      }

      setNewLanguage({ name: '', level: '' })
      setEditingLanguageId(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save language.')
    }
  }

  const editLanguage = (language) => {
    setEditingLanguageId(language.id)
    setNewLanguage({
      name: language.name || '',
      level: language.level || ''
    })
  }

  const deleteLanguage = async (languageId) => {
    try {
      setError('')
      await profileApi.delete(`/languages/${languageId}`)
      setLanguages((current) =>
        current.filter((language) => language.id !== languageId)
      )
      if (editingLanguageId === languageId) {
        setNewLanguage({ name: '', level: '' })
        setEditingLanguageId(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete language.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {isAdmin && (
        <div className="card text-sm text-slate-600">
          This section is reserved for simple users. Admins manage profiles from the profile page.
        </div>
      )}
      {!isAdmin && (
      <>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">Experience</div>
          <h1 className="text-3xl font-semibold text-slate-900">Add your impact</h1>
          <p className="text-slate-500">Quantify outcomes; the generator will reuse them.</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl shadow-soft hover:shadow-lg transition"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      {error && <div className="card mt-4 text-sm text-red-500">{error}</div>}

      <div className="lg:col-span-2 space-y-3 mt-6">
        {loading && (
          <div className="card text-slate-500 text-sm">Loading experiences...</div>
        )}
        {!loading && experiences.length === 0 && (
          <div className="card text-slate-500 text-sm">
            No experiences yet. Click "Add Experience" to get started.
          </div>
        )}
        {!loading &&
          experiences.map((exp) => (
            <motion.div
              key={exp.id}
              whileHover={{ y: -2 }}
              className="card flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{exp.jobTitle}</p>
                  <p className="text-sm text-slate-500">
                    {exp.company} - {[exp.startDate, exp.endDate].filter(Boolean).join(' to ') || 'Add timeframe'}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    {exp.description || 'Add a short summary.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(exp.skills && exp.skills.length ? exp.skills : ['Impact', 'Teamwork']).map((skill) => (
                      <span key={skill} className="pill bg-primary/10 text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(exp)}
                  className="h-9 w-9 rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 transition"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteExp(exp.id)}
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
            {educations.map((formation) => (
              <div key={formation.id} className="p-3 rounded-lg border border-slate-100 bg-white/60">
                <p className="font-semibold text-slate-900">{formation.title}</p>
                <p className="text-sm text-slate-500">{formation.school}</p>
                <p className="text-xs text-slate-400">{formation.period}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => editEducation(formation)}
                    className="text-xs text-primary font-semibold"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEducation(formation.id)}
                    className="text-xs text-red-500 font-semibold"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {educations.length === 0 && <p className="text-sm text-slate-500">No formations yet.</p>}
          </div>
          <form className="space-y-2" onSubmit={submitEducation}>
            <FormInput label="Title" value={newFormation.title} onChange={(e) => setNewFormation((current) => ({ ...current, title: e.target.value }))} />
            <FormInput label="School" value={newFormation.school} onChange={(e) => setNewFormation((current) => ({ ...current, school: e.target.value }))} />
            <FormInput label="Period" value={newFormation.period} onChange={(e) => setNewFormation((current) => ({ ...current, period: e.target.value }))} />
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-primary text-white py-2 rounded-xl shadow-soft" type="submit">
              {editingEducationId ? 'Update formation' : 'Add formation'}
            </motion.button>
          </form>
        </div>

        <div className="card glass space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => editSkill(skill)}
                className="pill hover:border-primary/40"
                type="button"
              >
                {skill.name}
              </button>
            ))}
            {skills.length === 0 && <p className="text-sm text-slate-500">No skills yet.</p>}
          </div>
          <form className="flex gap-2" onSubmit={submitSkill}>
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="Add a skill"
            />
            {editingSkillId && (
              <button
                className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl"
                type="button"
                onClick={() => {
                  setNewSkill('')
                  setEditingSkillId(null)
                }}
              >
                Cancel
              </button>
            )}
            <button className="px-3 py-2 bg-primary text-white rounded-xl shadow-soft" type="submit">
              {editingSkillId ? 'Update' : 'Add'}
            </button>
          </form>
          {skills.length > 0 && editingSkillId && (
            <button
              className="text-xs text-red-500 font-semibold"
              type="button"
              onClick={() => deleteSkill(editingSkillId)}
            >
              Delete current skill
            </button>
          )}
        </div>

        <div className="card glass space-y-3">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-primary" />
            <h3 className="text-lg font-semibold text-slate-900">Languages</h3>
          </div>
          <div className="space-y-2">
            {languages.map((language) => (
              <div key={language.id} className="p-3 rounded-lg border border-slate-100 bg-white/60 text-sm text-slate-700">
                {language.name}{language.level ? ` - ${language.level}` : ''}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => editLanguage(language)}
                    className="text-xs text-primary font-semibold"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLanguage(language.id)}
                    className="text-xs text-red-500 font-semibold"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {languages.length === 0 && <p className="text-sm text-slate-500">No languages yet.</p>}
          </div>
          <form className="space-y-2" onSubmit={submitLanguage}>
            <input
              value={newLanguage.name}
              onChange={(e) => setNewLanguage((current) => ({ ...current, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="Language"
            />
            <input
              value={newLanguage.level}
              onChange={(e) => setNewLanguage((current) => ({ ...current, level: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              placeholder="Level"
            />
            <div className="flex gap-2">
              {editingLanguageId && (
                <button
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl"
                  type="button"
                  onClick={() => {
                    setNewLanguage({ name: '', level: '' })
                    setEditingLanguageId(null)
                  }}
                >
                  Cancel
                </button>
              )}
              <button className="px-3 py-2 bg-primary text-white rounded-xl shadow-soft" type="submit">
                {editingLanguageId ? 'Update' : 'Add'}
              </button>
            </div>
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
                  <p className="pill mb-1">{editingId ? 'Edit' : 'Add'} experience</p>
                  <h3 className="text-lg font-semibold text-slate-900">Share your impact</h3>
                </div>
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}>X</button>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <FormInput
                  label="Job title"
                  value={form.jobTitle}
                  onChange={(e) => setForm((current) => ({ ...current, jobTitle: e.target.value }))}
                  placeholder="e.g. Frontend Engineer"
                  required
                />
                <FormInput
                  label="Company"
                  value={form.company}
                  onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))}
                  placeholder="e.g. SmartApply"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Start date"
                    value={form.startDate}
                    onChange={(e) => setForm((current) => ({ ...current, startDate: e.target.value }))}
                    placeholder="2024"
                  />
                  <FormInput
                    label="End date"
                    value={form.endDate}
                    onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))}
                    placeholder="Present"
                  />
                </div>
                <FormInput
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="Highlight measurable impact"
                  helper="Keep it concise and numbers-first."
                />
                <FormInput
                  label="Skills (comma separated)"
                  value={form.skills}
                  onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))}
                  placeholder="React, UX Writing"
                />
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                      setShowForm(false)
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"
                    disabled={!form.jobTitle || !form.company}
                  >
                    {editingId ? 'Update' : 'Save'} experience
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </motion.div>
  )
}
