import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Copy, Download, FileText } from 'lucide-react'
import { aiApi, documentApi, getCurrentUser } from '../services/api'

export default function GenerateCV() {
  const currentUser = getCurrentUser()
  const [input, setInput] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
        template,
        jobContext: jd,
        source: 'frontend-generate-page'
      }
    })

    return data?.response?.rawOutput || ''
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
      const aiOutput = await generateDraftWithAI()
      setResult(aiOutput)
      setGenerated(true)

      if (action === 'cv') {
        await createPdfDocument('/api/documents/cv', {
          title: `CV - ${jd || 'Candidate'} - ${template}`,
          fullName: [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' '),
          email: currentUser?.email || '',
          summary: aiOutput || input,
          skills: input
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean),
          targetPosition: jd,
          jobDescription: input
        }, 'cv')
      } else if (action === 'motivation') {
        await createPdfDocument('/api/documents/motivation-letter', {
          title: `Motivation Letter - ${jd || 'Opportunity'}`,
          position: jd,
          recipientCompany: jd,
          body: aiOutput || input,
          background: input,
          signature: buildSignature()
        }, 'motivation-letter')
      } else if (action === 'email') {
        await createPdfDocument('/api/documents/email', {
          title: `Application Email - ${jd || 'Opportunity'}`,
          subject: `Application for ${jd || 'your opportunity'}`,
          position: jd,
          intro: input,
          body: aiOutput || input,
          signature: buildSignature()
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
        <div className="flex items-center gap-3">
          <div className="pill bg-accent/10 text-accent border border-accent/40">AI service</div>
          <div className="pill">Saved in backend</div>
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
        <h3 className="text-lg font-semibold text-slate-900 mb-3">CV Templates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.02 }}
              onClick={() => setTemplate(item)}
              className={`p-4 rounded-xl border text-sm font-semibold transition ${
                template === item ? 'border-primary bg-primary/10 text-primary shadow-soft' : 'border-slate-200 bg-white hover:border-primary/40'
              }`}
            >
              {item}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Selected template: {template}</p>
      </div>
    </motion.div>
  )
}
