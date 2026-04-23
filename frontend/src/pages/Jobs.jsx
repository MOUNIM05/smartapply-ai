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
const INTEREST_STORAGE_KEY = 'smartapply:job-interests'
const INTEREST_OPTIONS = [
  { id: 'dev', label: 'Dev' },
  { id: 'data', label: 'Data' },
  { id: 'design', label: 'Design' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'product', label: 'Product' },
  { id: 'qa', label: 'QA' }
]

const readInitialInterests = () => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(INTEREST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const allowed = new Set(INTEREST_OPTIONS.map((item) => item.id))
    return parsed.map((item) => String(item || '').trim().toLowerCase()).filter((item) => allowed.has(item))
  } catch {
    return []
  }
}

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
  let matchedSkills = skillNames.filter((skill) => jobText.toLowerCase().includes(skill.toLowerCase()))
  const profileTokens = new Set(tokenize([profile?.professional_title, profile?.summary, profile?.address, skillNames.join(' ')].join(' ')))
  const missingKeywords = [...new Set(tokenize(jobText))].filter((token) => !profileTokens.has(token)).slice(0, 5)
  let score = 36 + matchedSkills.length * 12 + (profile?.summary ? 8 : 0)
  if (profile?.professional_title && job?.jobTitle?.toLowerCase().includes(profile.professional_title.toLowerCase())) score += 16
  if (profile?.address && job?.location && profile.address.toLowerCase().includes(job.location.toLowerCase())) score += 8
  score = Math.max(24, Math.min(score, 96))

  if (job?.recommendation && typeof job.recommendation.score === 'number') {
    score = Math.max(24, Math.min(Number(job.recommendation.score) || 0, 96))
    if (Array.isArray(job.recommendation.matchedSkills) && job.recommendation.matchedSkills.length) {
      matchedSkills = job.recommendation.matchedSkills
    }
  }

  const backendReasons = Array.isArray(job?.recommendation?.reasons)
    ? job.recommendation.reasons.filter(Boolean).slice(0, 3)
    : []

  return {
    score,
    matchedSkills,
    missingKeywords,
    advice: backendReasons.length ? backendReasons : [
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
  const [selectedInterests, setSelectedInterests] = useState(readInitialInterests)
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
    if (isAdmin || typeof window === 'undefined') return

    try {
      window.localStorage.setItem(INTEREST_STORAGE_KEY, JSON.stringify(selectedInterests))
    } catch {
      // Ignore storage errors in restricted browser contexts.
    }
  }, [isAdmin, selectedInterests])

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true)
        setError('')
        const jobsResponse = await jobApi.get('/job-offers', {
          params: isAdmin
            ? {}
            : {
                recommended: true,
                interests: selectedInterests.join(',')
              }
        })
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
  }, [isAdmin, selectedInterests])

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

  const toggleInterest = (interestId) => {
    setSelectedInterests((current) =>
      current.includes(interestId)
        ? current.filter((item) => item !== interestId)
        : [...current, interestId]
    )
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <section className="rounded-[1.5rem] border border-white/10 bg-[#080b13] p-4 md:p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="pill mb-2">Jobs</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{isAdmin ? 'Manage job offers' : 'Find jobs'}</h1>
            <p className="text-sm text-slate-300 mt-1">
              {isAdmin
                ? 'Create and review offers.'
                : 'Browse offers in a list and open each job detail on the right.'}
            </p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.45)]"
            >
              <Plus size={16} />
              Add offer
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_auto]">
          <label className="rounded-2xl border border-white/15 bg-[#0f1320] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">What</p>
            <div className="mt-2 flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <input
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleApplyFilters()}
                placeholder="Job title, keyword or company"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>
          <label className="rounded-2xl border border-white/15 bg-[#0f1320] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Where</p>
            <div className="mt-2 flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleApplyFilters()}
                placeholder="City or remote"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.45)]"
          >
            Find jobs
          </button>
        </div>

        {!isAdmin && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-[0.16em]">Interests</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const active = selectedInterests.includes(interest.id)
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-[#0f1320] text-slate-300 border-white/10 hover:border-primary/60'
                    }`}
                  >
                    {interest.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {error && <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[410px_1fr] items-start">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#070a11] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-white">{filteredJobs.length}</span> jobs found
            </p>
            {!isAdmin && (
              <p className="text-xs text-slate-400">
                Top match <span className="text-white font-semibold">{insights.score}%</span>
              </p>
            )}
          </div>

          <div className="p-3 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {loading && (
              <div className="rounded-xl border border-white/10 bg-[#101420] px-3 py-4 text-sm text-slate-300">
                Loading jobs...
              </div>
            )}
            {!loading && filteredJobs.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-[#101420] px-3 py-4 text-sm text-slate-300">
                No jobs match your search.
              </div>
            )}

            {filteredJobs.map((job) => {
              const isActive = selectedJob?.id === job.id
              const jobInsights = getJobInsights(job, profile, skills)
              const snippet = String(job.description || '').trim()
              const shortDescription = snippet.length > 150 ? `${snippet.slice(0, 150)}...` : snippet

              return (
                <motion.button
                  key={job.id}
                  type="button"
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedId(job.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? 'border-primary bg-[#151027] shadow-[0_0_0_1px_rgba(124,58,237,0.5)]'
                      : 'border-white/10 bg-[#0f1320] hover:bg-[#141a2a]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-white leading-tight">{job.jobTitle}</h3>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">
                      {jobInsights.score}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 mt-1">{job.company}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{job.location || 'Remote'}</span>
                    <span>-</span>
                    <span>{job.employmentType || 'Open type'}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{shortDescription || 'No description provided.'}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(job?.recommendation?.matchedInterests || []).slice(0, 2).map((interest) => (
                      <span key={interest} className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-semibold text-primary capitalize">
                        {interest}
                      </span>
                    ))}
                    {!job?.recommendation?.matchedInterests?.length && (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">Suggested</span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-white/10 bg-[#070a11] p-5 md:p-6 xl:sticky xl:top-4 min-h-[28rem]">
          {selectedJob ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{selectedJob.jobTitle}</h2>
                  <p className="mt-2 text-base font-medium text-slate-200">{selectedJob.company}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1"><MapPin size={14} />{selectedJob.location || 'Remote'}</span>
                    <span>-</span>
                    <span>{selectedJob.employmentType || 'Open type'}</span>
                  </div>
                </div>

                {!isAdmin && (
                  <button
                    type="button"
                    onClick={openApplyModal}
                    disabled={!profileId}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(124,58,237,0.45)] disabled:opacity-60"
                  >
                    <Send size={15} />
                    Apply now
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#111624] px-3 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.12em]">Profile fit</p>
                  <p className="text-xl font-bold text-white mt-1">{insights.score}%</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#111624] px-3 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.12em]">Matched skills</p>
                  <p className="text-xl font-bold text-white mt-1">{insights.matchedSkills.length}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#111624] px-3 py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.12em]">Missing terms</p>
                  <p className="text-xl font-bold text-white mt-1">{insights.missingKeywords.length}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0f1320] px-4 py-4">
                <h3 className="text-base font-semibold text-white mb-2">Job description</h3>
                <p className="text-sm leading-7 text-slate-300">
                  {selectedJob.description || 'No detailed description yet.'}
                </p>
              </div>

              {!isAdmin && (
                <>
                  <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-4">
                    <p className="text-sm font-semibold text-violet-200 mb-2">Application advice</p>
                    <div className="space-y-2">
                      {insights.advice.map((item) => (
                        <p key={item} className="text-sm text-violet-100">- {item}</p>
                      ))}
                    </div>
                  </div>

                  {insights.missingKeywords.length > 0 && (
                    <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-4">
                      <p className="text-sm font-semibold text-amber-200 mb-2">Keywords you can mention</p>
                      <div className="flex flex-wrap gap-2">
                        {insights.missingKeywords.map((keyword) => (
                          <span key={keyword} className="rounded-full border border-amber-200/40 bg-[#111624] px-3 py-1 text-xs font-medium text-amber-100">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-300">Select a job to display details.</div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop-solid z-40 flex items-center justify-center px-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }} className="modal-surface-solid rounded-3xl shadow-soft p-6 w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 modal-backdrop-solid z-50 flex items-center justify-center px-4 py-6" onClick={() => setShowApplyModal(false)}>
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }} className="modal-surface-solid rounded-[2rem] shadow-soft w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
              <form onSubmit={applyToJob} className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div><div className="pill mb-2">Apply now</div><h3 className="text-2xl font-semibold text-slate-900">{selectedJob.jobTitle}</h3><p className="text-slate-500 mt-1">{selectedJob.company} - {selectedJob.location || 'Remote'} - {selectedJob.employmentType || 'Open type'}</p></div>
                  <button type="button" className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50" onClick={() => setShowApplyModal(false)}><X size={18} /></button>
                </div>

                <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-5">
                  <div className="rounded-3xl modal-subpanel-solid text-white p-5 space-y-4">
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
