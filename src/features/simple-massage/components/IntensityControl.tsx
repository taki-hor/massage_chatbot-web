import { cn } from "@/shared/lib/utils"
import type { Intensity } from "../types"
import { INTENSITY_LABELS, INTENSITY_DESCRIPTIONS } from "../types"

interface IntensityControlProps {
  selected: Intensity
  onChange: (intensity: Intensity) => void
  disabled?: boolean
  className?: string
}

const INTENSITIES: Intensity[] = ["low", "medium", "high"]

/**
 * 力度控制組件
 * 大、中、小三級力度
 */
export function IntensityControl({
  selected,
  onChange,
  disabled = false,
  className,
}: IntensityControlProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        力度控制
      </h3>

      {/* 力度按鈕組 */}
      <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-xl p-2">
        {INTENSITIES.map((intensity) => (
          <button
            key={intensity}
            onClick={() => onChange(intensity)}
            disabled={disabled}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              selected === intensity
                ? "bg-white text-brand-600 shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {INTENSITY_LABELS[intensity]}
          </button>
        ))}
      </div>

      {/* 力度指示條 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">弱</span>
        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              selected === "low" && "w-1/3 bg-green-400",
              selected === "medium" && "w-2/3 bg-yellow-400",
              selected === "high" && "w-full bg-red-400"
            )}
          />
        </div>
        <span className="text-xs text-slate-400">強</span>
      </div>

      {/* 力度描述 */}
      <p className="text-sm text-slate-500 text-center bg-slate-50 rounded-lg p-2">
        {INTENSITY_DESCRIPTIONS[selected]}
      </p>

      {/* 力度圖示 */}
      <div className="flex justify-center gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              "w-4 h-8 rounded transition-all duration-300",
              level === 1 && "h-4",
              level === 2 && "h-6",
              level === 3 && "h-8",
              (selected === "low" && level <= 1) ||
              (selected === "medium" && level <= 2) ||
              (selected === "high" && level <= 3)
                ? selected === "low"
                  ? "bg-green-400"
                  : selected === "medium"
                  ? "bg-yellow-400"
                  : "bg-red-400"
                : "bg-slate-200"
            )}
            style={{ alignSelf: "flex-end" }}
          />
        ))}
      </div>
    </div>
  )
}

export default IntensityControl
