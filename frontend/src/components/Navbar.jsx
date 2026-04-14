// Provides the Navbar reusable UI component.
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi, clearSession, getCurrentUser, getCurrentUserName, notificationApi } from '../services/api'
import { Search, Bell, Menu, LogOut, Loader2, CheckCheck, RefreshCw } from 'lucide-react'
import BrandLogo from './BrandLogo'

function Navbar({ onToggleSidebar }) {
  const [q, setQ] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [currentUser, setCurrentUserState] = useState(getCurrentUser())
  const notificationPanelRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const currentUserName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.email || 'Connected user'
    : getCurrentUserName()
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
    if (location.pathname !== '/jobs') {
      return
    }

    const params = new URLSearchParams(location.search)
    const query = params.get('q') || ''
    setQ(query)
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      await authApi.post('/auth/logout')
    } catch (e) {
      // keep frontend logout resilient
    } finally {
      clearSession()
      setLoggingOut(false)
      navigate('/login')
    }
  }

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

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100/80">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/40 transition"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <BrandLogo compact className="min-w-0" />
          </button>
        </div>

        <div className="flex-1 max-w-xl hidden md:flex">
          <form onSubmit={handleGlobalSearch} className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shadow-inner">
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
              className="bg-transparent outline-none text-sm flex-1 text-slate-700"
            />
            {q && (
              <button type="button" className="text-xs text-primary font-medium" onClick={() => setQ('')}>
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative z-50" ref={notificationPanelRef}>
            <button
              type="button"
              onClick={handleNotificationToggle}
              className="relative h-10 w-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary transition flex items-center justify-center"
              aria-label="Open notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-[60] mt-3 w-[24rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Notifications</p>
                    <p className="text-xs text-slate-500">
                      {unreadCount > 0 ? `${unreadCount} non lues` : 'Tout est a jour'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadNotifications()}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 transition"
                      aria-label="Refresh notifications"
                    >
                      <RefreshCw size={15} className={loadingNotifications ? 'animate-spin' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead || unreadCount === 0}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
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
                  className="w-full px-4 py-3 text-left text-xs font-semibold text-primary bg-primary/5 border-b border-primary/10 hover:bg-primary/10 transition"
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
                    <div className="px-4 py-8 flex items-center justify-center text-sm text-slate-500 gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Chargement...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-sm text-slate-500 text-center">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleMarkOneAsRead(notification.id)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 transition ${
                          notification.isRead ? 'bg-white' : 'bg-primary/5 hover:bg-primary/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">{notification.title}</p>
                              {!notification.isRead && <span className="h-2.5 w-2.5 rounded-full bg-accent shrink-0" />}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-500">
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
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="flex items-center gap-3 pl-2 rounded-xl hover:bg-slate-50 transition px-2 py-1"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{currentUserName}</p>
              <p className="text-xs text-slate-500">SmartApply AI</p>
            </div>
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUserName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-100"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-300 ring-2 ring-indigo-100" />
            )}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-primary text-white text-sm font-semibold shadow-soft hover:shadow-lg transition disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
            <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
