'use client'

import { useState } from 'react'
import { FiBell, FiX, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import { useNotificationStore } from '@/lib/store'

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <FiCheckCircle className="w-4 h-4 text-green-600" />
    case 'warning':
      return <FiAlertTriangle className="w-4 h-4 text-yellow-500" />
    case 'emergency':
      return <FiBell className="w-4 h-4 text-red-600" />
    default:
      return <FiInfo className="w-4 h-4 text-blue-600" />
  }
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const notifications = useNotificationStore((state) => state.notifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const clearNotifications = useNotificationStore((state) => state.clearNotifications)

  const toggleOpen = () => {
    if (!isOpen) {
      markAllAsRead()
    }
    setIsOpen((current) => !current)
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
        aria-label="Toggle notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[24rem] max-h-[28rem] overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-black/10 z-50">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 bg-card">
            <div>
              <p className="font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {notifications.length > 0 ? `${notifications.length} total` : 'No notifications yet'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation()
                  clearNotifications()
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/50"
                aria-label="Close notifications"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[22rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notifications to show.
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-border bg-card/90 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Mark notification as read"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
