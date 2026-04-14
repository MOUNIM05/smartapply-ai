// Renders the Documents page and coordinates its UI state.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, FileText, Plus } from 'lucide-react'

const seedDocs = [
  { title: 'CV - Frontend Engineer', meta: 'Generated • 2 days ago', type: 'CV' },
  { title: 'Cover Letter - Stripe PM', meta: 'Generated • 5 hours ago', type: 'Letter' },
  { title: 'Follow-up Email - Figma', meta: 'Generated • 1 day ago', type: 'Email' },
  { title: 'Portfolio PDF', meta: 'Uploaded • 1 week ago', type: 'Portfolio' }
]

export default function Documents() {
  const [docs, setDocs] = useState(seedDocs)

  const addMock = () => {
    setDocs([{ title: 'New CV Draft', meta: 'Just now', type: 'CV' }, ...docs])
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="pill mb-2">Documents</div>
          <h1 className="text-3xl font-semibold text-slate-900">Your generated files</h1>
          <p className="text-slate-500">Preview, download, and keep your best drafts organized.</p>
        </div>
        <button
          onClick={addMock}
          className="btn-primary"
        >
          <Plus size={16} />
          Upload
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {docs.length === 0 && <div className="card text-sm text-slate-500">No documents yet. Upload or generate to see them here.</div>}
        {docs.map((doc) => (
          <motion.div
            key={doc.title}
            whileHover={{ y: -4 }}
            className="card space-y-3 rounded-xl shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{doc.title}</p>
                <p className="text-sm text-slate-500">{doc.meta}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="pill">{doc.type}</span>
              <div className="flex-1" />
              <button className="icon-btn" type="button" aria-label={`Preview ${doc.title}`}>
                <Eye size={16} />
              </button>
              <button className="icon-btn" type="button" aria-label={`Download ${doc.title}`}>
                <Download size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
