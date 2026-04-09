import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Star, Send, Plus } from 'lucide-react'
import FormInput from '../components/FormInput'
import { getCurrentUserRole, jobApi, profileApi } from '../services/api'

export default function Jobs() {
  const isAdmin = getCurrentUserRole() === 'admin'
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ jobTitle: '', company: '', location: '', employmentType: '' })
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileId, setProfileId] = useState('')

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsResponse = await jobApi.get('/job-offers')
        const data = jobsResponse.data
        const items = data?.jobOffers || []
        setJobs(items)
        setSelected(items[0] || null)

        if (!isAdmin) {
          try {
            const profileResponse = await profileApi.get('/profiles/me')
            setProfileId(profileResponse.data?.profile?.id || '')
          } catch (err) {
            if (err.response?.status !== 404) {
              throw err
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [isAdmin])

  const applyToJob = async () => {
    if (!selected || !profileId) {
      setError('Create your profile before applying to a job.')
      return
    }

    try {
      setApplying(true)
      setError('')
      setSuccess('')

      await jobApi.post('/applications', {
        profileId,
        jobOfferId: selected.id,
        status: 'submitted'
      })

      setSuccess('Application saved successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for this job.')
    } finally {
      setApplying(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.jobTitle || !form.company) return

    try {
      const { data } = await jobApi.post('/job-offers', form)
      const newJob = data?.jobOffer
      if (newJob) {
        setJobs((current) => [newJob, ...current])
        setSelected(newJob)
      }
      setShowForm(false)
      setForm({ jobTitle: '', company: '', location: '', employmentType: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job offer.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">Job offers</div>
          <h1 className="text-3xl font-semibold text-slate-900">Curate your pipeline</h1>
          <p className="text-slate-500">Keep your opportunities synchronized with the backend.</p>
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
          {loading && <div className="card text-sm text-slate-500">Loading jobs...</div>}
          {!loading && jobs.length === 0 && <div className="card text-sm text-slate-500">No jobs yet.</div>}
          {error && <div className="card text-sm text-red-500">{error}</div>}
          {success && <div className="card text-sm text-green-600">{success}</div>}

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
                    <p className="text-lg font-semibold text-slate-900">{job.jobTitle}</p>
                    <p className="text-sm text-slate-500">
                      {job.company} - {job.location || 'Remote'} - {job.employmentType || 'Any'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="pill">Tracked</span>
                </div>
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
              <p className="text-xl font-semibold text-slate-900">{selected?.jobTitle || 'None'}</p>
              <p className="text-sm text-slate-500">{selected?.company}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            SmartApply will tailor your CV and cover letter toward this role. Switch roles anytime to
            refresh your materials.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={applyToJob}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-soft hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              disabled={!selected || applying || isAdmin}
            >
              <Send size={16} />
              {isAdmin ? 'Admin account' : applying ? 'Applying...' : 'Apply now'}
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
                <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}>X</button>
              </div>
              <form className="space-y-3" onSubmit={submit}>
                <FormInput label="Job title" value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} required />
                <FormInput label="Company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Remote / Hybrid" />
                  <FormInput label="Employment type" value={form.employmentType} onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))} placeholder="Full-time" />
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
                    disabled={!form.jobTitle || !form.company}
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
