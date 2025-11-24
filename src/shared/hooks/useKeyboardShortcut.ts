import { useEffect, useCallback } from "react"

export type KeyboardShortcut = {
  /** Key to trigger (e.g., "k", "Enter", "Escape") */
  key: string
  /** Require Ctrl/Cmd key */
  ctrlKey?: boolean
  /** Require Shift key */
  shiftKey?: boolean
  /** Require Alt key */
  altKey?: boolean
  /** Callback to execute */
  callback: () => void
  /** Description for help text */
  description?: string
  /** Prevent default behavior */
  preventDefault?: boolean
}

/**
 * Custom hook to register keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * useKeyboardShortcut([
 *   { key: "k", ctrlKey: true, callback: () => focusSearch() },
 *   { key: "Enter", ctrlKey: true, callback: () => submit() }
 * ])
 */
export function useKeyboardShortcut(shortcuts: KeyboardShortcut[], enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      for (const shortcut of shortcuts) {
        const matchesKey = event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * Hook to get OS-specific modifier key name (⌘ for Mac, Ctrl for others)
 */
export function useModifierKey() {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  return isMac ? "⌘" : "Ctrl"
}

/**
 * Format keyboard shortcut for display
 * @param shortcut - Keyboard shortcut configuration
 * @returns Formatted string (e.g., "Ctrl+K" or "⌘K")
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const parts: string[] = []

  if (shortcut.ctrlKey) parts.push(isMac ? "⌘" : "Ctrl")
  if (shortcut.shiftKey) parts.push("Shift")
  if (shortcut.altKey) parts.push(isMac ? "⌥" : "Alt")
  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? "" : "+")
}
