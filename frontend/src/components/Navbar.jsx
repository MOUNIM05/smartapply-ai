// Provides the Navbar reusable UI component.
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getCurrentUser, getCurrentUserName, getCurrentUserRole, notificationApi } from '../services/api'
import { Search, Bell, Loader2, CheckCheck, RefreshCw, LogOut, Moon, Sun } from 'lucide-react'
import BrandLogo from './BrandLogo'
import { THEMES, THEME_STORAGE_KEY, applyTheme, getResolvedTheme, toggleTheme } from '../services/theme'

function Navbar() {
  const [q, setQ] = useState('')
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [currentUser, setCurrentUserState] = useState(getCurrentUser())
  const [theme, setTheme] = useState(() => getResolvedTheme())
  const notificationPanelRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const currentUserName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.email || 'Connected user'
    : getCurrentUserName()
  const compactUserName = currentUserName.length > 18 ? `${currentUserName.slice(0, 18)}...` : currentUserName
  const isAdmin = getCurrentUserRole() === 'admin'
  const topTabs = isAdmin
    ? [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Profiles', path: '/profile' },
        { label: 'Jobs', path: '/jobs' },
        { label: 'Notifications', path: '/notifications' },
        { label: 'Account', path: '/account' }
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Profile', path: '/profile' },
        { label: 'Experiences', path: '/experiences' },
        { label: 'Jobs', path: '/jobs' },
        { label: 'AI Generator', path: '/generate' },
        { label: 'Notifications', path: '/notifications' },
        { label: 'Subscription', path: '/subscription' }
      ]
  const unreadCount = notifications.filter((item) => !item.isRead).length

  const loadNotifications = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoadingNotifications(true)
      }

      const { data } = await notificationApi.get('/notifications/me', {
        params: {
          limit: 12
        }
      })

      setNotifications(data?.notifications || [])
      setNotificationError('')
    } catch (error) {
      setNotificationError('Notifications indisponibles pour le moment.')
    } finally {
      if (!silent) {
        setLoadingNotifications(false)
      }
    }
  }

  useEffect(() => {
    loadNotifications()

    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true })
    }, 20000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleUserChanged = (event) => {
      setCurrentUserState(event.detail || getCurrentUser())
    }

    window.addEventListener('smartapply:user-changed', handleUserChanged)
    return () => window.removeEventListener('smartapply:user-changed', handleUserChanged)
  }, [])

  useEffect(() => {
    const handleStorageTheme = (event) => {
      if (event.key === THEME_STORAGE_KEY && (event.newValue === THEMES.DARK || event.newValue === THEMES.LIGHT)) {
        setTheme(applyTheme(event.newValue))
      }
    }

    window.addEventListener('storage', handleStorageTheme)
    return () => window.removeEventListener('storage', handleStorageTheme)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/jobs') {
      return
    }

    const params = new URLSearchParams(location.search)
    const query = params.get('q') || ''
    setQ(query)
  }, [location.pathname, location.search])

  const handleNotificationToggle = () => {
    const nextOpenState = !notificationsOpen
    setNotificationsOpen(nextOpenState)

    if (nextOpenState && notifications.length === 0) {
      loadNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!notifications.length || markingAllRead) return

    setMarkingAllRead(true)

    try {
      await notificationApi.patch('/notifications/me/read-all')
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString()
        }))
      )
      setNotificationError('')
    } catch (error) {
      setNotificationError('Impossible de marquer toutes les notifications comme lues.')
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleMarkOneAsRead = async (notificationId) => {
    const targetNotification = notifications.find((item) => item.id === notificationId)

    if (!targetNotification || targetNotification.isRead) {
      return
    }

    try {
      await notificationApi.patch(`/notifications/${notificationId}/read`)
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
                readAt: item.readAt || new Date().toISOString()
              }
            : item
        )
      )
      setNotificationError('')
    } catch (error) {
      setNotificationError('Impossible de mettre a jour cette notification.')
    }
  }

  const formatRelativeDate = (value) => {
    if (!value) return "A l'instant"

    const date = new Date(value)
    const diffMs = Date.now() - date.getTime()
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`
    }

    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) {
      return `Il y a ${diffHours} h`
    }

    const diffDays = Math.round(diffHours / 24)
    return `Il y a ${diffDays} j`
  }

  const handleGlobalSearch = (event) => {
    event?.preventDefault?.()

    const trimmedQuery = q.trim()
    const params = new URLSearchParams()

    if (trimmedQuery) {
      params.set('q', trimmedQuery)
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  const handleThemeToggle = () => {
    setTheme((current) => toggleTheme(current))
  }

  return (
    <header className="app-navbar sticky top-0 z-40 bg-[#050507]/95 backdrop-blur-xl border-b border-white/10">
      <div className="h-16 px-3 lg:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="app-brand-btn flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-white/20"
          >
            <BrandLogo compact className="min-w-0" />
          </button>
        </div>

        <div className="hidden xl:flex flex-1 items-center justify-center gap-2">
          {topTabs.map((tab) => {
            const active = location.pathname.startsWith(tab.path)
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`app-navbar-tab px-4 py-2 rounded-full text-xs font-semibold transition ${
                  active
                    ? 'active bg-white text-black'
                    : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/[0.1]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 max-w-xl hidden lg:flex">
          <form onSubmit={handleGlobalSearch} className="app-search-shell w-full flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-full px-4 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleGlobalSearch(event)
                }
              }}
              placeholder="Search jobs, companies, or documents"
              className="app-search-input bg-transparent outline-none text-sm flex-1 text-slate-100"
            />
            {q && (
              <button type="button" className="text-xs text-violet-300 font-medium" onClick={() => setQ('')}>
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative z-50" ref={notificationPanelRef}>
            <button
              type="button"
              onClick={handleNotificationToggle}
              className="app-icon-circle relative h-10 w-10 rounded-full border border-white/10 text-slate-300 hover:border-white/30 hover:text-white transition flex items-center justify-center"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="app-notification-panel absolute right-0 top-full z-[60] mt-3 w-[24rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-[#0d0d12] shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Notifications</p>
                    <p className="text-xs text-slate-400">
                      {unreadCount > 0 ? `${unreadCount} non lues` : 'Tout est a jour'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadNotifications()}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition"
                      aria-label="Refresh notifications"
                    >
                      <RefreshCw size={15} className={loadingNotifications ? 'animate-spin' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead || unreadCount === 0}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {markingAllRead ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                      Tout lire
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-violet-300 bg-violet-500/10 border-b border-violet-500/20 hover:bg-violet-500/20 transition"
                >
                  Voir tout le detail des notifications
                </button>

                {notificationError && (
                  <div className="px-4 py-3 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
                    {notificationError}
                  </div>
                )}

                <div className="max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto">
                  {loadingNotifications && notifications.length === 0 ? (
                    <div className="px-4 py-8 flex items-center justify-center text-sm text-slate-400 gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Chargement...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-slate-400 text-center">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleMarkOneAsRead(notification.id)}
                        className={`w-full text-left px-4 py-3 border-b border-white/10 last:border-b-0 transition ${
                          notification.isRead ? 'bg-transparent' : 'bg-violet-500/10 hover:bg-violet-500/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-100 truncate">{notification.title}</p>
                              {!notification.isRead && <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0" />}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-400">{notification.message}</p>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-white/10 px-2 py-1 font-medium text-slate-300">
                                {notification.sourceService}
                              </span>
                              <span>{formatRelativeDate(notification.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="app-user-shell hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] pl-3 pr-3 py-1.5">
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex items-center gap-3 rounded-xl hover:bg-white/5 transition"
            >
              <div className="text-right hidden lg:block">
                <p className="text-sm font-semibold text-slate-100 leading-tight">{compactUserName}</p>
                <p className="text-xs text-slate-400 leading-tight">SmartApply AI</p>
              </div>
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUserName}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-2 ring-white/20" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`inline-flex h-10 w-10 md:h-auto md:w-auto md:px-3 md:py-2 items-center justify-center gap-2 rounded-xl border transition ${
              theme === THEMES.DARK
                ? 'border-white/20 bg-white/10 text-slate-100 hover:bg-white/20'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
            aria-label={`Switch to ${theme === THEMES.DARK ? 'light' : 'dark'} mode`}
          >
            {theme === THEMES.DARK ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden md:inline text-xs font-semibold">
              {theme === THEMES.DARK ? 'Light' : 'Dark'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 w-10 md:h-auto md:w-auto md:px-3 md:py-2 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span className="hidden md:inline text-xs font-semibold">Log out</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
