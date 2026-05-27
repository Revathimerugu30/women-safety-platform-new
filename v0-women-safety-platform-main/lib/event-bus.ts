// In-memory event broadcasting system
// In production, replace with Redis Pub/Sub or similar

interface EventListener {
  id: string
  callback: (event: any) => void
}

const eventListeners: EventListener[] = []

export function subscribe(id: string, callback: (event: any) => void) {
  const listener = { id, callback }
  eventListeners.push(listener)

  // Return unsubscribe function
  return () => {
    const index = eventListeners.findIndex((l) => l.id === listener.id)
    if (index > -1) {
      eventListeners.splice(index, 1)
    }
  }
}

export function broadcast(event: any) {
  eventListeners.forEach((listener) => {
    try {
      listener.callback(event)
    } catch (error) {
      console.error('Error in event listener:', error)
    }
  })
}

export function getEventCount() {
  return eventListeners.length
}
