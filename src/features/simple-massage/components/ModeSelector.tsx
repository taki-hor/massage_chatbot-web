import { cn } from "@/shared/lib/utils"
import type { MassageMode } from "../types"
import { MODE_LABELS, MODE_DESCRIPTIONS } from "../types"

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
 * 3種模式：揉捏、按壓、震動
 */
export function ModeSelector({
  selected,
  onChange,
  disabled = false,
  className,
}: ModeSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        按摩模式
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              selected === mode
                ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-full transition-colors",
                selected === mode
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {MODE_ICONS[mode]}
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "font-semibold text-base",
                  selected === mode ? "text-brand-600" : "text-slate-700"
                )}
              >
                {MODE_LABELS[mode]}
              </p>
              <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                {MODE_DESCRIPTIONS[mode].slice(0, 10)}...
              </p>
            </div>
          </button>
        ))}
      </div>
      {/* 模式描述 */}
      <p className="text-sm text-slate-500 text-center bg-slate-50 rounded-lg p-2">
        {MODE_DESCRIPTIONS[selected]}
      </p>
    </div>
  )
}

function KneadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      {/* 揉捏手勢 - 兩個旋轉的手指 */}
      <circle cx="8" cy="10" r="3" />
      <circle cx="16" cy="10" r="3" />
      <path d="M8 13 C8 16, 16 16, 16 13" />
      <path d="M6 8 C4 6, 4 4, 6 4" />
      <path d="M18 8 C20 6, 20 4, 18 4" />
    </svg>
  )
}

function PressIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      {/* 按壓手勢 - 向下的箭頭和手指 */}
      <circle cx="12" cy="8" r="4" />
      <line x1="12" y1="12" x2="12" y2="20" />
      <polyline points="8 16 12 20 16 16" />
    </svg>
  )
}

function VibrateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      {/* 震動符號 - 波浪線 */}
      <path d="M4 12 Q6 8, 8 12 Q10 16, 12 12 Q14 8, 16 12 Q18 16, 20 12" />
      <path d="M4 8 Q6 4, 8 8" />
      <path d="M16 8 Q18 4, 20 8" />
      <path d="M4 16 Q6 20, 8 16" />
      <path d="M16 16 Q18 20, 20 16" />
    </svg>
  )
}

export default ModeSelector
