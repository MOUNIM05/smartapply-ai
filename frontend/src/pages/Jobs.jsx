// Renders the Jobs page and coordinates its UI state.
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BriefcaseBusiness, Building2, CheckCircle2, FileText, MapPin, MessageSquareText, Plus, Search, Send, Sparkles, Upload, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { getCurrentUserRole, jobApi, profileApi } from '../services/api'

const stopWords = new Set(['with', 'that', 'from', 'this', 'your', 'pour', 'dans', 'avec', 'chez', 'vous', 'nous', 'their', 'full', 'time', 'stage', 'emploi', 'poste', 'job', 'role', 'company', 'remote', 'hybrid'])
const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const tokenize = (value) => normalizeText(value).split(/[^a-zA-Z0-9+#.]+/).map((item) => item.trim()).filter((item) => item.length > 2 && !stopWords.has(item))
const MAX_PDF_SIZE = 5 * 1024 * 1024

const isSubsequenceMatch = (needle, haystack) => {
  if (!needle) return true
  let index = 0

  for (const char of haystack) {
    if (char === needle[index]) {
      index += 1
      if (index === needle.length) {
        return true
      }
    }
  }

  return false
}

const matchesLooseText = (needle, haystack) => {
  if (!needle) return true

  const normalizedNeedle = normalizeText(needle.trim())
  const normalizedHaystack = normalizeText(haystack)

  if (!normalizedNeedle) return true
  if (normalizedHaystack.includes(normalizedNeedle)) return true

  const haystackTokens = tokenize(normalizedHaystack)
  const needleTokens = tokenize(normalizedNeedle)

  return needleTokens.every((token) =>
    haystackTokens.some((candidate) => candidate.includes(token) || isSubsequenceMatch(token, candidate))
  )
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Failed to read the selected PDF file.'))
    reader.readAsDataURL(file)
  })

const formatFileSize = (size) => {
  if (!size) return '0 KB'
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(size / 1024))} KB`
}

const getJobInsights = (job, profile, skills) => {
  const jobText = [job?.jobTitle, job?.company, job?.location, job?.employmentType, job?.description].join(' ')
  const skillNames = skills.map((skill) => skill.name)
  const matchedSkills = skillNames.filter((skill) => jobText.toLowerCase().includes(skill.toLowerCase()))
  const profileTokens = new Set(tokenize([profile?.professional_title, profile?.summary, profile?.address, skillNames.join(' ')].join(' ')))
  const missingKeywords = [...new Set(tokenize(jobText))].filter((token) => !profileTokens.has(token)).slice(0, 5)
  let score = 36 + matchedSkills.length * 12 + (profile?.summary ? 8 : 0)
  if (profile?.professional_title && job?.jobTitle?.toLowerCase().includes(profile.professional_title.toLowerCase())) score += 16
  if (profile?.address && job?.location && profile.address.toLowerCase().includes(job.location.toLowerCase())) score += 8
  score = Math.max(24, Math.min(score, 96))

  return {
    score,
    matchedSkills,
    missingKeywords,
    advice: [
      matchedSkills.length ? `Highlight ${matchedSkills.slice(0, 3).join(', ')} in the first part of your CV.` : 'Add 2 or 3 concrete strengths from your profile before submitting this application.',
      job?.description ? 'Mirror the job description vocabulary in your motivation letter to improve alignment.' : 'Add a short custom paragraph about why you want this role before submitting.',
      score >= 70 ? 'This role looks aligned with your current profile. Keep the documents concise and targeted.' : 'Strengthen your profile summary and job-specific achievements to improve the fit score.'
    ]
  }
}

export default function Jobs() {
  const isAdmin = getCurrentUserRole() === 'admin'
  const location = useLocation()
  const [jobs, setJobs] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [queryInput, setQueryInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [filters, setFilters] = useState({ query: '', location: '' })
  const [form, setForm] = useState({ jobTitle: '', company: '', location: '', employmentType: '', description: '' })
  const [applicationFiles, setApplicationFiles] = useState({ cvFile: null, motivationLetterFile: null })
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [submittingJob, setSubmittingJob] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileId, setProfileId] = useState('')
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setError('')
        const jobsResponse = await jobApi.get('/job-offers')
        const items = jobsResponse.data?.jobOffers || []
        setJobs(items)
        setSelectedId(items[0]?.id || null)

        if (!isAdmin) {
          const [profileResponse, skillsResponse] = await Promise.all([
            profileApi.get('/profiles/me').catch(() => ({ data: { profile: null } })),
            profileApi.get('/skills/me').catch(() => ({ data: { skills: [] } }))
          ])
          setProfileId(profileResponse.data?.profile?.id || '')
          setProfile(profileResponse.data?.profile || null)
          setSkills(skillsResponse.data?.skills || [])
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load jobs.')
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [isAdmin])

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const haystack = [job.jobTitle, job.company, job.description, job.employmentType].join(' ')
    const textMatch = matchesLooseText(filters.query, haystack)
    const locationMatch = matchesLooseText(filters.location, String(job.location || ''))
    return textMatch && locationMatch
  }), [jobs, filters])

  useEffect(() => {
    if (!filteredJobs.length) return setSelectedId(null)
    if (!filteredJobs.some((job) => job.id === selectedId)) setSelectedId(filteredJobs[0].id)
  }, [filteredJobs, selectedId])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const queryFromUrl = params.get('q') || ''
    const locationFromUrl = params.get('location') || ''

    setQueryInput(queryFromUrl)
    setLocationInput(locationFromUrl)
    setFilters({
      query: queryFromUrl.trim(),
      location: locationFromUrl.trim()
    })
  }, [location.search])

  const selectedJob = useMemo(() => filteredJobs.find((job) => job.id === selectedId) || filteredJobs[0] || null, [filteredJobs, selectedId])
  const insights = useMemo(() => getJobInsights(selectedJob, profile, skills), [selectedJob, profile, skills])

  const handleApplyFilters = () => {
    setFilters({
      query: queryInput.trim(),
      location: locationInput.trim()
    })
  }

  const handlePickPdf = async (event, field) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.')
      return
    }

    if (file.size > MAX_PDF_SIZE) {
      setError('Each PDF must be smaller than 5 MB.')
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      setApplicationFiles((current) => ({
        ...current,
        [field]: {
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl
        }
      }))
      setError('')
    } catch (fileError) {
      setError(fileError.message || 'Failed to prepare the selected PDF file.')
    }
  }

  const clearPickedPdf = (field) => {
    setApplicationFiles((current) => ({
      ...current,
      [field]: null
    }))
  }

  const openApplyModal = () => {
    if (!selectedJob || !profileId) {
      setError('Create your profile before applying to a job.')
      return
    }

    setApplicationFiles({
      cvFile: null,
      motivationLetterFile: null
    })
    setError('')
    setSuccess('')
    setShowApplyModal(true)
  }

  const applyToJob = async (event) => {
    event.preventDefault()
    if (!selectedJob || !profileId) {
      setError('Create your profile before applying to a job.')
      return
    }

    try {
      setApplying(true)
      setError('')
      setSuccess('')
      await jobApi.post('/applications', {
        profileId,
        jobOfferId: selectedJob.id,
        status: 'submitted',
        cvFile: applicationFiles.cvFile,
        motivationLetterFile: applicationFiles.motivationLetterFile
      })
      setSuccess('Application saved with your CV PDF and motivation letter PDF.')
      setShowApplyModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for this job.')
    } finally {
      setApplying(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.jobTitle || !form.company) return

    try {
      setSubmittingJob(true)
      setError('')
      const { data } = await jobApi.post('/job-offers', form)
      const newJob = data?.jobOffer
      if (newJob) {
        setJobs((current) => [newJob, ...current])
        setSelectedId(newJob.id)
      }
      setShowForm(false)
      setForm({ jobTitle: '', company: '', location: '', employmentType: '', description: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job offer.')
    } finally {
      setSubmittingJob(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-soft px-5 py-6 md:px-8 md:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,90,78,0.12),transparent_26%)]" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="pill mb-2">Job offers</div>
              <h1 className="text-3xl font-semibold text-slate-900">Find, review, and apply smarter</h1>
              <p className="text-slate-500 mt-1">Search opportunities, inspect the details, and submit each application with your CV and motivation letter.</p>
            </div>
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-2xl font-semibold shadow-soft hover:shadow-lg transition">
              <Plus size={16} />
              Add offer
            </button>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/90 backdrop-blur px-3 py-3 md:px-4 md:py-4 flex flex-col lg:flex-row gap-3 lg:items-center shadow-lg">
            <div className="flex items-center gap-3 flex-1 px-3">
              <Search size={22} className="text-slate-500" />
              <input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleApplyFilters()} placeholder="Job title, company, keywords..." className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-base" />
            </div>
            <div className="hidden lg:block w-px h-10 bg-slate-200" />
            <div className="flex items-center gap-3 flex-1 px-3">
              <MapPin size={22} className="text-slate-500" />
              <input value={locationInput} onChange={(event) => setLocationInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleApplyFilters()} placeholder="Location or remote" className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-base" />
            </div>
            <button type="button" onClick={handleApplyFilters} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-3 font-semibold shadow-soft">
              <Search size={16} />
              Search
            </button>
          </div>

          {!isAdmin && profile && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-900 text-white px-5 py-4"><p className="text-sm text-slate-300">Recommended fit</p><p className="text-3xl font-semibold mt-1">{insights.score}%</p><p className="text-sm text-slate-300 mt-2">Based on your profile, title, summary, and skills.</p></div>
              <div className="rounded-2xl bg-white border border-slate-100 px-5 py-4"><p className="text-sm text-slate-500">Matched skills</p><p className="text-xl font-semibold text-slate-900 mt-1">{insights.matchedSkills.length}</p><p className="text-sm text-slate-500 mt-2">{insights.matchedSkills.slice(0, 3).join(', ') || 'No exact skill match yet'}</p></div>
              <div className="rounded-2xl bg-white border border-slate-100 px-5 py-4"><p className="text-sm text-slate-500">Open opportunities</p><p className="text-xl font-semibold text-slate-900 mt-1">{filteredJobs.length}</p><p className="text-sm text-slate-500 mt-2">Filtered from your current search.</p></div>
            </div>
          )}
        </div>
      </section>

      {error && <div className="card text-sm text-red-500">{error}</div>}
      {success && <div className="card text-sm text-green-600">{success}</div>}

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr,1.05fr] gap-6 items-start">
        <div className="space-y-4">
          {loading && <div className="card text-sm text-slate-500">Loading jobs...</div>}
          {!loading && filteredJobs.length === 0 && <div className="card text-sm text-slate-500">No jobs match your current search.</div>}

          {filteredJobs.map((job) => {
            const isActive = selectedJob?.id === job.id
            const jobInsights = getJobInsights(job, profile, skills)

            return (
              <motion.button key={job.id} type="button" whileHover={{ y: -3 }} onClick={() => setSelectedId(job.id)} className={`w-full text-left card transition border ${isActive ? 'border-primary/60 shadow-lg shadow-primary/10' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pill">Recommended</span>
                      {jobInsights.score >= 70 && <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 px-3 py-1 text-xs font-medium">Strong fit</span>}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900 leading-tight">{job.jobTitle}</h3>
                      <p className="text-lg text-slate-600 mt-2">{job.company}</p>
                    </div>
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2"><MapPin size={16} /><span>{job.location || 'Remote / flexible'}</span></div>
                      <div className="flex items-center gap-2"><BriefcaseBusiness size={16} /><span>{job.employmentType || 'Open contract type'}</span></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">Match {jobInsights.score}%</span>
                      {jobInsights.matchedSkills.slice(0, 2).map((skill) => <span key={skill} className="inline-flex rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">{skill}</span>)}
                    </div>
                  </div>
                  {isActive && <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Sparkles size={20} /></div>}
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="card sticky top-4 overflow-hidden">
          {selectedJob ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900 leading-tight">{selectedJob.jobTitle}</h2>
                  <div className="space-y-2 mt-4 text-slate-600">
                    <div className="flex items-center gap-2"><Building2 size={16} /><span>{selectedJob.company}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={16} /><span>{selectedJob.location || 'Remote / flexible'}</span></div>
                    <div className="flex items-center gap-2"><BriefcaseBusiness size={16} /><span>{selectedJob.employmentType || 'Open contract type'}</span></div>
                  </div>
                </div>

                {!isAdmin && (
                  <button type="button" onClick={openApplyModal} disabled={!profileId} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-white px-5 py-3 font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60">
                    <Send size={16} />
                    Apply now
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4"><p className="text-sm text-slate-500">Profile fit</p><p className="text-3xl font-semibold text-slate-900 mt-2">{insights.score}%</p></div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4"><p className="text-sm text-slate-500">Matched skills</p><p className="text-3xl font-semibold text-slate-900 mt-2">{insights.matchedSkills.length}</p></div>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4"><p className="text-sm text-slate-500">Missing keywords</p><p className="text-3xl font-semibold text-slate-900 mt-2">{insights.missingKeywords.length}</p></div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-2xl font-semibold text-slate-900">Job details</h3>
                <p className="text-slate-600 leading-7 mt-3">{selectedJob.description || 'No detailed description yet. You can still prepare a custom CV and motivation letter for this opportunity.'}</p>
              </div>

              {!isAdmin && (
                <>
                  <div className="rounded-3xl bg-slate-900 text-white p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center"><Sparkles size={20} /></div>
                      <div><p className="text-sm text-slate-300">Application advice</p><p className="text-xl font-semibold">How to improve this application</p></div>
                    </div>
                    <div className="space-y-3">{insights.advice.map((item) => <div key={item} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-100">{item}</div>)}</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-5"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><FileText size={20} /></div><div><p className="font-semibold text-slate-900">Upload your CV PDF</p><p className="text-sm text-slate-500">You will attach it from your computer in the application modal.</p></div></div></div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-5"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center"><MessageSquareText size={20} /></div><div><p className="font-semibold text-slate-900">Upload your motivation letter PDF</p><p className="text-sm text-slate-500">Both files are stored with the submitted application.</p></div></div></div>
                  </div>

                  {insights.missingKeywords.length > 0 && <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5"><p className="text-sm font-semibold text-amber-700">Keywords to consider in your documents</p><div className="flex flex-wrap gap-2 mt-3">{insights.missingKeywords.map((keyword) => <span key={keyword} className="inline-flex rounded-full bg-white text-amber-700 px-3 py-1 text-sm font-medium border border-amber-200">{keyword}</span>)}</div></div>}
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Select a job to view the details.</div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }} className="bg-white rounded-3xl shadow-soft p-6 w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div><p className="pill mb-1">Add job</p><h3 className="text-xl font-semibold text-slate-900">Create a new job offer</h3></div>
                <button type="button" className="text-slate-500 hover:text-slate-700" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>

              <form className="space-y-4" onSubmit={submit}>
                <FormInput label="Job title" value={form.jobTitle} onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))} required />
                <FormInput label="Company" value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} required />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput label="Location" value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Remote / Hybrid / Casablanca" />
                  <FormInput label="Employment type" value={form.employmentType} onChange={(event) => setForm((current) => ({ ...current, employmentType: event.target.value }))} placeholder="Internship / Full-time" />
                </div>
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-slate-700">Description</span>
                  <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={7} className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30" placeholder="Paste the responsibilities, requirements, and what makes this role attractive." />
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60" disabled={submittingJob || !form.jobTitle || !form.company}>{submittingJob ? 'Saving...' : 'Add Job'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplyModal && selectedJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-6" onClick={() => setShowApplyModal(false)}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }} className="bg-white rounded-[2rem] shadow-soft w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
              <form onSubmit={applyToJob} className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div><div className="pill mb-2">Apply now</div><h3 className="text-2xl font-semibold text-slate-900">{selectedJob.jobTitle}</h3><p className="text-slate-500 mt-1">{selectedJob.company} - {selectedJob.location || 'Remote'} - {selectedJob.employmentType || 'Open type'}</p></div>
                  <button type="button" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
                </div>

                <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-5">
                  <div className="rounded-3xl bg-slate-900 text-white p-5 space-y-4">
                    <div className="flex items-center gap-3"><div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center"><CheckCircle2 size={20} /></div><div><p className="text-sm text-slate-300">Application checklist</p><p className="text-lg font-semibold">Before you submit</p></div></div>
                    <div className="space-y-3 text-sm text-slate-100">
                      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">Upload your final CV as a PDF file from your computer.</div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">Upload your motivation letter as a PDF file from your computer.</div>
                      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">Use the keywords below when they are truly relevant to your experience.</div>
                    </div>
                    {insights.missingKeywords.length > 0 && <div><p className="text-sm text-slate-300 mb-2">Suggested keywords</p><div className="flex flex-wrap gap-2">{insights.missingKeywords.map((keyword) => <span key={keyword} className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{keyword}</span>)}</div></div>}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-sm text-slate-700">CV PDF</span>
                      <input id="application-cv-pdf" type="file" accept="application/pdf" onChange={(event) => handlePickPdf(event, 'cvFile')} className="hidden" />
                      <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
                        <label htmlFor="application-cv-pdf" className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><Upload size={20} /></div>
                            <div>
                              <p className="font-semibold text-slate-900">{applicationFiles.cvFile ? applicationFiles.cvFile.fileName : 'Choose your CV PDF'}</p>
                              <p className="text-sm text-slate-500">{applicationFiles.cvFile ? formatFileSize(applicationFiles.cvFile.size) : 'PDF only, maximum 5 MB'}</p>
                            </div>
                          </div>
                          {applicationFiles.cvFile ? <button type="button" onClick={(event) => { event.preventDefault(); clearPickedPdf('cvFile') }} className="text-sm text-slate-500 hover:text-slate-800">Remove</button> : <span className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">Upload</span>}
                        </label>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-sm text-slate-700">Motivation letter PDF</span>
                      <input id="application-letter-pdf" type="file" accept="application/pdf" onChange={(event) => handlePickPdf(event, 'motivationLetterFile')} className="hidden" />
                      <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
                        <label htmlFor="application-letter-pdf" className="flex cursor-pointer items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center"><Upload size={20} /></div>
                            <div>
                              <p className="font-semibold text-slate-900">{applicationFiles.motivationLetterFile ? applicationFiles.motivationLetterFile.fileName : 'Choose your motivation letter PDF'}</p>
                              <p className="text-sm text-slate-500">{applicationFiles.motivationLetterFile ? formatFileSize(applicationFiles.motivationLetterFile.size) : 'PDF only, maximum 5 MB'}</p>
                            </div>
                          </div>
                          {applicationFiles.motivationLetterFile ? <button type="button" onClick={(event) => { event.preventDefault(); clearPickedPdf('motivationLetterFile') }} className="text-sm text-slate-500 hover:text-slate-800">Remove</button> : <span className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Upload</span>}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setShowApplyModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" disabled={applying || !applicationFiles.cvFile || !applicationFiles.motivationLetterFile} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"><Send size={16} />{applying ? 'Submitting...' : 'Submit application'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
