import { useState, useCallback, useMemo } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "@/shared/components/ui/sonner"
import type { ChatTurn } from "@/shared/types/session"
import {
  fetchSessionLogs,
  fetchSessionStatus,
  sendSessionChat,
  startSession,
  stopSession,
} from "../services"
import { useCreateSession } from "./useCreateSession"
import { SessionCreateSchema } from "@/shared/types/session"

const FormSchema = SessionCreateSchema.pick({ patient_id: true, goal: true })
type FormData = z.infer<typeof FormSchema>

export interface QuickParams {
  bodyPart: string
  action: string
  intensity: string
  duration: string
}

const INITIAL_CHAT_HISTORY: ChatTurn[] = [
  {
    role: "assistant",
    text: "您好！我是您的智能按摩護理助手。請告訴我您需要什麼幫助，支持語音指令控制。",
    ts: new Date().toISOString(),
  },
]

/**
 * Custom hook to manage session state and operations
 * Extracts all session-related logic from SessionPage component
 */
export function useSessionController() {
  // Form state
  const [form, setForm] = useState<FormData>({ patient_id: "", goal: "放鬆肩頸" })

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Chat state
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>(INITIAL_CHAT_HISTORY)
  const [speaking, setSpeaking] = useState(false)

  // Quick params state
  const [quickParams, setQuickParams] = useState<QuickParams>({
    bodyPart: "",
    action: "",
    intensity: "",
    duration: "",
  })

  // Mutations
  const createMut = useCreateSession()
  const startMut = useMutation({ mutationFn: startSession })
  const stopMut = useMutation({ mutationFn: stopSession })
  const chatMut = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => sendSessionChat(id, text),
    onMutate: () => setSpeaking(true),
    onSuccess: (data) => {
      setChatHistory(data)
      setMessage("")
    },
    onSettled: () => {
      setTimeout(() => setSpeaking(false), 800)
    },
  })

  // Queries
  const statusQuery = useQuery({
    queryKey: ["session-status", sessionId],
    queryFn: () => fetchSessionStatus(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      // Smart polling: faster when running, slower when idle
      const status = query.state.data?.session.status
      return status === "running" ? 2000 : 10000
    },
  })

  const logsQuery = useQuery({
    queryKey: ["session-logs", sessionId],
    queryFn: () => fetchSessionLogs(sessionId!),
    enabled: Boolean(sessionId),
  })

  // Derived state
  const busy = createMut.isPending || startMut.isPending || stopMut.isPending
  const sessionStatus = statusQuery.data?.session.status ?? "idle"
  const robotStatus = statusQuery.data?.robot

  const sessionLabel = useMemo(() => {
    if (!sessionId) return "尚未建立"
    return `${sessionId.slice(0, 8)}…`
  }, [sessionId])

  // Handlers
  const handleCreate = useCallback(async () => {
    const parsed = FormSchema.safeParse(form)
    if (!parsed.success) {
      toast.error("請完整填寫病人 ID 與目標")
      return
    }
    try {
      const session = await createMut.mutateAsync(parsed.data)
      setSessionId(session.id)
      toast.success("Session 已建立")
    } catch (err: any) {
      toast.error(err?.message ?? "建立失敗")
    }
  }, [form, createMut])

  const handleStart = useCallback(async () => {
    if (!sessionId) return
    try {
      await startMut.mutateAsync(sessionId)
      toast.success("Session 已開始")
      statusQuery.refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "啟動失敗")
    }
  }, [sessionId, startMut, statusQuery])

  const handleStop = useCallback(async () => {
    if (!sessionId) return
    try {
      await stopMut.mutateAsync(sessionId)
      toast.success("Session 已停止")
      statusQuery.refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "停止失敗")
    }
  }, [sessionId, stopMut, statusQuery])

  const handleSendMessage = useCallback(async () => {
    if (!sessionId || !message.trim()) return

    // Add user message to history immediately (optimistic update)
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: message.trim(), ts: new Date().toISOString() },
    ])

    try {
      await chatMut.mutateAsync({ id: sessionId, text: message.trim() })
      toast.success("訊息已送出")
      logsQuery.refetch()
    } catch (err: any) {
      toast.error(err?.message ?? "送出失敗")
      // Optionally: remove the optimistically added message on error
    }
  }, [sessionId, message, chatMut, logsQuery])

  const handleQuickPlan = useCallback(() => {
    setMessage("使用放鬆肩頸預設：輕柔揉捏 5 分鐘。")
    toast("已套用快速方案")
  }, [])

  const handleExecuteQuickParams = useCallback(async () => {
    const text = `請幫我按摩${quickParams.bodyPart || "肩頸"}，動作${
      quickParams.action || "揉捏"
    }，力度${quickParams.intensity || "適中"}，時間${quickParams.duration || "5"}分鐘。`
    setMessage(text)
    await handleSendMessage()
  }, [quickParams, handleSendMessage])

  return {
    // State
    form,
    setForm,
    sessionId,
    message,
    setMessage,
    chatHistory,
    speaking,
    quickParams,
    setQuickParams,

    // Derived state
    busy,
    sessionStatus,
    robotStatus,
    sessionLabel,

    // Queries
    statusQuery,
    logsQuery,

    // Mutations
    createMut,
    startMut,
    stopMut,
    chatMut,

    // Handlers
    handleCreate,
    handleStart,
    handleStop,
    handleSendMessage,
    handleQuickPlan,
    handleExecuteQuickParams,
  }
}
