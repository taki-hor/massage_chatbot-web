import { useEffect, useRef, useCallback } from "react"

export interface UseWebSocketConfig {
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

export interface UseWebSocketCallbacks<T = unknown> {
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

/**
 * React hook for WebSocket connection with auto-reconnect and heartbeat
 * @param path - WebSocket path (e.g., "/ws/robot" or null to disable)
 * @param callbacks - Event callbacks
 * @param config - Configuration options
 */
export function useWebSocket<T = unknown>(
  path: string | null,
  callbacks: UseWebSocketCallbacks<T>,
  config: UseWebSocketConfig = {}
) {
  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatTimerRef = useRef<number | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const connectionTimerRef = useRef<number | null>(null)
  const retryDelayRef = useRef(config.initialRetryDelay ?? 1000)
  const reconnectAttemptRef = useRef(0)
  const isIntentionallyClosedRef = useRef(false)

  const {
    heartbeatInterval = 15000,
    connectionTimeout = 5000,
    maxRetryDelay = 30000,
    initialRetryDelay = 1000,
    heartbeatMessage = "ping",
    heartbeatResponse = "pong",
  } = config

  const { onMessage, onOpen, onClose, onError, onReconnect } = callbacks

  const clearTimers = useCallback(() => {
    if (heartbeatTimerRef.current !== null) window.clearInterval(heartbeatTimerRef.current)
    if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current)
    if (connectionTimerRef.current !== null) window.clearTimeout(connectionTimerRef.current)
    heartbeatTimerRef.current = null
    reconnectTimerRef.current = null
    connectionTimerRef.current = null
  }, [])

  const startHeartbeat = useCallback(() => {
    clearTimers()
    heartbeatTimerRef.current = window.setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(heartbeatMessage)
      }
    }, heartbeatInterval)
  }, [clearTimers, heartbeatInterval, heartbeatMessage])

  const connect = useCallback(() => {
    if (!path || isIntentionallyClosedRef.current) return

    // Determine WebSocket URL based on current protocol
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = window.location.host
    const url = `${protocol}//${host}${path}`

    try {
      wsRef.current = new WebSocket(url)

      // Connection timeout
      connectionTimerRef.current = window.setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          console.warn("[WS] Connection timeout")
          wsRef.current?.close()
        }
      }, connectionTimeout)

      wsRef.current.onopen = () => {
        console.log(`[WS] Connected to ${path}`)
        clearTimers()
        retryDelayRef.current = initialRetryDelay
        reconnectAttemptRef.current = 0
        startHeartbeat()
        onOpen?.()
      }

      wsRef.current.onmessage = (event) => {
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

      wsRef.current.onerror = (event) => {
        console.error("[WS] Error:", event)
        onError?.(event)
      }

      wsRef.current.onclose = () => {
        console.log("[WS] Disconnected")
        clearTimers()
        onClose?.()

        if (!isIntentionallyClosedRef.current) {
          reconnectAttemptRef.current++
          onReconnect?.(reconnectAttemptRef.current)

          reconnectTimerRef.current = window.setTimeout(() => {
            console.log(`[WS] Reconnecting (attempt ${reconnectAttemptRef.current})...`)
            connect()
            retryDelayRef.current = Math.min(retryDelayRef.current * 2, maxRetryDelay)
          }, retryDelayRef.current)
        }
      }
    } catch (err) {
      console.error("[WS] Failed to create connection:", err)
      if (!isIntentionallyClosedRef.current) {
        reconnectAttemptRef.current++
        reconnectTimerRef.current = window.setTimeout(connect, retryDelayRef.current)
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, maxRetryDelay)
      }
    }
  }, [
    path,
    connectionTimeout,
    initialRetryDelay,
    maxRetryDelay,
    heartbeatResponse,
    onMessage,
    onOpen,
    onClose,
    onError,
    onReconnect,
    clearTimers,
    startHeartbeat,
  ])

  useEffect(() => {
    if (!path) return

    isIntentionallyClosedRef.current = false
    connect()

    return () => {
      isIntentionallyClosedRef.current = true
      clearTimers()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [path, connect, clearTimers])

  return wsRef.current
}
