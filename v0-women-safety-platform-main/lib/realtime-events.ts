const connections = new Set<ReadableStreamDefaultController<Uint8Array>>()
const encoder = new TextEncoder()

export function addRealtimeConnection(controller: ReadableStreamDefaultController<Uint8Array>) {
  connections.add(controller)
}

export function removeRealtimeConnection(controller: ReadableStreamDefaultController<Uint8Array>) {
  connections.delete(controller)
}

export function broadcastRealtimeEvent(data: unknown) {
  const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`)

  connections.forEach((controller) => {
    try {
      controller.enqueue(message)
    } catch (error) {
      console.error('Error sending realtime event:', error)
      connections.delete(controller)
    }
  })
}
