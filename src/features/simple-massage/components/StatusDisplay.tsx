import { cn } from "@/shared/lib/utils"
import type { MassageMode, Intensity, MassageStatus } from "../types"
import { MODE_LABELS, INTENSITY_LABELS } from "../types"

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
 * 顯示當前按摩狀態、運行時間等信息
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
    idle: {
      label: "待機中",
      color: "text-slate-500",
      bgColor: "bg-slate-100",
      dotColor: "bg-slate-400",
    },
    running: {
      label: "運行中",
      color: "text-green-600",
      bgColor: "bg-green-50",
      dotColor: "bg-green-500 animate-pulse",
    },
    paused: {
      label: "已暫停",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      dotColor: "bg-yellow-500",
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-all",
        config.bgColor,
        className
      )}
    >
      {/* 狀態標頭 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", config.dotColor)} />
          <span className={cn("font-semibold", config.color)}>{config.label}</span>
        </div>

        {/* 機器人連接狀態 */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              robotConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-xs text-slate-500">
            {robotConnected ? "機器人已連接" : "機器人未連接"}
          </span>
        </div>
      </div>

      {/* 當前配置 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-xs text-slate-400">部位</p>
          <p className="font-semibold text-slate-700">小腿</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-xs text-slate-400">模式</p>
          <p className="font-semibold text-slate-700">{MODE_LABELS[mode]}</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-xs text-slate-400">力度</p>
          <p className="font-semibold text-slate-700">{INTENSITY_LABELS[intensity]}</p>
        </div>
      </div>

      {/* 運行時間 */}
      {status !== "idle" && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200">
          <TimerIcon className="w-4 h-4 text-slate-400" />
          <span className="text-lg font-mono font-semibold text-slate-700">
            {formatDuration(duration)}
          </span>
        </div>
      )}

      {/* 狀態消息 */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          {status === "idle" && "請選擇模式和力度後開始按摩"}
          {status === "running" && `正在以${INTENSITY_LABELS[intensity]}力度${MODE_LABELS[mode]}小腿...`}
          {status === "paused" && "按摩已暫停，點擊繼續"}
        </p>
      </div>
    </div>
  )
}

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default StatusDisplay
