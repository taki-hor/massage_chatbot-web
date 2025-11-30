import { cn } from "@/shared/lib/utils"
import type { Expression } from "../types"
import { EXPRESSION_LABELS, EXPRESSION_BG_COLORS } from "../types"

interface ExpressionDisplayProps {
  expression: Expression
  isAnimating?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * 動態表情顯示組件
 * 使用 SVG 繪製的人物臉部表情，支持動畫效果
 */
export function ExpressionDisplay({
  expression,
  isAnimating = false,
  size = "lg",
  className,
}: ExpressionDisplayProps) {
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative rounded-full border-4 shadow-2xl transition-all duration-300",
          sizeClasses[size],
          EXPRESSION_BG_COLORS[expression],
          isAnimating && "animate-pulse"
        )}
      >
        <FaceExpression expression={expression} isAnimating={isAnimating} />
      </div>
      <div
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-semibold border transition-all",
          EXPRESSION_BG_COLORS[expression]
        )}
      >
        {EXPRESSION_LABELS[expression]}
      </div>
    </div>
  )
}

interface FaceExpressionProps {
  expression: Expression
  isAnimating: boolean
}

/**
 * SVG 人物表情
 */
function FaceExpression({ expression, isAnimating }: FaceExpressionProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 頭部/臉部輪廓 */}
      <defs>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="100%" stopColor="#FFDAB9" />
        </linearGradient>
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3728" />
          <stop offset="100%" stopColor="#2D1F14" />
        </linearGradient>
      </defs>

      {/* 頭髮 */}
      <ellipse cx="50" cy="35" rx="38" ry="30" fill="url(#hairGradient)" />
      <ellipse cx="50" cy="25" rx="32" ry="18" fill="url(#hairGradient)" />

      {/* 臉部 */}
      <ellipse cx="50" cy="52" rx="32" ry="36" fill="url(#skinGradient)" />

      {/* 耳朵 */}
      <ellipse cx="18" cy="52" rx="5" ry="8" fill="#FFDAB9" />
      <ellipse cx="82" cy="52" rx="5" ry="8" fill="#FFDAB9" />

      {/* 眼睛 */}
      <Eyes expression={expression} isAnimating={isAnimating} />

      {/* 眉毛 */}
      <Eyebrows expression={expression} />

      {/* 嘴巴 */}
      <Mouth expression={expression} isAnimating={isAnimating} />

      {/* 臉紅（舒服時顯示） */}
      {expression === "comfortable" && (
        <>
          <ellipse cx="30" cy="62" rx="8" ry="4" fill="#FFB6C1" opacity="0.5" />
          <ellipse cx="70" cy="62" rx="8" ry="4" fill="#FFB6C1" opacity="0.5" />
        </>
      )}

      {/* 汗滴（痛時顯示） */}
      {(expression === "slight-pain" || expression === "severe-pain") && (
        <SweatDrop expression={expression} isAnimating={isAnimating} />
      )}
    </svg>
  )
}

