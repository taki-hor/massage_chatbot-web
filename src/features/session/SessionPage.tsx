import { useRef } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import type { ChatTurn } from "@/shared/types/session"
import { useSessionController } from "./hooks/useSessionController"
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut"

export default function SessionPage() {
  const {
    form,
    setForm,
    sessionId,
    message,
    setMessage,
    chatHistory,
    speaking,
    quickParams,
    setQuickParams,
    busy,
    sessionStatus,
    robotStatus,
    sessionLabel,
    logsQuery,
    createMut,
    startMut,
    chatMut,
    handleCreate,
    handleStart,
    handleStop,
    handleSendMessage,
    handleQuickPlan,
    handleExecuteQuickParams,
  } = useSessionController()

  const messageInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useKeyboardShortcut(
    [
      {
        key: "k",
        ctrlKey: true,
        callback: () => messageInputRef.current?.focus(),
        description: "Focus message input",
      },
      {
        key: "Enter",
        ctrlKey: true,
        callback: handleSendMessage,
        description: "Send message",
      },
    ],
    Boolean(sessionId) // Only enable shortcuts when session exists
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden p-2">
      {/* Top Control Bar */}
      <div className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">按摩機器人對話系統</h1>
          {speaking && <SpeakingIndicator />}
          {sessionId && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm">
                <span className={`h-2 w-2 rounded-full ${robotStatus?.connected ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="font-medium text-slate-800">
                  {robotStatus ? (robotStatus.connected ? "在線" : "離線") : "未連線"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                <span className="text-xs text-slate-600">ID:</span>
                <span className="font-mono text-sm font-medium text-slate-800">{sessionLabel}</span>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                <span className="text-sm font-medium text-slate-800">{sessionStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Flex Layout - Wider chat and status sections */}
      <div className="flex flex-1 gap-1.5 overflow-hidden">
        {/* Left Sidebar - Quick Controls - Compact */}
        <div className="w-64 flex flex-col gap-1.5 overflow-hidden">
          <Card className="flex-shrink-0 border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">🎯 任務設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">病人 ID</span>
                <Input
                  className="h-9 text-sm"
                  value={form.patient_id}
                  placeholder="patient-001"
                  onChange={(e) => setForm((prev) => ({ ...prev, patient_id: e.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">目標</span>
                <Input
                  className="h-9 text-sm"
                  value={form.goal}
                  placeholder="放鬆肩頸"
                  onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
                />
              </label>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <Button size="sm" className="col-span-3" disabled={busy} onClick={handleCreate}>
                  {createMut.isPending ? "建立..." : "建立 Session"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!sessionId || busy}
                  onClick={handleStart}
                  title={!sessionId ? "請先建立 Session" : ""}
                >
                  {startMut.isPending ? "啟動..." : "開始"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="col-span-2"
                  disabled={!sessionId || busy}
                  onClick={handleStop}
                  title={!sessionId ? "請先建立 Session" : ""}
                >
                  停止
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-shrink-0 border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">🎛️ 快速參數</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ParamsSelect
                label="部位"
                value={quickParams.bodyPart}
                options={["肩膀", "背部", "腰部", "腿部", "頸部", "手臂"]}
                onChange={(bodyPart) => setQuickParams((p) => ({ ...p, bodyPart }))}
              />
              <ParamsSelect
                label="動作"
                value={quickParams.action}
                options={["揉捏", "敲打", "推拿", "指壓", "推油"]}
                onChange={(action) => setQuickParams((p) => ({ ...p, action }))}
              />
              <ParamsSelect
                label="力度"
                value={quickParams.intensity}
                options={["輕柔", "適中", "強力"]}
                onChange={(intensity) => setQuickParams((p) => ({ ...p, intensity }))}
              />
              <ParamsSelect
                label="時長"
                value={quickParams.duration}
                options={["1", "3", "5", "8", "10"]}
                onChange={(duration) => setQuickParams((p) => ({ ...p, duration }))}
              />
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <Button size="sm" variant="ghost" onClick={handleQuickPlan}>
                  ⚡ 快速
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!sessionId || chatMut.isPending}
                  onClick={handleExecuteQuickParams}
                  title={!sessionId ? "請先建立 Session" : ""}
                >
                  ▶️ 執行
                </Button>
              </div>
            </CardContent>
          </Card>

          {sessionId && (
            <div className="grid flex-shrink-0 grid-cols-1 gap-1.5">
              <MiniCard
                title="🟢 連線狀態"
                lines={[
                  `${robotStatus ? (robotStatus.connected ? "準備就緒" : "離線") : "未連線"}`,
                  `模式：${robotStatus?.mode ?? "待命"}`,
                ]}
              />
              <MiniCard
                title="📊 使用統計"
                lines={[`次數：${sessionId ? 1 : 0} / 6`, "常用：肩頸"]}
              />
            </div>
          )}
        </div>

        {/* Center - Main Chat Area - Flexible width */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex-shrink-0 pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">💬 對話區域</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2.5 overflow-hidden p-2.5">
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3">
                <div
                  role="log"
                  aria-live="polite"
                  aria-label="聊天訊息記錄"
                  className="flex flex-1 flex-col gap-3 overflow-hidden"
                >
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center text-center">
                      <div className="space-y-3">
                        <p className="text-5xl">💆</p>
                        <p className="text-base font-medium text-slate-700">請建立 Session 並開始對話</p>
                        <p className="text-sm text-slate-600">輸入您的按摩需求，系統將為您服務</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatHistory.slice(-5).map((msg, index) => (
                        <MessageBubble key={msg.ts + msg.text} turn={msg} index={index} total={chatHistory.length} />
                      ))}
                      {chatMut.isPending && <TypingIndicator />}
                    </>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 space-y-1.5 rounded-lg border border-slate-300 bg-white p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <input
                    ref={messageInputRef}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:border-slate-300 disabled:text-slate-600"
                    placeholder={sessionId ? "請輸入您的按摩需求..." : "請先建立 Session"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    aria-label="按摩需求訊息輸入"
                    disabled={!sessionId || chatMut.isPending}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0"
                    disabled={!sessionId || chatMut.isPending}
                    onClick={() => {
                      setMessage("請用放鬆模式按摩肩頸，時間 5 分鐘。")
                      handleSendMessage()
                    }}
                    title="模擬語音輸入"
                  >
                    🎤 語音
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    className="flex-shrink-0 px-5"
                    disabled={!sessionId || chatMut.isPending}
                    onClick={handleSendMessage}
                  >
                    {chatMut.isPending ? "送出中..." : "發送"}
                  </Button>
                </div>
                <p className="text-xs text-slate-700">
                  <span className="font-medium">提示：</span>Enter 發送 · Shift+Enter 換行 · Ctrl+K 聚焦
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Logs & Status - Balanced width for content density */}
        <div className="w-56 flex flex-col gap-1.5 overflow-hidden">
          <Card className="flex flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex-shrink-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-900">📊 後端狀態</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
              <div className="flex-shrink-0 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">Robot</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${robotStatus?.connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-800"}`}>
                      {robotStatus ? (robotStatus.connected ? "ON" : "OFF") : sessionId ? "WAIT" : "N/A"}
                    </span>
                  </div>
                  {robotStatus && (
                    <>
                      <div className="flex justify-between border-t border-slate-200 pt-1 text-xs">
                        <span className="text-slate-700">Mode</span>
                        <span className="font-mono font-medium text-slate-900">{robotStatus.mode ?? "idle"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700">Load</span>
                        <span className="font-mono font-medium text-slate-900">{robotStatus.load_kg ?? 0}kg</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                <p className="flex-shrink-0 text-xs font-semibold text-slate-800">Logs</p>
                <div className="flex flex-1 flex-col gap-1.5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
                  {logsQuery.data && logsQuery.data.length > 0 ? (
                    logsQuery.data.slice(-7).map((log) => (
                      <div key={log.id} className="flex-shrink-0 rounded border border-slate-200 bg-white p-1.5 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-bold uppercase text-[10px] ${
                            log.level === "error" ? "text-red-600" :
                            log.level === "warning" ? "text-amber-600" :
                            "text-slate-800"
                          }`}>
                            {log.level}
                          </span>
                          <span className="font-mono text-[10px] text-slate-700">{new Date(log.ts).toLocaleTimeString()}</span>
                        </div>
                        <p className="mt-0.5 truncate text-slate-900">{log.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-1 items-center justify-center text-center">
                      <p className="text-xs text-slate-600">
                        {!sessionId ? "請先建立 Session" : "尚無訊息"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  turn,
  index,
  total,
}: {
  turn: ChatTurn
  index?: number
  total?: number
}) {
  const isUser = turn.role === "user"
  const roleLabel = isUser ? "使用者" : turn.role === "assistant" ? "助手" : "系統"
  const ariaLabel = `${roleLabel}訊息，於 ${new Date(turn.ts).toLocaleString()} 發送${
    index !== undefined && total !== undefined ? `，第 ${index + 1} 條訊息，共 ${total} 條` : ""
  }`

  return (
    <div
      role="article"
      aria-label={ariaLabel}
      className={`max-w-[95%] rounded-xl px-4 py-3 leading-relaxed ${
        isUser ? "self-end bg-brand-500 text-white shadow-md" : "self-start bg-white border border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${isUser ? "text-white" : "text-slate-600"}`}>
        {isUser ? "User" : turn.role === "assistant" ? "Assistant" : "System"}
      </p>
      <p className="mt-1.5 text-sm">{turn.text}</p>
      <p className={`mt-2 text-xs font-mono ${isUser ? "text-white/95 text-right" : "text-slate-600 text-left"}`}>
        {new Date(turn.ts).toLocaleTimeString()}
      </p>
    </div>
  )
}


function ParamsSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">自動偵測</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function MiniCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2.5 shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-1.5 space-y-0.5 text-sm text-slate-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  )
}

function SpeakingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 font-semibold shadow-sm">
      <span className="flex gap-1">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]"></span>
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]"></span>
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500"></span>
      </span>
      <span>正在朗讀</span>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="self-start rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1">
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]"></span>
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]"></span>
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-slate-500"></span>
        </div>
        <span className="text-sm font-medium text-slate-700">正在思考...</span>
      </div>
    </div>
  )
}
