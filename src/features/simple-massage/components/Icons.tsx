import { cn } from "@/shared/lib/utils"

interface IconProps {
  className?: string
}

// ============ 控制圖標 ============

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

export function ResetIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-5 h-5", className)}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

export function LoadingSpinner({ className }: IconProps) {
  return (
    <svg className={cn("w-5 h-5 animate-spin", className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function TimerIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-4 h-4", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ============ 模式圖標 ============

export function KneadIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      {/* 手掌按壓動作 */}
      <path d="M12 3C10 3 8 5 8 8c0 2 1 3 2 4" />
      <path d="M12 3c2 0 4 2 4 5c0 2-1 3-2 4" />
      <ellipse cx="12" cy="14" rx="6" ry="4" />
      <path d="M8 18c-1 1-2 2-2 3" />
      <path d="M16 18c1 1 2 2 2 3" />
    </svg>
  )
}

export function PressIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      {/* 向下按壓 */}
      <circle cx="12" cy="6" r="3" />
      <line x1="12" y1="9" x2="12" y2="17" />
      <path d="M8 14l4 4 4-4" />
      <line x1="6" y1="21" x2="18" y2="21" />
    </svg>
  )
}

export function VibrateIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      {/* 震動波紋 */}
      <rect x="8" y="4" width="8" height="16" rx="2" />
      <path d="M4 8c-1 1-1 3 0 4" />
      <path d="M4 12c-2 2-2 4 0 6" opacity="0.5" />
      <path d="M20 8c1 1 1 3 0 4" />
      <path d="M20 12c2 2 2 4 0 6" opacity="0.5" />
    </svg>
  )
}

// ============ 狀態圖標 ============

export function RobotIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-4 h-4", className)}
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  )
}