function Eyes({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  const baseEyeY = 48

  switch (expression) {
    case "comfortable":
      // 瞇眼微笑
      return (
        <g className={isAnimating ? "animate-[blink_3s_ease-in-out_infinite]" : ""}>
          <path
            d="M 32 48 Q 38 44, 44 48"
            stroke="#2D1F14"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 56 48 Q 62 44, 68 48"
            stroke="#2D1F14"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "normal":
      // 正常眼睛
      return (
        <g className={isAnimating ? "animate-[blink_4s_ease-in-out_infinite]" : ""}>
          <ellipse cx="38" cy={baseEyeY} rx="6" ry="7" fill="white" />
          <ellipse cx="62" cy={baseEyeY} rx="6" ry="7" fill="white" />
          <circle cx="38" cy={baseEyeY} r="3.5" fill="#2D1F14" />
          <circle cx="62" cy={baseEyeY} r="3.5" fill="#2D1F14" />
          <circle cx="36" cy={baseEyeY - 1} r="1" fill="white" />
          <circle cx="60" cy={baseEyeY - 1} r="1" fill="white" />
        </g>
      )

    case "slight-pain":
      // 輕微皺眉
      return (
        <g className={isAnimating ? "animate-[squint_1s_ease-in-out_infinite]" : ""}>
          <ellipse cx="38" cy={baseEyeY} rx="5" ry="5" fill="white" />
          <ellipse cx="62" cy={baseEyeY} rx="5" ry="5" fill="white" />
          <circle cx="38" cy={baseEyeY} r="2.5" fill="#2D1F14" />
          <circle cx="62" cy={baseEyeY} r="2.5" fill="#2D1F14" />
        </g>
      )

    case "severe-pain":
      // 緊閉眼睛
      return (
        <g className={isAnimating ? "animate-[squeeze_0.5s_ease-in-out_infinite]" : ""}>
          <path
            d="M 32 48 L 44 48"
            stroke="#2D1F14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 56 48 L 68 48"
            stroke="#2D1F14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* X 形狀表示緊閉 */}
          <path
            d="M 34 46 L 42 50 M 34 50 L 42 46"
            stroke="#2D1F14"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 58 46 L 66 50 M 58 50 L 66 46"
            stroke="#2D1F14"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )
  }
}

function Eyebrows({ expression }: { expression: Expression }) {
  switch (expression) {
    case "comfortable":
      // 放鬆的眉毛
      return (
        <>
          <path
            d="M 30 38 Q 38 36, 46 38"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 54 38 Q 62 36, 70 38"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )

    case "normal":
      // 正常眉毛
      return (
        <>
          <path
            d="M 30 40 L 46 40"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 54 40 L 70 40"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )

    case "slight-pain":
      // 輕微皺眉
      return (
        <>
          <path
            d="M 30 42 Q 38 38, 46 40"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 54 40 Q 62 38, 70 42"
            stroke="#4A3728"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )

    case "severe-pain":
      // 嚴重皺眉
      return (
        <>
          <path
            d="M 28 44 Q 38 36, 48 40"
            stroke="#4A3728"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 52 40 Q 62 36, 72 44"
            stroke="#4A3728"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )
  }
}

function Mouth({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  switch (expression) {
    case "comfortable":
      // 開心微笑
      return (
        <g className={isAnimating ? "animate-[smile_2s_ease-in-out_infinite]" : ""}>
          <path
            d="M 35 68 Q 50 80, 65 68"
            stroke="#C75050"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "normal":
      // 正常嘴巴
      return (
        <path
          d="M 40 70 L 60 70"
          stroke="#C75050"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )

    case "slight-pain":
      // 輕微不適
      return (
        <g className={isAnimating ? "animate-[wince_1s_ease-in-out_infinite]" : ""}>
          <path
            d="M 38 72 Q 50 68, 62 72"
            stroke="#C75050"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )

    case "severe-pain":
      // 張嘴痛苦
      return (
        <g className={isAnimating ? "animate-[ouch_0.3s_ease-in-out_infinite]" : ""}>
          <ellipse cx="50" cy="72" rx="10" ry="8" fill="#8B0000" />
          <ellipse cx="50" cy="74" rx="6" ry="3" fill="#C75050" />
        </g>
      )
  }
}

function SweatDrop({ expression, isAnimating }: { expression: Expression; isAnimating: boolean }) {
  const opacity = expression === "severe-pain" ? 0.8 : 0.5

  return (
    <g className={isAnimating ? "animate-[drip_1s_ease-in-out_infinite]" : ""}>
      <path
        d="M 78 42 Q 80 38, 82 42 Q 84 48, 80 50 Q 76 48, 78 42"
        fill="#87CEEB"
        opacity={opacity}
      />
      {expression === "severe-pain" && (
        <path
          d="M 22 45 Q 24 41, 26 45 Q 28 51, 24 53 Q 20 51, 22 45"
          fill="#87CEEB"
          opacity={opacity}
        />
      )}
    </g>
  )
}

export default ExpressionDisplay
