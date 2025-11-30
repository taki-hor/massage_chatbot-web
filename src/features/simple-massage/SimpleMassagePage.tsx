import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ExpressionDisplay } from "./components/ExpressionDisplay"
import { ModeSelector } from "./components/ModeSelector"
import { IntensityControl } from "./components/IntensityControl"
import { FeedbackButtons } from "./components/FeedbackButtons"
import { StatusDisplay } from "./components/StatusDisplay"
import { useSimpleMassage } from "./hooks/useSimpleMassage"

/**
 * 簡約按摩控制頁面
 * 專注於小腿按摩，提供3種模式和3級力度
 */
export function SimpleMassagePage() {
  const {
    mode,
    intensity,
    expression,
    status,
    duration,
    isLoading,
    robotConnected,
    setMode,
    setIntensity,
    setExpression,
    start,
    stop,
    pause,
    reset,
  } = useSimpleMassage()

  const isRunning = status === "running"
  const isPaused = status === "paused"
  const isIdle = status === "idle"

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* 頁面標題 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            小腿按摩控制
          </h1>
          <p className="text-slate-500">
            簡約設計 · 專注體驗
          </p>
        </div>

        {/* 主要內容區域 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 左側：表情和反饋 */}
          <Card className="bg-white/80 backdrop-blur border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-slate-800 text-lg">感受反饋</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* 動態表情顯示 */}
              <ExpressionDisplay
                expression={expression}
                isAnimating={isRunning}
                size="lg"
              />

              {/* 反饋按鈕 */}
              <FeedbackButtons
                currentExpression={expression}
                onFeedback={setExpression}
                disabled={isIdle}
              />
            </CardContent>
          </Card>

          {/* 右側：控制面板 */}
          <div className="space-y-6">
            {/* 模式選擇 */}
            <Card className="bg-white/80 backdrop-blur border-slate-200">
              <CardContent className="pt-6">
                <ModeSelector
                  selected={mode}
                  onChange={setMode}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* 力度控制 */}
            <Card className="bg-white/80 backdrop-blur border-slate-200">
              <CardContent className="pt-6">
                <IntensityControl
                  selected={intensity}
                  onChange={setIntensity}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 狀態顯示 */}
        <StatusDisplay
          status={status}
          mode={mode}
          intensity={intensity}
          duration={duration}
          robotConnected={robotConnected}
        />

        {/* 控制按鈕 */}
        <div className="flex justify-center gap-4">
          {isIdle && (
            <Button
              variant="primary"
              size="lg"
              onClick={start}
              disabled={isLoading}
              className="min-w-[160px] text-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  準備中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlayIcon />
                  開始按摩
                </span>
              )}
            </Button>
          )}

          {(isRunning || isPaused) && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={pause}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isPaused ? (
                  <span className="flex items-center gap-2">
                    <PlayIcon />
                    繼續
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PauseIcon />
                    暫停
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={stop}
                disabled={isLoading}
                className="min-w-[120px] border-red-300 text-red-600 hover:bg-red-50"
              >
                <span className="flex items-center gap-2">
                  <StopIcon />
                  停止
                </span>
              </Button>
            </>
          )}

          {!isIdle && (
            <Button
              variant="ghost"
              size="lg"
              onClick={reset}
              disabled={isLoading || isRunning}
              className="text-slate-500"
            >
              <span className="flex items-center gap-2">
                <ResetIcon />
                重置
              </span>
            </Button>
          )}
        </div>

        {/* 小腿示意圖 */}
        <Card className="bg-white/80 backdrop-blur border-slate-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                按摩部位
              </h3>
              <CalfDiagram isActive={isRunning} />
              <p className="text-sm text-slate-500">
                專注小腿肌肉，緩解疲勞
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 圖標組件
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5", className)}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-5 h-5", className)}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

/**
 * 小腿示意圖組件
 */
function CalfDiagram({ isActive }: { isActive: boolean }) {
  return (
    <svg
      viewBox="0 0 120 200"
      className={cn("w-32 h-48", isActive && "animate-pulse")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <defs>
        <linearGradient id="calfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="50%" stopColor="#FFDAB9" />
          <stop offset="100%" stopColor="#FFE4C4" />
        </linearGradient>
        <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      {/* 大腿（部分） */}
      <ellipse
        cx="60"
        cy="20"
        rx="30"
        ry="25"
        fill="url(#calfGradient)"
        stroke="#D4A574"
      />

      {/* 膝蓋 */}
      <ellipse
        cx="60"
        cy="50"
        rx="22"
        ry="15"
        fill="url(#calfGradient)"
        stroke="#D4A574"
      />

      {/* 小腿主體 - 這是按摩區域 */}
      <path
        d="M 38 55
           Q 30 90, 35 130
           Q 38 160, 45 175
           L 75 175
           Q 82 160, 85 130
           Q 90 90, 82 55
           Z"
        fill={isActive ? "url(#activeGradient)" : "url(#calfGradient)"}
        stroke={isActive ? "#3B82F6" : "#D4A574"}
        strokeWidth={isActive ? "3" : "2"}
        className={isActive ? "animate-pulse" : ""}
      />

      {/* 小腿肌肉線條 */}
      <path
        d="M 50 70 Q 60 100, 55 140"
        stroke={isActive ? "#2563EB" : "#C9A66B"}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M 70 70 Q 60 100, 65 140"
        stroke={isActive ? "#2563EB" : "#C9A66B"}
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />

      {/* 腳踝 */}
      <ellipse
        cx="60"
        cy="180"
        rx="18"
        ry="10"
        fill="url(#calfGradient)"
        stroke="#D4A574"
      />

      {/* 按摩區域指示 */}
      {isActive && (
        <>
          {/* 按摩波紋效果 */}
          <circle
            cx="60"
            cy="100"
            r="15"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            opacity="0.6"
            className="animate-ping"
          />
          <circle
            cx="60"
            cy="130"
            r="12"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            opacity="0.4"
            className="animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* 標籤 */}
      <text
        x="60"
        y="195"
        textAnchor="middle"
        fontSize="10"
        fill="#6B7280"
        fontWeight="500"
      >
        小腿
      </text>
    </svg>
  )
}

export default SimpleMassagePage
