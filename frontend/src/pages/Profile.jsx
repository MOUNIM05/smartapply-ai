import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Phone, MapPin, Save, CheckCircle2, Link as LinkIcon, Trash2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { authApi, getCurrentUserRole, profileApi } from '../services/api'

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

export default function Profile() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const role = getCurrentUserRole()
  const isAdmin = role === 'admin'

  const [form, setForm] = useState(emptyProfile)
  const [profiles, setProfiles] = useState([])
  const [users, setUsers] = useState([])
  const [adminForm, setAdminForm] = useState({ user_id: '', ...emptyProfile })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        if (isAdmin) {
          const [profilesResponse, usersResponse] = await Promise.all([
            profileApi.get('/profiles'),
            authApi.get('/users')
          ])

          setProfiles(profilesResponse.data?.profiles || [])
          setUsers(usersResponse.data?.users || [])
        } else {
          const { data } = await profileApi.get('/profiles/me')
          if (data?.profile) {
            setForm({
              professional_title: data.profile.professional_title || '',
              summary: data.profile.summary || '',
              phone: data.profile.phone || '',
              address: data.profile.address || '',
              linkedin_url: data.profile.linkedin_url || '',
              github_url: data.profile.github_url || '',
              portfolio_url: data.profile.portfolio_url || ''
            })
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
            {saved && (
              <span className="pill bg-primary/15 text-primary flex items-center gap-2">
                <CheckCircle2 size={16} />
                Saved
              </span>
            )}
          </div>

          {error && <div className="card text-sm text-red-500">{error}</div>}

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
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !adminForm.user_id || !adminForm.professional_title}
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-soft disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Create profile'}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {loading && <div className="card text-sm text-slate-500">Loading profiles...</div>}
            {!loading && profiles.length === 0 && (
              <div className="card text-sm text-slate-500">No profiles available yet.</div>
            )}
            {profiles.map((profile) => (
              <div key={profile.id} className="card flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {[profile.user?.first_name, profile.user?.last_name].filter(Boolean).join(' ') || profile.user?.email || 'Unknown user'}
                  </p>
                  <p className="text-sm text-slate-500">{profile.professional_title || 'No professional title'}</p>
                  <p className="text-sm text-slate-600 mt-2">{profile.summary || 'No summary'}</p>
                  <p className="text-xs text-slate-400 mt-2">{profile.user?.email}</p>
                </div>
                <button
                  onClick={() => deleteAdminProfile(profile.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
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
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-soft"
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
                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary via-indigo-500 to-purple-500 shadow-xl" />
                <button className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full bg-white/80 backdrop-blur shadow-soft flex items-center justify-center border border-slate-100">
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
