import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mail, Phone, MapPin, Save, CheckCircle2 } from 'lucide-react'
import FormInput from '../components/FormInput'

const container = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
}

export default function Profile() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 1000)
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold shadow-soft"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save changes'}
              <Save size={16} />
            </motion.button>
          </div>
        </div>

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
              <FormInput label="Full name" defaultValue="Jane Cooper" />
              <FormInput label="Headline" defaultValue="Product Lead · AI UX" />
              <FormInput label="Email" icon={Mail} defaultValue="jane@smartapply.ai" />
              <FormInput label="Phone" icon={Phone} defaultValue="+1 234 567 8910" />
              <FormInput label="Location" icon={MapPin} defaultValue="Remote · San Francisco" className="md:col-span-2" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
