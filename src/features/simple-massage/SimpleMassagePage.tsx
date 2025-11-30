import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
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
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        {/* 頁面標題 */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            小腿按摩
          </h1>
          <p className="text-slate-400 text-sm">簡約 · 直覺 · 舒適</p>
        </header>

        {/* 表情顯示 - 核心視覺區域 */}
        <section className="flex flex-col items-center py-4">
          <ExpressionDisplay
            expression={expression}
            isAnimating={isRunning}
            size="lg"
          />
        </section>

        {/* 反饋按鈕 */}
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-100">
          <FeedbackButtons
            currentExpression={expression}
            onFeedback={setExpression}
            disabled={isIdle}
          />
        </section>

        {/* 控制區域 - 模式和力度 */}
        <section className="grid gap-4 md:grid-cols-2">
          {/* 模式選擇 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-100">
            <ModeSelector
              selected={mode}
              onChange={setMode}
              disabled={isLoading}
            />
          </div>

          {/* 力度控制 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-slate-100">
            <IntensityControl
              selected={intensity}
              onChange={setIntensity}
              disabled={isLoading}
            />
          </div>
        </section>

        {/* 狀態顯示 */}
        <StatusDisplay
          status={status}
          mode={mode}
          intensity={intensity}
          duration={duration}
          robotConnected={robotConnected}
        />

        {/* 主控制按鈕 */}
        <section className="flex justify-center gap-4 pb-4">
          {isIdle && (
            <Button
              variant="primary"
              size="lg"
              onClick={start}
              disabled={isLoading}
              className="min-w-[180px] h-14 text-lg rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  準備中...
                </span>
              ) : (
                <span className="flex items-center gap-3">
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
                className="min-w-[120px] h-12 rounded-xl"
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
                className="min-w-[120px] h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <span className="flex items-center gap-2">
                  <StopIcon />
                  停止
                </span>
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={reset}
                disabled={isLoading || isRunning}
                className="h-12 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <ResetIcon />
              </Button>
            </>
          )}
        </section>
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

export default SimpleMassagePage
