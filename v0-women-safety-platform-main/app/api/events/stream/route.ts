import { NextRequest } from 'next/server'
import { addRealtimeConnection, removeRealtimeConnection } from '@/lib/realtime-events'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null

  const stream = new ReadableStream({
    start(c) {
      controller = c
      addRealtimeConnection(c)

      // Send initial connection message
      c.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        if (controller) {
          removeRealtimeConnection(c)
        }
      })
    },
    cancel() {
      if (controller) {
        removeRealtimeConnection(controller)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
