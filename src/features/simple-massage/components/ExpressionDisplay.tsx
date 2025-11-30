import { cn } from "@/shared/lib/utils"
import type { Expression } from "../types"
import { EXPRESSION_LABELS } from "../types"

interface ExpressionDisplayProps {
  expression: Expression
  isAnimating?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

/** 表情對應的環形顏色 */
const RING_COLORS: Record<Expression, string> = {
  comfortable: "from-emerald-400 to-teal-500",
  normal: "from-blue-400 to-indigo-500",
  "slight-pain": "from-amber-400 to-orange-500",
  "severe-pain": "from-red-400 to-rose-600",
}

/** 表情標籤顏色 */
const LABEL_COLORS: Record<Expression, string> = {
  comfortable: "bg-emerald-100 text-emerald-700 border-emerald-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  "slight-pain": "bg-amber-100 text-amber-700 border-amber-200",
  "severe-pain": "bg-red-100 text-red-700 border-red-200",
}

/**
 * 動態表情顯示組件
 * 現代化簡約設計，清晰表達用戶感受
 */
export function ExpressionDisplay({
  expression,
  isAnimating = false,
  size = "lg",
  className,
}: ExpressionDisplayProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  }

  const ringSize = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-1.5",
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* 外環 - 漸變色表示狀態 */}
      <div
        className={cn(
          "rounded-full bg-gradient-to-br transition-all duration-500",
          ringSize[size],
          RING_COLORS[expression],
          isAnimating && "shadow-lg animate-pulse"
        )}
      >
        {/* 內部白色背景 */}
        <div
          className={cn(
            "rounded-full bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden",
            sizeClasses[size]
          )}
        >
          <ModernFace expression={expression} isAnimating={isAnimating} />
        </div>
      </div>

      {/* 表情標籤 */}
      <div
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold border-2 transition-all duration-300 shadow-sm",
          LABEL_COLORS[expression]
        )}
      >
        {EXPRESSION_LABELS[expression]}
      </div>
    </div>
  )
}

interface ModernFaceProps {
  expression: Expression
  isAnimating: boolean
}

/**
 * 現代化頭像 - 簡約可愛風格
 */
function ModernFace({ expression, isAnimating }: ModernFaceProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 膚色漸層 */}
        <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFECD2" />
          <stop offset="100%" stopColor="#FCB69F" />
        </linearGradient>

        {/* 臉紅 */}
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9A9E" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF9A9E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 臉部 */}
      <circle cx="50" cy="50" r="42" fill="url(#skin)" />

      {/* 眼睛 */}
      <Eyes expression={expression} isAnimating={isAnimating} />

      {/* 嘴巴 */}
      <Mouth expression={expression} isAnimating={isAnimating} />

      {/* 臉紅 - 舒服和一般時顯示 */}
      {(expression === "comfortable" || expression === "normal") && (
        <>
          <circle cx="22" cy="55" r="8" fill="url(#blush)" />
          <circle cx="78" cy="55" r="8" fill="url(#blush)" />
        </>
      )}

      {/* 汗滴 - 痛時顯示 */}
      {(expression === "slight-pain" || expression === "severe-pain") && (
        <Sweat expression={expression} isAnimating={isAnimating} />
      )}
    </svg>
  )
}

function Eyes({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  const y = 42

  switch (expression) {
    case "comfortable":
      // 開心彎眼
      return (
        <g className={cn(isAnimating && "animate-pulse")}>
          <path
            d="M 28 42 Q 35 34, 42 42"
            stroke="#4A3728"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 58 42 Q 65 34, 72 42"
            stroke="#4A3728"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "normal":
      // 正常圓眼
      return (
        <g>
          <ellipse cx="35" cy={y} rx="8" ry="9" fill="white" />
          <circle cx="35" cy={y} r="4.5" fill="#2D1F14" />
          <circle cx="33" cy={y - 2} r="1.5" fill="white" />

          <ellipse cx="65" cy={y} rx="8" ry="9" fill="white" />
          <circle cx="65" cy={y} r="4.5" fill="#2D1F14" />
          <circle cx="63" cy={y - 2} r="1.5" fill="white" />
        </g>
      )

    case "slight-pain":
      // 皺眉半閉眼
      return (
        <g className={cn(isAnimating && "animate-[squint_1s_ease-in-out_infinite]")}>
          {/* 皺眉 */}
          <path d="M 26 34 L 44 38" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 74 34 L 56 38" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />

          <ellipse cx="35" cy={y} rx="7" ry="5" fill="white" />
          <circle cx="35" cy={y} r="3" fill="#2D1F14" />

          <ellipse cx="65" cy={y} rx="7" ry="5" fill="white" />
          <circle cx="65" cy={y} r="3" fill="#2D1F14" />
        </g>
      )

    case "severe-pain":
      // X眼睛
      return (
        <g className={cn(isAnimating && "animate-[squeeze_0.4s_ease-in-out_infinite]")}>
          <path d="M 28 36 L 42 48" stroke="#4A3728" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 28 48 L 42 36" stroke="#4A3728" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 58 36 L 72 48" stroke="#4A3728" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 58 48 L 72 36" stroke="#4A3728" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )
  }
}

function Mouth({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  switch (expression) {
    case "comfortable":
      // 大笑
      return (
        <g className={cn(isAnimating && "animate-[smile_2s_ease-in-out_infinite]")}>
          <path
            d="M 32 62 Q 50 80, 68 62"
            stroke="#D84315"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "normal":
      // 微笑
      return (
        <path
          d="M 38 65 Q 50 72, 62 65"
          stroke="#D84315"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )

    case "slight-pain":
      // 扁嘴
      return (
        <g className={cn(isAnimating && "animate-[wince_1s_ease-in-out_infinite]")}>
          <path
            d="M 36 68 Q 50 62, 64 68"
            stroke="#D84315"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "severe-pain":
      // 張嘴
      return (
        <g className={cn(isAnimating && "animate-[ouch_0.3s_ease-in-out_infinite]")}>
          <ellipse cx="50" cy="68" rx="14" ry="10" fill="#8B0000" />
          <ellipse cx="50" cy="72" rx="8" ry="4" fill="#E57373" />
        </g>
      )
  }
}

function Sweat({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  return (
    <g className={cn(isAnimating && "animate-[drip_1.2s_ease-in-out_infinite]")}>
      <path
        d="M 85 28 Q 88 22, 91 28 Q 93 36, 88 38 Q 83 36, 85 28"
        fill="#7DD3FC"
        opacity={expression === "severe-pain" ? 0.9 : 0.6}
      />
      {expression === "severe-pain" && (
        <path
          d="M 9 32 Q 12 26, 15 32 Q 17 40, 12 42 Q 7 40, 9 32"
          fill="#7DD3FC"
          opacity="0.8"
        />
      )}
    </g>
  )
}

export default ExpressionDisplay
