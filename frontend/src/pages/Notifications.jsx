// Renders the Notifications page and coordinates its UI state.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, RefreshCw, Loader2, CircleDot, Inbox, Search, Archive } from 'lucide-react'
import { getCurrentUser, getCurrentUserName, notificationApi } from '../services/api'

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

const formatDateTime = (value) => {
  if (!value) return '-'

  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const formatMetadataValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [archivingId, setArchivingId] = useState('')
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const [actionMessage, setActionMessage] = useState('')
  const [error, setError] = useState('')

  const loadNotifications = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const { data } = await notificationApi.get('/notifications/me', {
        params: {
          limit: 100,
          includeArchived: true
        }
      })

      const nextNotifications = data?.notifications || []
      setNotifications(nextNotifications)
      setActionMessage('')
      setError('')

      setSelectedId((current) => {
        if (current && nextNotifications.some((item) => item.id === current)) {
          return current
        }
        return nextNotifications[0]?.id || ''
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de charger les notifications.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
    const handleUserChanged = (event) => {
      setCurrentUser(event.detail || getCurrentUser())
    }

    window.addEventListener('smartapply:user-changed', handleUserChanged)
    return () => window.removeEventListener('smartapply:user-changed', handleUserChanged)
  }, [])

  const filteredNotifications = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    const baseNotifications = notifications.filter((item) => {
      if (activeFilter === 'unread') {
        return !item.isRead && !item.isArchived
      }

      if (activeFilter === 'archived') {
        return item.isArchived
      }

      return !item.isArchived
    })

    if (!normalizedSearchQuery) {
      return baseNotifications
    }

    return baseNotifications.filter((item) => {
      const metadataValues = item.metadata ? Object.values(item.metadata).map((value) => formatMetadataValue(value)) : []
      const haystack = [
        item.title,
        item.message,
        item.type,
        item.event,
        item.sourceService,
        ...metadataValues
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearchQuery)
    })
  }, [activeFilter, notifications, searchQuery])

  const selectedNotification =
    filteredNotifications.find((item) => item.id === selectedId)
    || notifications.find((item) => item.id === selectedId)
    || null

  const unreadCount = notifications.filter((item) => !item.isRead && !item.isArchived).length
  const archivedCount = notifications.filter((item) => item.isArchived).length

  const handleSelectNotification = async (notification) => {
    setSelectedId(notification.id)

    if (notification.isRead || notification.isArchived) {
      return
    }

    try {
      await notificationApi.patch(`/notifications/${notification.id}/read`)
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt: item.readAt || new Date().toISOString()
              }
            : item
          )
      )
      setActionMessage('Notification marquee comme lue.')
      setError('')
    } catch (requestError) {
      setActionMessage('')
      setError(requestError.response?.data?.message || 'Impossible de mettre a jour cette notification.')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!unreadCount || markingAllRead) return

    setMarkingAllRead(true)

    try {
      await notificationApi.patch('/notifications/me/read-all')
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: item.isArchived ? item.isRead : true,
          readAt: item.isArchived ? item.readAt : item.readAt || new Date().toISOString()
        }))
      )
      setActionMessage('Tous les messages non lus sont maintenant marques comme lus.')
      setError('')
    } catch (requestError) {
      setActionMessage('')
      setError(requestError.response?.data?.message || 'Impossible de marquer toutes les notifications comme lues.')
    } finally {
      setMarkingAllRead(false)
    }
  }

  const handleArchiveNotification = async (notificationId) => {
    if (!notificationId || archivingId) return

    setArchivingId(notificationId)

    try {
      const { data } = await notificationApi.patch(`/notifications/${notificationId}/archive`)
      const archivedNotification = data?.notification

      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                ...(archivedNotification || {}),
                isArchived: true,
                archivedAt: archivedNotification?.archivedAt || item.archivedAt || new Date().toISOString(),
                isRead: archivedNotification?.isRead ?? true,
                readAt: archivedNotification?.readAt || item.readAt || new Date().toISOString()
              }
            : item
        )
      )

      setSelectedId((current) => {
        if (current !== notificationId) {
          return current
        }

        const nextVisibleNotification = filteredNotifications.find((item) => item.id !== notificationId)
        return nextVisibleNotification?.id || ''
      })
      setActionMessage('Le message a ete archive.')
      setError('')
    } catch (requestError) {
      setActionMessage('')
      setError(requestError.response?.data?.message || "Impossible d'archiver cette notification.")
    } finally {
      setArchivingId('')
    }
  }

  const getDisplayedUserName = (userId) => {
    if (!userId) return '-'

    if (currentUser?.id && String(currentUser.id) === String(userId)) {
      return [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || getCurrentUserName()
    }

    return String(userId)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-2">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="pill mb-2">Notifications</div>
          <h1 className="text-3xl font-semibold text-slate-900">Centre de notifications</h1>
          <p className="text-slate-500 mt-1">
            Consulte les derniers evenements de la plateforme, recherche rapidement, puis archive ce qui n'est plus utile.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher une notification..."
              className="w-72 max-w-[80vw] rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-violet-400/40"
            />
          </div>

          <button
            type="button"
            onClick={() => loadNotifications({ silent: true })}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:text-violet-300 transition"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={!unreadCount || markingAllRead}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {markingAllRead ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {error && (
        <div className="card text-sm text-red-500">
          {error}
        </div>
      )}

      {actionMessage && !error && (
        <div className="card text-sm text-emerald-400">
          {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[24rem_minmax(0,1fr)] gap-6">
        <section className="card p-0 overflow-hidden bg-gradient-to-b from-[#12121a] to-[#0b0b11]">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Boite de reception</p>
                <p className="text-xs text-slate-500">
                  {activeFilter === 'archived' ? `${archivedCount} archivees` : `${unreadCount} non lues`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.05] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === 'all' ? 'bg-white text-black shadow-sm' : 'text-slate-400'
                }`}
              >
                Tout
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === 'unread' ? 'bg-white text-black shadow-sm' : 'text-slate-400'
                }`}
              >
                Non lues
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('archived')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === 'archived' ? 'bg-white text-black shadow-sm' : 'text-slate-400'
                }`}
              >
                Archives
              </button>
            </div>
          </div>

          <div className="max-h-[42rem] overflow-y-auto">
            {loading ? (
              <div className="px-5 py-12 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Chargement...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="px-5 py-12 text-center text-slate-500">
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Inbox size={22} />
                </div>
                <p className="text-sm font-medium text-slate-700">Aucune notification</p>
                <p className="text-xs mt-1">
                  {searchQuery ? 'Aucun resultat pour cette recherche.' : 'Les nouveaux evenements apparaitront ici.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleSelectNotification(notification)}
                  className={`w-full px-5 py-4 text-left border-b border-white/10 transition ${
                    selectedNotification?.id === notification.id
                      ? 'bg-white/[0.08] text-white'
                      : notification.isArchived
                        ? 'bg-white/[0.02] hover:bg-white/[0.06]'
                        : notification.isRead
                          ? 'bg-transparent hover:bg-white/[0.05]'
                          : 'bg-violet-500/10 hover:bg-violet-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{notification.title}</p>
                        {!notification.isRead && !notification.isArchived && (
                          <CircleDot size={12} className={selectedNotification?.id === notification.id ? 'text-white' : 'text-accent'} />
                        )}
                        {notification.isArchived && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              selectedNotification?.id === notification.id ? 'bg-white/10 text-white' : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            Archivee
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-xs leading-5 ${
                          selectedNotification?.id === notification.id ? 'text-slate-200' : 'text-slate-600'
                        }`}
                      >
                        {notification.message}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] ${
                        selectedNotification?.id === notification.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {formatRelativeDate(notification.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="card min-h-[32rem] bg-gradient-to-b from-[#12121a] to-[#0b0b11]">
          {!selectedNotification ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <div className="h-16 w-16 rounded-3xl bg-white/[0.06] text-slate-400 flex items-center justify-center mb-4 border border-white/10">
                <Bell size={26} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Selectionne une notification</h2>
              <p className="mt-2 max-w-md text-sm">
                Clique sur une notification a gauche pour voir son contenu detaille, sa source et ses metadonnees.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="pill">{selectedNotification.type}</span>
                    <span className="pill">{selectedNotification.sourceService}</span>
                    {selectedNotification.isArchived && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                        Archivee
                      </span>
                    )}
                    {!selectedNotification.isRead && !selectedNotification.isArchived && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                        Non lue
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{selectedNotification.title}</h2>
                  <p className="mt-2 text-slate-600 leading-7">{selectedNotification.message}</p>
                </div>

                {!selectedNotification.isArchived && (
                  <button
                    type="button"
                    onClick={() => handleArchiveNotification(selectedNotification.id)}
                    disabled={archivingId === selectedNotification.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 hover:border-violet-400/30 hover:text-violet-300 transition disabled:opacity-50"
                  >
                    {archivingId === selectedNotification.id ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                    Archiver
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Creee le</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDateTime(selectedNotification.createdAt)}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lue le</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedNotification.isRead ? formatDateTime(selectedNotification.readAt) : 'Pas encore lue'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Archivee le</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedNotification.isArchived ? formatDateTime(selectedNotification.archivedAt) : 'Pas archivee'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Evenement</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{selectedNotification.event || '-'}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Utilisateur</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{getDisplayedUserName(selectedNotification.userId)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="px-5 py-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-slate-900">Metadonnees</h3>
                  <p className="text-sm text-slate-500 mt-1">Informations techniques et contextuelles associees a cette notification.</p>
                </div>

                <div className="divide-y divide-white/10">
                  {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 ? (
                    Object.entries(selectedNotification.metadata).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-[12rem_minmax(0,1fr)] gap-3 px-5 py-4">
                        <p className="text-sm font-medium text-slate-500">{key}</p>
                        <p className="text-sm text-slate-900 break-all">{formatMetadataValue(value)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-6 text-sm text-slate-500">
                      Aucune metadonnee supplementaire.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}
