import { useState, useCallback, useEffect, useRef } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  MassageMode,
  Intensity,
  Expression,
  MassageStatus,
  MassageState,
  UserFeedback,
} from "../types"
import { MODE_LABELS, INTENSITY_LABELS } from "../types"
import {
  createSession,
  startSession,
  stopSession,
  sendSessionChat,
  fetchSessionStatus,
} from "@/features/session/services"

interface UseSimpleMassageOptions {
  patientId?: string
}

/**
 * 簡約按摩控制 Hook
 * 管理按摩狀態、模式、力度和表情反饋
 */
export function useSimpleMassage(options: UseSimpleMassageOptions = {}) {
  const { patientId = "default-patient" } = options

  // 核心狀態
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mode, setMode] = useState<MassageMode>("knead")
  const [intensity, setIntensity] = useState<Intensity>("medium")
  const [expression, setExpression] = useState<Expression>("normal")
  const [status, setStatus] = useState<MassageStatus>("idle")
  const [duration, setDuration] = useState(0)
  const [feedbackHistory, setFeedbackHistory] = useState<UserFeedback[]>([])

  // 計時器引用
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 查詢會話狀態
  const statusQuery = useQuery({
    queryKey: ["session-status", sessionId],
    queryFn: () => fetchSessionStatus(sessionId!),
    enabled: Boolean(sessionId) && status === "running",
    refetchInterval: 2000,
  })

  // 創建會話
  const createMutation = useMutation({
    mutationFn: () =>
      createSession({
        patient_id: patientId,
        goal: `小腿${MODE_LABELS[mode]}按摩`,
      }),
    onSuccess: (data) => {
      setSessionId(data.id)
      toast.success("會話已創建")
    },
    onError: (error) => {
      toast.error(`創建會話失敗: ${error.message}`)
    },
  })

  // 開始會話
  const startMutation = useMutation({
    mutationFn: (id: string) => startSession(id),
    onSuccess: () => {
      setStatus("running")
      toast.success("按摩已開始")
    },
    onError: (error) => {
      toast.error(`開始失敗: ${error.message}`)
    },
  })

  // 停止會話
  const stopMutation = useMutation({
    mutationFn: (id: string) => stopSession(id),
    onSuccess: () => {
      setStatus("idle")
      setDuration(0)
      toast.info("按摩已停止")
    },
    onError: (error) => {
      toast.error(`停止失敗: ${error.message}`)
    },
  })

  // 發送聊天消息（用於控制指令）
  const chatMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      sendSessionChat(id, text),
    onError: (error) => {
      toast.error(`發送指令失敗: ${error.message}`)
    },
  })

  // 開始按摩
  const handleStart = useCallback(async () => {
    try {
      // 如果沒有會話，先創建
      if (!sessionId) {
        const result = await createMutation.mutateAsync()
        await startMutation.mutateAsync(result.id)
        // 發送初始配置
        await chatMutation.mutateAsync({
          id: result.id,
          text: `開始小腿${MODE_LABELS[mode]}按摩，力度${INTENSITY_LABELS[intensity]}`,
        })
      } else {
        await startMutation.mutateAsync(sessionId)
      }
    } catch (error) {
      console.error("Start massage failed:", error)
    }
  }, [sessionId, mode, intensity, createMutation, startMutation, chatMutation])

  // 停止按摩
  const handleStop = useCallback(async () => {
    if (sessionId) {
      await stopMutation.mutateAsync(sessionId)
    }
  }, [sessionId, stopMutation])

  // 暫停按摩
  const handlePause = useCallback(() => {
    if (status === "running") {
      setStatus("paused")
      toast.info("按摩已暫停")
    } else if (status === "paused") {
      setStatus("running")
      toast.success("按摩已繼續")
    }
  }, [status])

  // 更改模式
  const handleModeChange = useCallback(
    async (newMode: MassageMode) => {
      setMode(newMode)

      // 如果正在運行，發送更新指令
      if (sessionId && status === "running") {
        await chatMutation.mutateAsync({
          id: sessionId,
          text: `切換到${MODE_LABELS[newMode]}模式`,
        })
        toast.success(`已切換到${MODE_LABELS[newMode]}模式`)
      }
    },
    [sessionId, status, chatMutation]
  )

  // 更改力度
  const handleIntensityChange = useCallback(
    async (newIntensity: Intensity) => {
      setIntensity(newIntensity)

      // 如果正在運行，發送更新指令
      if (sessionId && status === "running") {
        await chatMutation.mutateAsync({
          id: sessionId,
          text: `調整力度到${INTENSITY_LABELS[newIntensity]}`,
        })
        toast.success(`力度已調整為${INTENSITY_LABELS[newIntensity]}`)
      }
    },
    [sessionId, status, chatMutation]
  )

  // 用戶反饋
  const handleFeedback = useCallback(
    async (newExpression: Expression) => {
      setExpression(newExpression)

      // 記錄反饋歷史
      const feedback: UserFeedback = {
        expression: newExpression,
        timestamp: Date.now(),
      }
      setFeedbackHistory((prev) => [...prev, feedback])

      // 如果正在運行，發送反饋
      if (sessionId && status === "running") {
        const feedbackText = {
          comfortable: "感覺很舒服，請保持",
          normal: "感覺一般",
          "slight-pain": "有點痛，請減輕力度",
          "severe-pain": "太痛了，請停止或大幅減輕",
        }

        await chatMutation.mutateAsync({
          id: sessionId,
          text: feedbackText[newExpression],
        })

        // 如果太痛，自動減輕力度
        if (newExpression === "severe-pain" && intensity !== "low") {
          const newIntensity: Intensity =
            intensity === "high" ? "medium" : "low"
          setIntensity(newIntensity)
          toast.warning(`已自動將力度調整為${INTENSITY_LABELS[newIntensity]}`)
        }
      }
    },
    [sessionId, status, intensity, chatMutation]
  )

  // 計時器邏輯
  useEffect(() => {
    if (status === "running") {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])

  // 根據力度自動調整表情（如果沒有用戶反饋）
  useEffect(() => {
    if (status === "running" && feedbackHistory.length === 0) {
      const intensityToExpression: Record<Intensity, Expression> = {
        low: "comfortable",
        medium: "normal",
        high: "slight-pain",
      }
      setExpression(intensityToExpression[intensity])
    }
  }, [intensity, status, feedbackHistory.length])

  // 清理會話
  const handleReset = useCallback(() => {
    setSessionId(null)
    setStatus("idle")
    setDuration(0)
    setExpression("normal")
    setFeedbackHistory([])
    toast.info("會話已重置")
  }, [])

  // 獲取當前狀態
  const state: MassageState = {
    mode,
    intensity,
    expression,
    status,
    duration,
    sessionId,
  }

  return {
    // 狀態
    state,
    mode,
    intensity,
    expression,
    status,
    duration,
    sessionId,
    feedbackHistory,

    // 查詢狀態
    isLoading:
      createMutation.isPending ||
      startMutation.isPending ||
      stopMutation.isPending,
    robotConnected: statusQuery.data?.robot?.connected ?? false,

    // 操作方法
    setMode: handleModeChange,
    setIntensity: handleIntensityChange,
    setExpression: handleFeedback,
    start: handleStart,
    stop: handleStop,
    pause: handlePause,
    reset: handleReset,
  }
}

export default useSimpleMassage
