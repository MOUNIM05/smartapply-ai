// Renders the Account page and coordinates its UI state.
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, Mail, MapPin, Pencil, Save, Shield, UserRound, X } from 'lucide-react'
import FormInput from '../components/FormInput'
import { authApi, getCurrentUser, setCurrentUser } from '../services/api'

const MAX_AVATAR_SIZE = 320

const createInitialForm = (user) => ({
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  email: user?.email || '',
  address: user?.address || '',
  avatar_url: user?.avatar_url || ''
})

const createInitialPasswordForm = () => ({
  current_password: '',
  new_password: '',
  confirm_new_password: ''
})

const resizeImageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(MAX_AVATAR_SIZE / image.width, MAX_AVATAR_SIZE / image.height, 1)
        const width = Math.round(image.width * ratio)
        const height = Math.round(image.height * ratio)

        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Canvas is not supported in this browser.'))
          return
        }

        context.drawImage(image, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }

      image.onerror = () => reject(new Error('Failed to read the selected image.'))
      image.src = typeof reader.result === 'string' ? reader.result : ''
    }

    reader.onerror = () => reject(new Error('Failed to read the selected image.'))
    reader.readAsDataURL(file)
  })

export default function Account() {
  const [user, setUser] = useState(getCurrentUser())
  const [loading, setLoading] = useState(!getCurrentUser())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(createInitialForm(getCurrentUser()))
  const [passwordForm, setPasswordForm] = useState(createInitialPasswordForm())

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setError('')
        const { data } = await authApi.get('/users/me')
        if (data?.user) {
          setUser(data.user)
          setCurrentUser(data.user)
          setForm(createInitialForm(data.user))
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load account.')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      loadAccount()
      return
    }

    setForm(createInitialForm(user))
    setLoading(false)
  }, [user])

  const previewName = useMemo(
    () => [form.first_name, form.last_name].filter(Boolean).join(' ') || 'Connected user',
    [form.first_name, form.last_name]
  )

  const displayedAvatar = form.avatar_url || user?.avatar_url || ''

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleStartEditing = () => {
    setForm(createInitialForm(user))
    setError('')
    setSaved(false)
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    setForm(createInitialForm(user))
    setError('')
    setIsEditing(false)
  }

  const togglePasswordForm = () => {
    setShowPasswordForm((current) => {
      const next = !current
      if (!next) {
        setPasswordForm(createInitialPasswordForm())
        setPasswordError('')
      }
      return next
    })
    setPasswordSaved(false)
  }

  const handleSelectAvatar = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    try {
      const optimizedImage = await resizeImageToDataUrl(file)
      handleChange('avatar_url', optimizedImage)
      setError('')
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to prepare the selected image.')
    } finally {
      event.target.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        address: form.address,
        avatar_url: form.avatar_url
      }

      const { data } = await authApi.put('/users/me', payload)

      if (data?.user) {
        setUser(data.user)
        setCurrentUser(data.user)
        setForm(createInitialForm(data.user))
      }

      setSaved(true)
      setIsEditing(false)
      window.setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setPasswordSaving(true)
    setPasswordSaved(false)
    setPasswordError('')

    const currentPassword = passwordForm.current_password.trim()
    const newPassword = passwordForm.new_password.trim()
    const confirmPassword = passwordForm.confirm_new_password.trim()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Remplissez les 3 champs du mot de passe.')
      setPasswordSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caracteres.')
      setPasswordSaving(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmation du nouveau mot de passe ne correspond pas.')
      setPasswordSaving(false)
      return
    }

    try {
      await authApi.patch('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      })

      setPasswordSaved(true)
      setPasswordForm(createInitialPasswordForm())
      setShowPasswordForm(false)
      window.setTimeout(() => setPasswordSaved(false), 2200)
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-3xl mx-auto">
        <div className="pill mb-2">Account</div>
        <h1 className="text-3xl font-semibold text-slate-900">Your account</h1>
        <p className="text-slate-500 mt-1">Update your personal info, address, and profile photo.</p>

        {error && <div className="card mt-6 text-sm text-red-500">{error}</div>}

        {loading ? (
          <div className="card mt-6 text-sm text-slate-500">Loading account...</div>
        ) : (
          <div className="space-y-6 mt-6">
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center gap-5">
                <div className="relative">
                  {displayedAvatar ? (
                    <img
                      src={displayedAvatar}
                      alt={previewName}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-100 shadow-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-indigo-300 ring-4 ring-indigo-100 shadow-lg" />
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -right-2 -bottom-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-soft transition hover:border-primary/30 hover:text-primary"
                      aria-label="Upload account photo"
                    >
                      <Camera size={18} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelectAvatar}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900">{previewName}</h2>
                  <p className="text-sm text-slate-500 mt-1">SmartApply AI account</p>
                  <p className="text-sm text-slate-600 mt-3">
                    Add a profile photo and keep your address up to date so your account feels complete everywhere in the app.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {saved && (
                    <span className="pill bg-primary/15 text-primary">Saved</span>
                  )}
                  {passwordSaved && (
                    <span className="pill bg-primary/15 text-primary">Password updated</span>
                  )}

                  {!isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={togglePasswordForm}
                        className="btn-secondary min-h-11"
                      >
                        <Shield size={16} />
                        Change password
                      </button>
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="btn-primary min-h-11"
                      >
                        <Pencil size={16} />
                        Modify account
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="btn-secondary min-h-11"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-primary min-h-11"
                      >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Current email</p>
                    <p className="font-semibold text-slate-900">{user?.email || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-semibold text-slate-900 capitalize">{user?.role || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Saved address</p>
                    <p className="font-semibold text-slate-900">{user?.address || 'No address yet'}</p>
                  </div>
                </div>
              </div>
            </div>

            {showPasswordForm && (
              <form className="card space-y-5" onSubmit={handlePasswordSubmit}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Change password</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter your current password, then your new password and confirmation.
                    </p>
                  </div>
                  <button type="button" onClick={togglePasswordForm} className="btn-secondary min-h-11">
                    <X size={16} />
                    Cancel
                  </button>
                </div>

                {passwordError && <div className="text-sm text-red-500">{passwordError}</div>}

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    label="Current password"
                    icon={Shield}
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(event) => handlePasswordChange('current_password', event.target.value)}
                    placeholder="Enter current password"
                    className="md:col-span-2"
                  />
                  <FormInput
                    label="New password"
                    icon={Shield}
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(event) => handlePasswordChange('new_password', event.target.value)}
                    placeholder="Enter new password"
                  />
                  <FormInput
                    label="Confirm new password"
                    icon={Shield}
                    type="password"
                    value={passwordForm.confirm_new_password}
                    onChange={(event) => handlePasswordChange('confirm_new_password', event.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={passwordSaving} className="btn-primary min-h-11">
                    {passwordSaving ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                    {passwordSaving ? 'Saving...' : 'Update password'}
                  </button>
                </div>
              </form>
            )}

            {isEditing && (
              <form className="card space-y-6" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Edit account details</h3>
                    <p className="text-sm text-slate-500 mt-1">Change your information only when you need it.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary min-h-11"
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    label="First name"
                    icon={UserRound}
                    value={form.first_name}
                    onChange={(event) => handleChange('first_name', event.target.value)}
                    placeholder="First name"
                  />
                  <FormInput
                    label="Last name"
                    icon={UserRound}
                    value={form.last_name}
                    onChange={(event) => handleChange('last_name', event.target.value)}
                    placeholder="Last name"
                  />
                  <FormInput
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="email@example.com"
                  />
                  <FormInput
                    label="Address"
                    icon={MapPin}
                    value={form.address}
                    onChange={(event) => handleChange('address', event.target.value)}
                    placeholder="Your address"
                  />
                  <FormInput
                    label="Photo URL"
                    icon={Camera}
                    value={form.avatar_url}
                    onChange={(event) => handleChange('avatar_url', event.target.value)}
                    placeholder="https://..."
                    helper="You can paste an image URL or upload a file with the camera button."
                    className="md:col-span-2"
                  />
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
