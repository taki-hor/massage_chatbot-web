import { cn } from "@/shared/lib/utils"
import type { MassageMode, Intensity, MassageStatus } from "../types"
import { MODE_LABELS, INTENSITY_LABELS } from "../types"
import { TimerIcon, RobotIcon } from "./Icons"

interface StatusDisplayProps {
  status: MassageStatus
  mode: MassageMode
  intensity: Intensity
  duration: number
  robotConnected?: boolean
  className?: string
}

/**
 * 狀態顯示組件
 * 精簡的單行狀態顯示
 */
export function StatusDisplay({
  status,
  mode,
  intensity,
  duration,
  robotConnected = false,
  className,
}: StatusDisplayProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const statusConfig = {
    idle: { label: "待機", dotColor: "bg-slate-400" },
    running: { label: "按摩中", dotColor: "bg-green-500 animate-pulse" },
    paused: { label: "暫停", dotColor: "bg-amber-500" },
  }

  const config = statusConfig[status]

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100",
        className
      )}
    >
      {/* 左側：狀態 + 計時器 */}
      <div className="flex items-center gap-4">
        {/* 狀態指示 */}
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", config.dotColor)} />
          <span className="text-sm font-medium text-slate-600">{config.label}</span>
        </div>

        {/* 計時器 */}
        {status !== "idle" && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <TimerIcon className="w-4 h-4" />
            <span className="font-mono text-sm font-semibold">
              {formatDuration(duration)}
            </span>
          </div>
        )}
      </div>

      {/* 中間：當前設定 */}
      <div className="flex items-center gap-3 text-sm">
        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
          {MODE_LABELS[mode]}
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
          {INTENSITY_LABELS[intensity]}
        </span>
      </div>

      {/* 右側：機器人狀態 */}
      <div className="flex items-center gap-1.5">
        <RobotIcon className={cn("w-4 h-4", robotConnected ? "text-green-500" : "text-slate-400")} />
        <div className={cn("w-2 h-2 rounded-full", robotConnected ? "bg-green-500" : "bg-red-400")} />
      </div>
    </div>
  )
}

export default StatusDisplay
