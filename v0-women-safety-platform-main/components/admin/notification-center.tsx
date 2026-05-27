'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Users, AlertCircle, CheckCircle, Phone, MapPin, X } from 'lucide-react';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';

interface AdminNotification {
  id: string;
  type:
    | 'user_registered'
    | 'volunteer_registered'
    | 'sos_triggered'
    | 'sos_cancelled'
    | 'sms_sent'
    | 'user_login'
    | 'volunteer_login';
  title: string;
  message: string;
  data: {
    alertId?: string;
    userName?: string;
    phone?: string;
    email?: string;
    location?: { lat: number; lng: number };
    timestamp: number;
  };
}

export function AdminNotificationCenter() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationIdsRef = useRef(new Set<string>());

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('admin-notification-count', {
        detail: unreadCount,
      })
    );
  }, [unreadCount]);

  const addAdminNotification = (newNotification: AdminNotification) => {
    if (notificationIdsRef.current.has(newNotification.id)) {
      return;
    }

    notificationIdsRef.current.add(newNotification.id);
    setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
    setUnreadCount((prev) => prev + 1);
    playNotificationSound();
  };

  const removeNotificationsByAlertId = (alertId?: string) => {
    if (!alertId) {
      return;
    }

    setNotifications((prev) => prev.filter((notification) => notification.data.alertId !== alertId));
  };

  useRealtimeEvents((event) => {
    if (event.type === 'notification' && event.data) {
      addAdminNotification(event.data);
      return;
    }

    if (event.type === 'notification-removed' && event.data?.alertId) {
      removeNotificationsByAlertId(event.data.alertId);
      return;
    }
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/admin/notifications');

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const fetchedNotifications = data.notifications || [];
        notificationIdsRef.current = new Set(
          fetchedNotifications.map((notification: AdminNotification) => notification.id)
        );
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error('Failed to fetch admin notifications:', error);
      }
    };
    const handleNotification = (event: CustomEvent<AdminNotification>) => {
      addAdminNotification(event.detail);
    };
    const handleToggle = () => {
      setIsOpen((open) => {
        const nextOpen = !open;

        if (nextOpen) {
          setUnreadCount(0);
        }

        return nextOpen;
      });
    };

    window.addEventListener(
      'admin-notification' as any,
      handleNotification as EventListener
    );
    window.addEventListener('toggle-admin-notifications', handleToggle);
    fetchNotifications();

    return () => {
      window.removeEventListener('admin-notification' as any, handleNotification as EventListener);
      window.removeEventListener('toggle-admin-notifications', handleToggle);
    }
  }, []);

  const playNotificationSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    let audioContext: AudioContext;

    try {
      audioContext = new AudioContextClass();
    } catch {
      return;
    }
    const now = audioContext.currentTime;

    // Double beep
    for (let i = 0; i < 2; i++) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.frequency.setValueAtTime(1000, now + i * 0.2);
      gain.gain.setValueAtTime(0.3, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.15);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.15);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'volunteer_registered':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'user_login':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'volunteer_login':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'sos_triggered':
        return <AlertCircle className="w-5 h-5 text-red-600 animate-spin" />;
      case 'sos_cancelled':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'sms_sent':
        return <Phone className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'bg-blue-50 border-blue-200';
      case 'volunteer_registered':
        return 'bg-green-50 border-green-200';
      case 'user_login':
        return 'bg-blue-50 border-blue-200';
      case 'volunteer_login':
        return 'bg-green-50 border-green-200';
      case 'sos_triggered':
        return 'bg-red-50 border-red-200 animate-pulse';
      case 'sos_cancelled':
        return 'bg-green-50 border-green-200';
      case 'sms_sent':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setUnreadCount(0);
          }
        }}
        className="relative bg-white border-2 border-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b-2 border-gray-200 sticky top-0 bg-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <p className="text-sm text-gray-600">
              {unreadCount > 0 ? `${unreadCount} new` : 'No new'} notifications
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border-l-4 ${getNotificationColor(
                    notif.type
                  )} relative`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{notif.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>

                      {notif.data.userName && (
                        <p className="text-xs text-gray-700 mt-1">
                          <strong>User:</strong> {notif.data.userName}
                        </p>
                      )}

                      {notif.data.phone && (
                        <p className="text-xs text-gray-700 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {notif.data.phone}
                        </p>
                      )}

                      {notif.data.location && (
                        <a
                          href={`https://maps.google.com/?q=${notif.data.location.lat},${notif.data.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <MapPin className="w-3 h-3" />
                          View Location
                        </a>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.data.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeNotification(notif.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
