// Renders the Profile page and coordinates its UI state.
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Phone, MapPin, Save, CheckCircle2, Link as LinkIcon, Trash2, Plus, Eye, Pencil, Upload, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { aiApi, authApi, getAuthToken, getCurrentUser, getCurrentUserRole, setCurrentUser, profileApi } from '../services/api'

const container = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
}

const emptyProfile = {
  professional_title: '',
  summary: '',
  phone: '',
  address: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: ''
}

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const contentBase64 = result.includes(',') ? result.split(',').pop() : result
      resolve(contentBase64 || '')
    }
    reader.onerror = () => reject(new Error('Failed to read CV file.'))
    reader.readAsDataURL(file)
  })

const inferMimeType = (file) => {
  if (file.type) return file.type
  const name = String(file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (name.endsWith('.md')) return 'text/markdown'
  if (name.endsWith('.txt')) return 'text/plain'
  return 'application/octet-stream'
}

export default function Profile() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [cvImporting, setCvImporting] = useState(false)
  const [cvDeleting, setCvDeleting] = useState(false)
  const [cvImportMessage, setCvImportMessage] = useState('')
  const [storedCv, setStoredCv] = useState(null)
  const navigate = useNavigate()
  const role = getCurrentUserRole()
  const isAdmin = role === 'admin'
  const cvInputRef = useRef(null)

  const [form, setForm] = useState(emptyProfile)
  const [currentUser, setCurrentUserState] = useState(getCurrentUser())
  const [profiles, setProfiles] = useState([])
  const [users, setUsers] = useState([])
  const [adminForm, setAdminForm] = useState({ user_id: '', ...emptyProfile })
  const [adminDetailId, setAdminDetailId] = useState('')
  const [adminEditId, setAdminEditId] = useState('')
  const [adminEditForm, setAdminEditForm] = useState({
    first_name: '',
    last_name: '',
    professional_title: '',
    phone: '',
    address: '',
    role: 'user'
  })

  const loadAdminResources = async () => {
    const [profilesResponse, usersResponse] = await Promise.all([
      profileApi.get('/profiles'),
      authApi.get('/users')
    ])

    setProfiles(profilesResponse.data?.profiles || [])
    setUsers(usersResponse.data?.users || [])
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        if (isAdmin) {
          await loadAdminResources()
        } else {
          const [profileResponse, userResponse] = await Promise.all([
            profileApi.get('/profiles/me'),
            authApi.get('/users/me')
          ])

          if (profileResponse.data?.profile) {
            setForm({
              professional_title: profileResponse.data.profile.professional_title || '',
              summary: profileResponse.data.profile.summary || '',
              phone: profileResponse.data.profile.phone || '',
              address: profileResponse.data.profile.address || '',
              linkedin_url: profileResponse.data.profile.linkedin_url || '',
              github_url: profileResponse.data.profile.github_url || '',
              portfolio_url: profileResponse.data.profile.portfolio_url || ''
            })
            setStoredCv(profileResponse.data.profile.cv_upload || null)
          }

          if (userResponse.data?.user) {
            setCurrentUserState(userResponse.data.user)
            setCurrentUser(userResponse.data.user)
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load profile data.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAdmin, navigate])

  useEffect(() => {
    const handleUserChanged = (event) => {
      setCurrentUserState(event.detail || getCurrentUser())
    }

    window.addEventListener('smartapply:user-changed', handleUserChanged)
    return () => window.removeEventListener('smartapply:user-changed', handleUserChanged)
  }, [])

  const usersWithoutProfile = useMemo(
    () => users.filter((user) => !profiles.some((profile) => profile.user_id === user.id)),
    [profiles, users]
  )

  const submitProfile = async () => {
    setSaving(true)
    setError('')

    try {
      try {
        await profileApi.put('/profiles/me', form)
      } catch (err) {
        if (err.response?.status === 404) {
          await profileApi.post('/profiles', form)
        } else {
          throw err
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const submitAdminProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const { data } = await profileApi.post('/profiles/admin', adminForm)
      if (data?.profile) {
        setProfiles((current) => [data.profile, ...current])
      }
      setAdminForm({ user_id: '', ...emptyProfile })
      setShowAdminForm(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile.')
    } finally {
      setSaving(false)
    }
  }

  const deleteAdminProfile = async (profileId) => {
    try {
      setError('')
      await profileApi.delete(`/profiles/${profileId}`)
      setProfiles((current) => current.filter((profile) => profile.id !== profileId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile.')
    }
  }

  const resetAdminForm = () => {
    setAdminForm({ user_id: '', ...emptyProfile })
    setShowAdminForm(false)
  }

  const getProfileUserId = (profile) =>
    String(profile?.user_id?._id || profile?.user_id || profile?.user?.id || profile?.user?._id || '')

  const resolveProfileUser = (profile) => {
    if (!profile) return null
    const profileUserId = getProfileUserId(profile)
    return (
      users.find((user) => String(user.id || user._id) === profileUserId)
      || profile.user
      || null
    )
  }

  const handleToggleAdminDetails = (profileId) => {
    setAdminDetailId((current) => (current === profileId ? '' : profileId))
  }

  const openAdminEdit = (profile) => {
    const owner = resolveProfileUser(profile)
    const profileUserId = getProfileUserId(profile)
    setAdminEditId(profile.id)
    setAdminEditForm({
      first_name: owner?.first_name || '',
      last_name: owner?.last_name || '',
      professional_title: profile.professional_title || '',
      phone: profile.phone || '',
      address: profile.address || '',
      role: owner?.role || 'user'
    })
    if (!owner && !profileUserId) {
      setError("Impossible de retrouver l'utilisateur lie a ce profil.")
    }
  }

  const upsertMyProfile = async (payload) => {
    try {
      await profileApi.put('/profiles/me', payload)
    } catch (err) {
      if (err.response?.status === 404) {
        await profileApi.post('/profiles', payload)
      } else {
        throw err
      }
    }
  }

  const syncParsedCollections = async (parsedProfile) => {
    const [skillsResponse, languagesResponse, experiencesResponse, educationsResponse] = await Promise.all([
      profileApi.get('/skills/me').catch(() => ({ data: { skills: [] } })),
      profileApi.get('/languages/me').catch(() => ({ data: { languages: [] } })),
      profileApi.get('/experiences/me').catch(() => ({ data: { experiences: [] } })),
      profileApi.get('/educations/me').catch(() => ({ data: { educations: [] } }))
    ])

    const existingSkillSet = new Set((skillsResponse.data?.skills || []).map((item) => String(item.name || '').toLowerCase()))
    const existingLanguageSet = new Set((languagesResponse.data?.languages || []).map((item) => String(item.name || '').toLowerCase()))
    const existingExperienceSet = new Set(
      (experiencesResponse.data?.experiences || []).map((item) => `${String(item.jobTitle || '').toLowerCase()}|${String(item.company || '').toLowerCase()}`)
    )
    const existingEducationSet = new Set(
      (educationsResponse.data?.educations || []).map((item) => `${String(item.title || '').toLowerCase()}|${String(item.school || '').toLowerCase()}`)
    )

    const parsedSkills = Array.isArray(parsedProfile?.skills) ? parsedProfile.skills : []
    for (const rawName of parsedSkills) {
      const name = String(rawName || '').trim()
      const key = name.toLowerCase()
      if (!name || existingSkillSet.has(key)) continue
      try {
        await profileApi.post('/skills', { name })
        existingSkillSet.add(key)
      } catch {
        // Ignore individual row failures to keep import resilient.
      }
    }

    const parsedLanguages = Array.isArray(parsedProfile?.languages) ? parsedProfile.languages : []
    for (const rawLanguage of parsedLanguages) {
      const name = String(rawLanguage?.name || rawLanguage || '').trim()
      const level = String(rawLanguage?.level || '').trim()
      const key = name.toLowerCase()
      if (!name || existingLanguageSet.has(key)) continue
      try {
        await profileApi.post('/languages', { name, level })
        existingLanguageSet.add(key)
      } catch {
        // Ignore individual row failures to keep import resilient.
      }
    }

    const parsedExperiences = Array.isArray(parsedProfile?.experiences) ? parsedProfile.experiences : []
    for (const rawExperience of parsedExperiences) {
      const jobTitle = String(rawExperience?.jobTitle || '').trim()
      const company = String(rawExperience?.company || 'Company not specified').trim()
      const key = `${jobTitle.toLowerCase()}|${company.toLowerCase()}`
      if (!jobTitle || existingExperienceSet.has(key)) continue
      try {
        await profileApi.post('/experiences', {
          jobTitle,
          company,
          startDate: String(rawExperience?.startDate || '').trim(),
          endDate: String(rawExperience?.endDate || '').trim(),
          description: String(rawExperience?.description || '').trim(),
          skills: Array.isArray(rawExperience?.skills)
            ? rawExperience.skills.map((item) => String(item).trim()).filter(Boolean)
            : []
        })
        existingExperienceSet.add(key)
      } catch {
        // Ignore individual row failures to keep import resilient.
      }
    }

    const parsedEducations = Array.isArray(parsedProfile?.educations) ? parsedProfile.educations : []
    for (const rawEducation of parsedEducations) {
      const title = String(rawEducation?.title || '').trim()
      const school = String(rawEducation?.school || '').trim()
      const key = `${title.toLowerCase()}|${school.toLowerCase()}`
      if (!title || !school || existingEducationSet.has(key)) continue
      try {
        await profileApi.post('/educations', {
          title,
          school,
          period: String(rawEducation?.period || '').trim()
        })
        existingEducationSet.add(key)
      } catch {
        // Ignore individual row failures to keep import resilient.
      }
    }
  }

  const handleCVUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCvImporting(true)
    setCvImportMessage('')
    setError('')

    const mimeType = inferMimeType(file)
    const allowedMimeTypes = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ])

    if (!allowedMimeTypes.has(mimeType)) {
      setCvImporting(false)
      setCvImportMessage('Format non supporte. Utilisez PDF, DOCX ou TXT.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setCvImporting(false)
      setCvImportMessage('Le CV depasse 5 MB. Choisissez un fichier plus petit.')
      event.target.value = ''
      return
    }

    try {
      const contentBase64 = await readFileAsBase64(file)

      const saveResponse = await profileApi.put('/profiles/me/cv', {
        fileName: file.name,
        mimeType,
        contentBase64,
        size: file.size
      })
      setStoredCv(saveResponse.data?.cvUpload || {
        fileName: file.name,
        mimeType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        hasFile: true
      })

      try {
        const { data } = await aiApi.post('/ai-cv-parse', {
          fileName: file.name,
          mimeType,
          contentBase64
        })

        const parsedProfile = data?.parsedProfile || {}
        let nextForm = null

        setForm((previous) => {
          nextForm = {
            ...previous,
            professional_title: parsedProfile.professional_title || previous.professional_title,
            summary: parsedProfile.summary || previous.summary,
            phone: parsedProfile.phone || previous.phone,
            address: parsedProfile.address || previous.address
          }
          return nextForm
        })

        if (nextForm) {
          await upsertMyProfile(nextForm)
        }

        await syncParsedCollections(parsedProfile)

        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setCvImportMessage('CV enregistre. Les informations et experiences ont ete importees.')
      } catch (parseError) {
        setCvImportMessage('CV enregistre, mais l extraction automatique a echoue. Vous pouvez reessayer.')
        setError(parseError.response?.data?.message || 'CV saved but AI parsing failed.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Import CV failed.')
      setCvImportMessage('')
    } finally {
      setCvImporting(false)
      event.target.value = ''
    }
  }

  const handleDeleteStoredCV = async () => {
    try {
      setCvDeleting(true)
      setError('')
      setCvImportMessage('')
      await profileApi.delete('/profiles/me/cv')
      setStoredCv(null)
      setCvImportMessage('CV supprime avec succes.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete CV.')
    } finally {
      setCvDeleting(false)
    }
  }

  const cancelAdminEdit = () => {
    setAdminEditId('')
    setAdminEditForm({
      first_name: '',
      last_name: '',
      professional_title: '',
      phone: '',
      address: '',
      role: 'user'
    })
  }

  const saveAdminProfileChanges = async (event, profile) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const firstName = adminEditForm.first_name.trim()
    const lastName = adminEditForm.last_name.trim()
    const professionalTitle = adminEditForm.professional_title.trim()
    if (!firstName || !lastName || !professionalTitle) {
      setError('Nom, prenom et poste sont obligatoires.')
      setSaving(false)
      return
    }

    const owner = resolveProfileUser(profile)
    const profileUserId = getProfileUserId(profile)
    const ownerId = String(owner?.id || owner?._id || profileUserId || '').trim()

    try {
      const profilePayload = {
        professional_title: professionalTitle,
        phone: adminEditForm.phone || '',
        address: adminEditForm.address || ''
      }

      const userPayload = {
        first_name: firstName,
        last_name: lastName,
        address: adminEditForm.address || '',
        role: adminEditForm.role
      }

      let updatedUser = null
      const [profileResponse, userResponse] = await Promise.all([
        profileApi.put(`/profiles/${profile.id}`, profilePayload),
        ownerId ? authApi.put(`/users/${ownerId}`, userPayload) : Promise.resolve({ data: null })
      ])
      updatedUser = userResponse?.data?.user || null

      const data = profileResponse?.data
      const updatedProfile = data?.profile

      if (updatedProfile) {
        const mergedProfile = updatedUser
          ? {
              ...updatedProfile,
              user_id: updatedProfile.user_id || updatedUser.id,
              user: updatedUser
            }
          : updatedProfile

        setProfiles((current) => current.map((item) => (item.id === mergedProfile.id ? mergedProfile : item)))
      } else {
        setProfiles((current) =>
          current.map((item) =>
            item.id === profile.id
              ? {
                  ...item,
                  ...profilePayload
                }
              : item
          )
        )
      }

      if (updatedUser) {
        setUsers((current) =>
          current.some((user) => String(user.id || user._id) === String(updatedUser.id))
            ? current.map((user) => (String(user.id || user._id) === String(updatedUser.id) ? updatedUser : user))
            : [updatedUser, ...current]
        )
      }

      await loadAdminResources()

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      cancelAdminEdit()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (isAdmin) {
    return (
      <motion.div initial="hidden" animate="show" variants={container} className="min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="pill mb-2">Admin profiles</div>
              <h1 className="text-3xl font-semibold text-slate-900">Manage all profiles</h1>
              <p className="text-slate-500">As admin, you can review, create and delete user profiles.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {saved && (
                <span className="pill bg-primary/15 text-primary flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Saved
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowAdminForm((current) => !current)}
                className="btn-primary"
                disabled={usersWithoutProfile.length === 0}
              >
                <Plus size={16} />
                {showAdminForm ? 'Hide form' : 'Add user'}
              </button>
            </div>
          </div>

          {error && <div className="card text-sm text-red-500">{error}</div>}

          {showAdminForm && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={18} className="text-primary" />
                <h3 className="text-lg font-semibold text-slate-900">Create profile for a user</h3>
              </div>
              <form className="grid md:grid-cols-2 gap-4" onSubmit={submitAdminProfile}>
                <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
                  <span className="text-slate-600 font-medium">User</span>
                  <select
                    value={adminForm.user_id}
                    onChange={(e) => setAdminForm((current) => ({ ...current, user_id: e.target.value }))}
                    className="bg-white/90 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 outline-none"
                    required
                  >
                    <option value="">Select a user</option>
                    {usersWithoutProfile.map((user) => (
                      <option key={user.id} value={user.id}>
                        {[user.first_name, user.last_name].filter(Boolean).join(' ')} - {user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <FormInput label="Professional title" value={adminForm.professional_title} onChange={(e) => setAdminForm((current) => ({ ...current, professional_title: e.target.value }))} required />
                <FormInput label="Phone" icon={Phone} value={adminForm.phone} onChange={(e) => setAdminForm((current) => ({ ...current, phone: e.target.value }))} />
                <FormInput label="Address" icon={MapPin} value={adminForm.address} onChange={(e) => setAdminForm((current) => ({ ...current, address: e.target.value }))} className="md:col-span-2" />
                <FormInput label="LinkedIn URL" icon={LinkIcon} value={adminForm.linkedin_url} onChange={(e) => setAdminForm((current) => ({ ...current, linkedin_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="GitHub URL" icon={LinkIcon} value={adminForm.github_url} onChange={(e) => setAdminForm((current) => ({ ...current, github_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="Portfolio URL" icon={LinkIcon} value={adminForm.portfolio_url} onChange={(e) => setAdminForm((current) => ({ ...current, portfolio_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="Summary" value={adminForm.summary} onChange={(e) => setAdminForm((current) => ({ ...current, summary: e.target.value }))} className="md:col-span-2" />
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetAdminForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !adminForm.user_id || !adminForm.professional_title}
                    className="btn-primary"
                  >
                    {saving ? 'Saving...' : 'Create profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4">
            {loading && <div className="card text-sm text-slate-500">Loading profiles...</div>}
            {!loading && profiles.length === 0 && (
              <div className="card text-sm text-slate-500">No profiles available yet.</div>
            )}
            {profiles.map((profile) => (
              <div key={profile.id} className="card space-y-4">
                {(() => {
                  const owner = resolveProfileUser(profile)
                  const ownerName = [owner?.first_name, owner?.last_name].filter(Boolean).join(' ') || owner?.email || 'Unknown user'
                  const ownerEmail = owner?.email || '-'
                  const ownerRole = owner?.role || 'user'

                  return (
                    <>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{ownerName}</p>
                          <p className="text-sm text-slate-500">{profile.professional_title || 'No professional title'}</p>
                          <p className="text-sm text-slate-600 mt-2">{profile.summary || 'No summary'}</p>
                          <p className="text-xs text-slate-400 mt-2">{ownerEmail}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleToggleAdminDetails(profile.id)}
                            className="btn-secondary"
                          >
                            <Eye size={16} />
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdminEdit(profile)}
                            className="btn-secondary"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAdminProfile(profile.id)}
                            className="btn-danger"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>

                      {adminDetailId === profile.id && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Nom</p>
                            <p className="text-slate-900 mt-1">{owner?.last_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Prenom</p>
                            <p className="text-slate-900 mt-1">{owner?.first_name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Role</p>
                            <p className="text-slate-900 mt-1">{ownerRole}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Poste</p>
                            <p className="text-slate-900 mt-1">{profile.professional_title || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Phone</p>
                            <p className="text-slate-900 mt-1">{profile.phone || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Address</p>
                            <p className="text-slate-900 mt-1">{profile.address || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Email</p>
                            <p className="text-slate-900 mt-1 break-all">{ownerEmail}</p>
                          </div>
                        </div>
                      )}

                      {adminEditId === profile.id && (
                        <form className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid md:grid-cols-2 gap-4" onSubmit={(event) => saveAdminProfileChanges(event, profile)}>
                          <FormInput
                            label="Nom"
                            value={adminEditForm.last_name}
                            onChange={(e) => setAdminEditForm((current) => ({ ...current, last_name: e.target.value }))}
                            required
                          />
                          <FormInput
                            label="Prenom"
                            value={adminEditForm.first_name}
                            onChange={(e) => setAdminEditForm((current) => ({ ...current, first_name: e.target.value }))}
                            required
                          />
                          <FormInput
                            label="Poste"
                            value={adminEditForm.professional_title}
                            onChange={(e) => setAdminEditForm((current) => ({ ...current, professional_title: e.target.value }))}
                            required
                          />
                          <label className="flex flex-col gap-1.5 text-sm">
                            <span className="text-slate-600 font-medium">Role</span>
                            <select
                              value={adminEditForm.role}
                              onChange={(e) => setAdminEditForm((current) => ({ ...current, role: e.target.value }))}
                              className="bg-white/90 border border-slate-200 rounded-xl px-3 py-3 text-slate-800 outline-none"
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </label>
                          <FormInput
                            label="Phone"
                            icon={Phone}
                            value={adminEditForm.phone}
                            onChange={(e) => setAdminEditForm((current) => ({ ...current, phone: e.target.value }))}
                          />
                          <FormInput
                            label="Address"
                            icon={MapPin}
                            value={adminEditForm.address}
                            onChange={(e) => setAdminEditForm((current) => ({ ...current, address: e.target.value }))}
                          />
                          <div className="md:col-span-2 flex justify-end gap-3">
                            <button type="button" onClick={cancelAdminEdit} className="btn-secondary">
                              Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                              {saving ? 'Saving...' : 'Save changes'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
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
              className="btn-primary"
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save changes'}
              <Save size={16} />
            </motion.button>
          </div>
        </div>

        {loading ? (
          <div className="card text-center text-sm text-slate-500">Loading profile...</div>
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
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={[currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.email || 'Profile avatar'}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-indigo-100 shadow-xl"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary via-indigo-500 to-purple-500 shadow-xl" />
                )}
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  className="absolute -right-2 -bottom-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/80 backdrop-blur shadow-soft"
                  aria-label="Open account photo settings"
                >
                  <Camera size={16} className="text-slate-700" />
                </button>
              </motion.div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-900">{form.professional_title || 'Your professional title'}</p>
                <p className="text-sm text-slate-500">{form.address || 'Add your address'}</p>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                Keep this section updated so AI-generated documents reuse accurate profile information.
              </p>
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                className="hidden"
                onChange={handleCVUpload}
              />
              <div className="mt-5 w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-left">
                <p className="text-sm font-medium text-slate-100">Import your existing CV</p>
                <p className="text-xs text-slate-400 mt-1">
                  Upload PDF, DOCX or TXT. Only one CV is saved per account (new upload replaces old one).
                </p>
                {storedCv?.hasFile && (
                  <div className="mt-3 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                    <p className="font-medium text-slate-100 break-all">{storedCv.fileName}</p>
                    <p className="mt-1 text-slate-400">
                      {(storedCv.mimeType || '').toUpperCase()} - {storedCv.size ? `${Math.max(1, Math.round(storedCv.size / 1024))} KB` : '0 KB'}
                    </p>
                    {storedCv.uploadedAt && (
                      <p className="mt-1 text-slate-500">
                        Uploaded: {new Date(storedCv.uploadedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={cvImporting || cvDeleting}
                  className="btn-secondary mt-3 w-full justify-center"
                >
                  {cvImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {cvImporting ? 'Importing CV...' : storedCv?.hasFile ? 'Replace saved CV' : 'Upload CV for AI import'}
                </button>
                {storedCv?.hasFile && (
                  <button
                    type="button"
                    onClick={handleDeleteStoredCV}
                    disabled={cvDeleting || cvImporting}
                    className="btn-danger mt-2 w-full justify-center"
                  >
                    {cvDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {cvDeleting ? 'Deleting CV...' : 'Delete saved CV'}
                  </button>
                )}
                {cvImportMessage && <p className="text-xs text-primary mt-2">{cvImportMessage}</p>}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, boxShadow: '0 20px 70px rgba(15,23,42,0.12)' }}
              className="card glass lg:col-span-2 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile details</h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <FormInput label="Professional title" value={form.professional_title} onChange={(e) => setForm((f) => ({ ...f, professional_title: e.target.value }))} />
                <FormInput label="Phone" icon={Phone} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                <FormInput label="Address" icon={MapPin} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="md:col-span-2" />
                <FormInput label="LinkedIn URL" icon={LinkIcon} value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="GitHub URL" icon={LinkIcon} value={form.github_url} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="Portfolio URL" icon={LinkIcon} value={form.portfolio_url} onChange={(e) => setForm((f) => ({ ...f, portfolio_url: e.target.value }))} className="md:col-span-2" />
                <FormInput label="Summary" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} className="md:col-span-2" />
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
