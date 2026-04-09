import { useState } from 'react'
import { Search, Bell, Menu, LogOut } from 'lucide-react'

function Navbar({ onToggleSidebar }) {
  const [q, setQ] = useState('')

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 transition"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="text-sm text-slate-500 hidden sm:block">
            <span className="pill">SmartApply AI</span>
          </div>
        </div>

        <div className="flex-1 max-w-xl hidden md:flex">
          <div className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-inner">
            <Search size={16} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs, companies, or documents"
              className="bg-transparent outline-none text-sm flex-1 text-slate-700"
            />
            {q && (
              <button className="text-xs text-primary font-medium" onClick={() => setQ('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary transition flex items-center justify-center">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">Jane Cooper</p>
              <p className="text-xs text-slate-500">Product Lead</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-300 ring-2 ring-indigo-100" />
          </div>
          <button className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-soft hover:shadow-lg transition">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
