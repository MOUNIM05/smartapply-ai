// Renders the Generate CV page and coordinates its UI state.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Copy, Download, FileText } from 'lucide-react'
import { aiApi, documentApi, getCurrentUser, profileApi } from '../services/api'

const templateOptionsByAction = {
  cv: [{ id: 'cv-modern-sidebar', label: 'CV Sidebar Pro' }],
  motivation: [{ id: 'motivation-formal', label: 'Formal Motivation Letter' }],
  email: [{ id: 'email-prime', label: 'Prime Email' }],
  improve: [{ id: 'smart-improve', label: 'Smart Improve' }],
  adapt: [{ id: 'smart-adapt', label: 'Job Adaptation' }]
}

export default function GenerateCV() {
  const currentUser = getCurrentUser()
  const [input, setInput] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState('cv')
  const [template, setTemplate] = useState('cv-modern-sidebar')
  const [generated, setGenerated] = useState(false)
  const [profileData, setProfileData] = useState({
    profile: null,
    experiences: [],
    educations: [],
    skills: [],
    languages: []
  })

  const actions = [
    { id: 'cv', label: 'Generate CV' },
    { id: 'motivation', label: 'Generate Motivation Letter' },
    { id: 'email', label: 'Generate Email' },
    { id: 'improve', label: 'Improve Content' },
    { id: 'adapt', label: 'Adapt to Job Offer' }
  ]

  useEffect(() => {
    const nextTemplate = templateOptionsByAction[action]?.[0]?.id || 'smart-improve'
    setTemplate(nextTemplate)
  }, [action])

  useEffect(() => {
    const loadProfileContext = async () => {
      try {
        const [profileResponse, experiencesResponse, educationsResponse, skillsResponse, languagesResponse] =
          await Promise.all([
            profileApi.get('/profiles/me').catch(() => ({ data: { profile: null } })),
            profileApi.get('/experiences/me').catch(() => ({ data: { experiences: [] } })),
            profileApi.get('/educations/me').catch(() => ({ data: { educations: [] } })),
            profileApi.get('/skills/me').catch(() => ({ data: { skills: [] } })),
            profileApi.get('/languages/me').catch(() => ({ data: { languages: [] } }))
          ])

        setProfileData({
          profile: profileResponse.data?.profile || null,
          experiences: experiencesResponse.data?.experiences || [],
          educations: educationsResponse.data?.educations || [],
          skills: skillsResponse.data?.skills || [],
          languages: languagesResponse.data?.languages || []
        })
      } catch {
        setProfileData({
          profile: null,
          experiences: [],
          educations: [],
          skills: [],
          languages: []
        })
      }
    }

    loadProfileContext()
  }, [])

  const requestType = useMemo(() => {
    const map = {
      cv: 'cv_generation',
      motivation: 'motivation_letter',
      email: 'application_email',
      improve: 'other',
      adapt: 'job_adaptation'
    }

    return map[action] || 'other'
  }, [action])
  const availableTemplates = templateOptionsByAction[action] || templateOptionsByAction.improve

  const profileSnapshot = useMemo(() => ({
    fullName: [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' '),
    professionalTitle: profileData.profile?.professional_title || '',
    email: currentUser?.email || '',
    phone: profileData.profile?.phone || '',
    address: profileData.profile?.address || currentUser?.address || '',
    summary: profileData.profile?.summary || '',
    skills: profileData.skills.map((item) => item.name),
    languages: profileData.languages.map((item) => `${item.name}${item.level ? ` - ${item.level}` : ''}`),
    experience: profileData.experiences.map((item) => ({
      title: item.jobTitle || item.title || '',
      company: item.company || '',
      dateRange: [item.startDate, item.endDate].filter(Boolean).join(' - '),
      bullets: [item.description, ...(Array.isArray(item.skills) ? item.skills : [])].filter(Boolean)
    })),
    education: profileData.educations.map((item) => ({
      title: item.degree || item.title || '',
      subtitle: item.institution || item.school || '',
      dateRange: [item.startDate, item.endDate].filter(Boolean).join(' - '),
      bullets: [item.description].filter(Boolean)
    }))
  }), [currentUser, profileData])

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const buildSignature = () => {
    const fullName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ')
    return fullName || currentUser?.email || 'SmartApply AI User'
  }

  const generateDraftWithAI = async () => {
    const prompt = [jd, input].filter(Boolean).join('\n\n')
    const { data } = await aiApi.post('/ai-requests', {
      prompt,
      requestType,
      contextData: {
        templateKey: template,
        jobContext: jd,
        source: 'frontend-generate-page',
        profileSnapshot,
        outputLanguage: 'fr'
      }
    })

    return {
      rawOutput: data?.response?.rawOutput || '',
      structuredOutput: data?.response?.structuredOutput || {}
    }
  }

  const createPdfDocument = async (endpoint, payload, filenamePrefix) => {
    const response = await documentApi.post(endpoint, payload, {
      responseType: 'blob'
    })

    const documentId = response.headers['x-document-id'] || 'generated'
    downloadBlob(response.data, `${filenamePrefix}-${documentId}.pdf`)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setGenerated(false)
    setError('')

    try {
      const aiGeneration = await generateDraftWithAI()
      const aiOutput = aiGeneration.rawOutput
      const structured = aiGeneration.structuredOutput || {}
      setResult(aiOutput)
      setGenerated(true)

      if (action === 'cv') {
        await createPdfDocument('/api/documents/cv', {
          title: `CV - ${jd || 'Candidate'} - ${template}`,
          fullName: profileSnapshot.fullName,
          email: currentUser?.email || '',
          phone: profileSnapshot.phone,
          address: profileSnapshot.address,
          headline: structured.headline || profileSnapshot.professionalTitle || jd,
          summary: structured.summary || profileSnapshot.summary || aiOutput || input,
          skills: structured.skills?.length ? structured.skills : profileSnapshot.skills,
          languages: structured.languages?.length ? structured.languages : profileSnapshot.languages,
          experience: structured.experience?.length ? structured.experience : profileSnapshot.experience,
          education: structured.education?.length ? structured.education : profileSnapshot.education,
          projects: structured.projects?.length ? structured.projects : [],
          hobbies: structured.hobbies?.length ? structured.hobbies : [],
          targetPosition: jd,
          jobDescription: input,
          templateKey: template,
          ownerUserId: currentUser?.id
        }, 'cv')
      } else if (action === 'motivation') {
        await createPdfDocument('/api/documents/motivation-letter', {
          title: `Motivation Letter - ${jd || 'Opportunity'}`,
          position: jd,
          recipientCompany: structured.recipientCompany || jd,
          recipientName: structured.recipientName || 'Hiring Manager',
          recipientRole: structured.recipientRole || '',
          recipientAddress: structured.recipientAddress || '',
          date: structured.date,
          greeting: structured.greeting,
          openingParagraph: structured.openingParagraph,
          bodyParagraphs: structured.bodyParagraphs || [aiOutput || input],
          closingParagraph: structured.closingParagraph,
          senderName: profileSnapshot.fullName,
          senderHeadline: profileSnapshot.professionalTitle,
          senderEmail: profileSnapshot.email,
          signatureName: structured.signatureName || buildSignature(),
          signatureEmail: structured.signatureEmail || currentUser?.email || '',
          templateKey: template,
          ownerUserId: currentUser?.id
        }, 'motivation-letter')
      } else if (action === 'email') {
        await createPdfDocument('/api/documents/email', {
          title: `Application Email - ${jd || 'Opportunity'}`,
          subject: structured.subject || `Application for ${jd || 'your opportunity'}`,
          position: jd,
          recipientName: structured.recipientName || 'Hiring Team',
          greeting: structured.greeting,
          intro: structured.intro || input,
          bodyParagraphs: structured.bodyParagraphs || [aiOutput || input],
          callToAction: structured.callToAction,
          closing: structured.closing,
          signatureName: structured.signatureName || buildSignature(),
          signatureTitle: structured.signatureTitle || profileSnapshot.professionalTitle,
          signatureEmail: structured.signatureEmail || currentUser?.email || '',
          templateKey: template,
          ownerUserId: currentUser?.id
        }, 'application-email')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate content.')
      setResult('')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
  }

  const handleDownload = () => {
    if (!result) return

    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${requestType}-${template}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">AI Generator</div>
          <h1 className="text-3xl font-semibold text-slate-900">Craft tailored materials</h1>
          <p className="text-slate-500">Paste a job description or bullet points. SmartApply does the rest.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Input</h3>
            <span className="text-xs text-slate-500">Job description or context</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {actions.map((item) => (
              <button
                key={item.id}
                onClick={() => setAction(item.id)}
                className={`px-3 py-2 rounded-xl text-sm border transition ${
                  action === item.id ? 'bg-primary text-white border-primary' : 'border-slate-200 text-slate-600 hover:border-primary/40'
                }`}
              >
                {item.label}
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
            {loading ? 'Generating...' : 'Generate with AI'}
          </motion.button>

          {!input && !jd && <p className="text-xs text-slate-500">Add some context to enable generation.</p>}

          {generated && !loading && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-primary flex items-center gap-2">
              <Sparkles size={14} /> Result ready and stored in ai_service.
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
                <button onClick={handleCopy} className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition disabled:opacity-50" disabled={!result}>
                  <Copy size={16} />
                </button>
                <button onClick={handleDownload} className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition disabled:opacity-50" disabled={!result}>
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
                    Generating...
                  </div>
                </motion.div>
              )}

              {loading && (
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <Loader2 className="animate-spin" size={16} />
                  Generating a tailored draft...
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
                  <FileText size={16} /> Waiting for your prompt...
                </div>
              )}
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
          </div>
        </motion.div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Document Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableTemplates.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setTemplate(item.id)}
              className={`p-4 rounded-xl border text-sm font-semibold transition ${
                template === item.id ? 'border-primary bg-primary/10 text-primary shadow-soft' : 'border-slate-200 bg-white hover:border-primary/40'
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Selected template: {template}</p>
      </div>
    </motion.div>
  )
}
