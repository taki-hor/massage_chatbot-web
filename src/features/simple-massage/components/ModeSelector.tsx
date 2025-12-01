import { cn } from "@/shared/lib/utils"
import type { MassageMode } from "../types"
import { MODE_LABELS } from "../types"
import { KneadIcon, PressIcon, VibrateIcon } from "./Icons"

interface ModeSelectorProps {
  selected: MassageMode
  onChange: (mode: MassageMode) => void
  disabled?: boolean
  className?: string
}

const MODES: MassageMode[] = ["knead", "press", "vibrate"]

const MODE_ICONS: Record<MassageMode, React.ReactNode> = {
  knead: <KneadIcon />,
  press: <PressIcon />,
  vibrate: <VibrateIcon />,
}

/**
 * 按摩模式選擇器
 * 簡潔的三按鈕設計
 */
export function ModeSelector({
  selected,
  onChange,
  disabled = false,
  className,
}: ModeSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        按摩模式
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => {
          const isSelected = selected === mode

          return (
            <button
              key={mode}
              onClick={() => onChange(mode)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div
                className={cn(
                  "w-11 h-11 flex items-center justify-center rounded-full transition-colors",
                  isSelected
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {MODE_ICONS[mode]}
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-indigo-600" : "text-slate-600"
                )}
              >
                {MODE_LABELS[mode]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ModeSelector
