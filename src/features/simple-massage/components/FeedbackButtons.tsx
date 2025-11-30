import { cn } from "@/shared/lib/utils"
import type { Expression } from "../types"
import { EXPRESSION_LABELS } from "../types"

interface FeedbackButtonsProps {
  currentExpression: Expression
  onFeedback: (expression: Expression) => void
  disabled?: boolean
  className?: string
}

const EXPRESSIONS: Expression[] = ["comfortable", "normal", "slight-pain", "severe-pain"]

/** 表情按鈕顏色配置 */
const BUTTON_STYLES: Record<Expression, { active: string; ring: string }> = {
  comfortable: {
    active: "bg-emerald-50 border-emerald-300 text-emerald-700",
    ring: "ring-emerald-200",
  },
  normal: {
    active: "bg-blue-50 border-blue-300 text-blue-700",
    ring: "ring-blue-200",
  },
  "slight-pain": {
    active: "bg-amber-50 border-amber-300 text-amber-700",
    ring: "ring-amber-200",
  },
  "severe-pain": {
    active: "bg-red-50 border-red-300 text-red-700",
    ring: "ring-red-200",
  },
}

/**
 * 用戶反饋按鈕組
 * 簡潔的橫向排列，清晰表達感受
 */
export function FeedbackButtons({
  currentExpression,
  onFeedback,
  disabled = false,
  className,
}: FeedbackButtonsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">
        您的感受
      </h3>
      <div className="flex justify-center gap-2 sm:gap-3">
        {EXPRESSIONS.map((expression) => {
          const isActive = currentExpression === expression
          const styles = BUTTON_STYLES[expression]

          return (
            <button
              key={expression}
              onClick={() => onFeedback(expression)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-2 px-3 py-3 sm:px-4 rounded-xl border-2 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                styles.ring,
                "hover:scale-105 active:scale-95",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                isActive
                  ? cn(styles.active, "shadow-md")
                  : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white"
              )}
            >
              <FeedbackFace expression={expression} isActive={isActive} />
              <span className="text-xs font-semibold whitespace-nowrap">
                {EXPRESSION_LABELS[expression]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface FeedbackFaceProps {
  expression: Expression
  isActive: boolean
}

/** 簡約風格的表情圖標 */
function FeedbackFace({ expression, isActive }: FeedbackFaceProps) {
  const faceColor = isActive ? "currentColor" : "#94A3B8"

  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8 sm:w-10 sm:h-10">
      {/* 臉部圓圈 */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke={faceColor}
        strokeWidth="2"
      />

      {expression === "comfortable" && (
        <>
          {/* 彎彎眼 */}
          <path d="M 8 13 Q 11 9, 14 13" stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 18 13 Q 21 9, 24 13" stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 大笑嘴 */}
          <path d="M 9 19 Q 16 27, 23 19" stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {expression === "normal" && (
        <>
          {/* 圓眼睛 */}
          <circle cx="11" cy="13" r="2" fill={faceColor} />
          <circle cx="21" cy="13" r="2" fill={faceColor} />
          {/* 微笑 */}
          <path d="M 11 21 Q 16 24, 21 21" stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {expression === "slight-pain" && (
        <>
          {/* 皺眉線 */}
          <path d="M 7 10 L 14 12" stroke={faceColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 25 10 L 18 12" stroke={faceColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* 小眼睛 */}
          <circle cx="11" cy="14" r="1.5" fill={faceColor} />
          <circle cx="21" cy="14" r="1.5" fill={faceColor} />
          {/* 扁嘴 */}
          <path d="M 11 22 Q 16 19, 21 22" stroke={faceColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {expression === "severe-pain" && (
        <>
          {/* X眼睛 */}
          <path d="M 8 10 L 14 16 M 8 16 L 14 10" stroke={faceColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M 18 10 L 24 16 M 18 16 L 24 10" stroke={faceColor} strokeWidth="2" strokeLinecap="round" />
          {/* 張嘴 */}
          <ellipse cx="16" cy="23" rx="4" ry="3" fill={faceColor} />
        </>
      )}
    </svg>
  )
}

export default FeedbackButtons
