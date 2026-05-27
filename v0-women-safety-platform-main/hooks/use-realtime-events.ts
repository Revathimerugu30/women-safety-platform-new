import { useEffect, useRef } from 'react'

interface RealtimeEvent {
  type:
    | 'notification'
    | 'stats-update'
    | 'user-registered'
    | 'sos-triggered'
    | 'sos-updated'
    | 'sos-cancelled'
    | 'notification-removed'
    | 'connected'
  data?: any
}

export function useRealtimeEvents(callback: (event: RealtimeEvent) => void) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connect = () => {
      try {
        eventSource = new EventSource('/api/events/stream')

        eventSource.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data)
            callbackRef.current(data)
          } catch (error) {
            console.error('Error parsing event:', error)
          }
        })

        eventSource.onerror = () => {
          console.log('EventSource error, reconnecting...')
          eventSource?.close()
          eventSource = null

          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000)
        }
      } catch (error) {
        console.error('Error connecting to EventSource:', error)
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [])
}
