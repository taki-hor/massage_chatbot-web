/**
 * WebSocket utility for real-time communication
 * Implements reconnection with exponential backoff, heartbeat, and proper cleanup
 */

export interface WSConfig {
  /** Heartbeat interval in milliseconds (default: 15000) */
  heartbeatInterval?: number
  /** Initial connection timeout in milliseconds (default: 5000) */
  connectionTimeout?: number
  /** Maximum retry delay in milliseconds (default: 30000) */
  maxRetryDelay?: number
  /** Initial retry delay in milliseconds (default: 1000) */
  initialRetryDelay?: number
  /** Heartbeat message to send (default: "ping") */
  heartbeatMessage?: string
  /** Expected heartbeat response (default: "pong") */
  heartbeatResponse?: string
}

export interface WSCallbacks<T = unknown> {
  /** Called when a message is received */
  onMessage: (data: T) => void
  /** Called when connection is established */
  onOpen?: () => void
  /** Called when connection is closed */
  onClose?: () => void
  /** Called when an error occurs */
  onError?: (error: Event) => void
  /** Called when reconnection is attempted */
  onReconnect?: (attempt: number) => void
}

export function connectWS<T = unknown>(
  path: string,
  callbacks: WSCallbacks<T>,
  config: WSConfig = {}
): () => void {
  const {
    heartbeatInterval = 15000,
    connectionTimeout = 5000,
    maxRetryDelay = 30000,
    initialRetryDelay = 1000,
    heartbeatMessage = "ping",
    heartbeatResponse = "pong",
  } = config

  const { onMessage, onOpen, onClose, onError, onReconnect } = callbacks

  let ws: WebSocket | null = null
  let heartbeatTimer: number | null = null
  let reconnectTimer: number | null = null
  let connectionTimer: number | null = null
  let retryDelay = initialRetryDelay
  let reconnectAttempt = 0
  let isIntentionallyClosed = false

  // Determine WebSocket URL based on current protocol
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const host = window.location.host
  const url = `${protocol}//${host}${path}`

  function clearTimers() {
    if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer)
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer)
    if (connectionTimer !== null) window.clearTimeout(connectionTimer)
    heartbeatTimer = null
    reconnectTimer = null
    connectionTimer = null
  }

  function startHeartbeat() {
    clearTimers()
    heartbeatTimer = window.setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(heartbeatMessage)
      }
    }, heartbeatInterval)
  }

  function attemptReconnect() {
    if (isIntentionallyClosed) return

    reconnectAttempt++
    onReconnect?.(reconnectAttempt)

    reconnectTimer = window.setTimeout(() => {
      console.log(`[WS] Reconnecting (attempt ${reconnectAttempt})...`)
      open()
      retryDelay = Math.min(retryDelay * 2, maxRetryDelay)
    }, retryDelay)
  }

  function open() {
    try {
      ws = new WebSocket(url)

      // Connection timeout
      connectionTimer = window.setTimeout(() => {
        if (ws?.readyState !== WebSocket.OPEN) {
          console.warn("[WS] Connection timeout")
          ws?.close()
        }
      }, connectionTimeout)

      ws.onopen = () => {
        console.log("[WS] Connected")
        clearTimers()
        retryDelay = initialRetryDelay
        reconnectAttempt = 0
        startHeartbeat()
        onOpen?.()
      }

      ws.onmessage = (event) => {
        try {
          // Ignore heartbeat responses
          if (event.data === heartbeatResponse) {
            return
          }

          const data = JSON.parse(event.data) as T
          onMessage(data)
        } catch (err) {
          console.error("[WS] Failed to parse message:", err)
        }
      }

      ws.onerror = (event) => {
        console.error("[WS] Error:", event)
        onError?.(event)
      }

      ws.onclose = () => {
        console.log("[WS] Disconnected")
        clearTimers()
        onClose?.()

        if (!isIntentionallyClosed) {
          attemptReconnect()
        }
      }
    } catch (err) {
      console.error("[WS] Failed to create connection:", err)
      attemptReconnect()
    }
  }

  // Start initial connection
  open()

  // Return cleanup function
  return () => {
    isIntentionallyClosed = true
    clearTimers()
    if (ws) {
      ws.close()
      ws = null
    }
  }
}
