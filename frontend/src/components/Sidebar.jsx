// Provides the Sidebar reusable UI component.
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, User2, Briefcase, Sparkles, FileText, LogOut, Bell } from 'lucide-react'
import { clearSession, getCurrentUserRole } from '../services/api'
import BrandLogo from './BrandLogo'

const userNavItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', Icon: User2 },
  { to: '/experiences', label: 'Experiences', Icon: Briefcase },
  { to: '/jobs', label: 'Jobs', Icon: FileText },
  { to: '/generate', label: 'Generate CV', Icon: Sparkles },
  { to: '/notifications', label: 'Notifications', Icon: Bell }
]

const adminNavItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/profile', label: 'Profiles', Icon: User2 },
  { to: '/jobs', label: 'Jobs', Icon: FileText },
  { to: '/notifications', label: 'Notifications', Icon: Bell }
]

function Sidebar({ collapsed = false, onToggle, onNavigate }) {
  const width = collapsed ? 76 : 276
  const isAdmin = getCurrentUserRole() === 'admin'
  const navItems = isAdmin ? adminNavItems : userNavItems
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    window.location.href = '/login'
  }

  const handleUpgrade = () => {
    navigate('/subscription')
    onNavigate?.()
  }

  return (
    <motion.div
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      className="h-full bg-dark text-slate-100 flex flex-col border-r border-white/5 py-6"
    >
      <div className="px-4 flex items-center gap-3 pb-6 border-b border-white/10">
        {collapsed ? (
          <BrandLogo showWordmark={false} className="h-10 w-10" />
        ) : (
          <BrandLogo compact className="min-w-0" />
        )}
        <button
          className="ml-auto h-9 w-9 rounded-lg border border-white/10 text-slate-200 hover:bg-white/10 transition"
          onClick={onToggle}
        >
          {collapsed ? '>' : '<'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto mt-4 px-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3 pt-4 border-t border-white/10 px-3">
        {!collapsed && !isAdmin && (
          <button
            type="button"
            onClick={handleUpgrade}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/20 text-white hover:bg-primary/30 transition"
          >
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </button>
        )}
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition text-slate-300">
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  )
}

export default Sidebar
