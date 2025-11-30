import { cn } from "@/shared/lib/utils"
import type { Intensity } from "../types"
import { INTENSITY_LABELS } from "../types"

interface IntensityControlProps {
  selected: Intensity
  onChange: (intensity: Intensity) => void
  disabled?: boolean
  className?: string
}

const INTENSITIES: Intensity[] = ["low", "medium", "high"]

/** 力度顏色配置 */
const INTENSITY_COLORS: Record<Intensity, { bg: string; text: string; fill: string }> = {
  low: { bg: "bg-emerald-50", text: "text-emerald-600", fill: "bg-emerald-400" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", fill: "bg-amber-400" },
  high: { bg: "bg-red-50", text: "text-red-600", fill: "bg-red-400" },
}

/**
 * 力度控制組件
 * 簡潔的三級力度選擇
 */
export function IntensityControl({
  selected,
  onChange,
  disabled = false,
  className,
}: IntensityControlProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        力度控制
      </h3>

      {/* 力度按鈕組 - 簡約 pill 設計 */}
      <div className="flex items-center bg-slate-100 rounded-full p-1">
        {INTENSITIES.map((intensity) => {
          const isSelected = selected === intensity
          const colors = INTENSITY_COLORS[intensity]

          return (
            <button
              key={intensity}
              onClick={() => onChange(intensity)}
              disabled={disabled}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-full font-semibold text-sm transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? cn(colors.bg, colors.text, "shadow-sm")
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {INTENSITY_LABELS[intensity]}
            </button>
          )
        })}
      </div>

      {/* 力度指示條 - 更簡潔 */}
      <div className="flex items-center gap-1.5">
        {INTENSITIES.map((intensity, idx) => {
          const isActive =
            (selected === "low" && idx === 0) ||
            (selected === "medium" && idx <= 1) ||
            (selected === "high" && idx <= 2)
          const colors = INTENSITY_COLORS[selected]

          return (
            <div
              key={intensity}
              className={cn(
                "flex-1 h-2 rounded-full transition-all duration-300",
                isActive ? colors.fill : "bg-slate-200"
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

export default IntensityControl
