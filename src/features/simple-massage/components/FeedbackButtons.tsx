import { cn } from "@/shared/lib/utils"
import type { Expression } from "../types"
import { EXPRESSION_LABELS, EXPRESSION_COLORS, EXPRESSION_BG_COLORS } from "../types"

interface FeedbackButtonsProps {
  currentExpression: Expression
  onFeedback: (expression: Expression) => void
  disabled?: boolean
  className?: string
}

const EXPRESSIONS: Expression[] = ["comfortable", "normal", "slight-pain", "severe-pain"]

/**
 * 用戶反饋按鈕組
 * 讓用戶反饋當前的感受：舒服、一般、少痛、很痛
 */
export function FeedbackButtons({
  currentExpression,
  onFeedback,
  disabled = false,
  className,
}: FeedbackButtonsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide text-center">
        您的感受
      </h3>
      <div className="flex justify-center gap-2">
        {EXPRESSIONS.map((expression) => (
          <button
            key={expression}
            onClick={() => onFeedback(expression)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              currentExpression === expression
                ? cn(EXPRESSION_BG_COLORS[expression], "shadow-md")
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <FeedbackIcon expression={expression} isActive={currentExpression === expression} />
            <span
              className={cn(
                "text-xs font-medium",
                currentExpression === expression
                  ? EXPRESSION_COLORS[expression]
                  : "text-slate-500"
              )}
            >
              {EXPRESSION_LABELS[expression]}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">
        點擊反饋您的感受，系統將自動調整
      </p>
    </div>
  )
}

interface FeedbackIconProps {
  expression: Expression
  isActive: boolean
}

/**
 * 反饋按鈕圖標 - 使用簡化的臉部符號
 */
function FeedbackIcon({ expression, isActive }: FeedbackIconProps) {
  const size = "w-8 h-8"
  const color = isActive ? EXPRESSION_COLORS[expression] : "text-slate-400"

  switch (expression) {
    case "comfortable":
      return (
        <svg viewBox="0 0 24 24" className={cn(size, color)} fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* 閉眼微笑 */}
          <path d="M7 10 Q8.5 8, 10 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M14 10 Q15.5 8, 17 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 14 Q12 18, 16 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )

    case "normal":
      return (
        <svg viewBox="0 0 24 24" className={cn(size, color)} fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* 正常眼睛和嘴巴 */}
          <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="10" r="1.5" fill="currentColor" />
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )

    case "slight-pain":
      return (
        <svg viewBox="0 0 24 24" className={cn(size, color)} fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* 皺眉 */}
          <path d="M6 8 L10 9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 8 L14 9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8.5" cy="11" r="1.2" fill="currentColor" />
          <circle cx="15.5" cy="11" r="1.2" fill="currentColor" />
          <path d="M9 16 Q12 14, 15 16" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )

    case "severe-pain":
      return (
        <svg viewBox="0 0 24 24" className={cn(size, color)} fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* X眼睛 */}
          <path d="M6 8 L10 12 M6 12 L10 8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 8 L18 12 M14 12 L18 8" stroke="currentColor" strokeWidth="1.5" />
          {/* 張嘴 */}
          <ellipse cx="12" cy="16" rx="3" ry="2" fill="currentColor" />
        </svg>
      )
  }
}

export default FeedbackButtons
