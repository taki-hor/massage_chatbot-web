import { z } from "zod"
import { api } from "@/shared/lib/api"
import {
  ChatTurnSchema,
  SessionLogSchema,
  SessionSchema,
  SessionStatusSchema,
  type ChatTurn,
  type SessionCreate,
  type SessionLog,
  type SessionStatus,
} from "@/shared/types/session"

export const createSession = (payload: SessionCreate) =>
  api("/api/sessions", { method: "POST", body: JSON.stringify(payload) }, SessionSchema)

export const startSession = (id: string) =>
  api(`/api/sessions/${id}/start`, { method: "POST" }, SessionSchema)

export const stopSession = (id: string) =>
  api(`/api/sessions/${id}/stop`, { method: "POST" }, SessionSchema)

export const fetchSessionStatus = (id: string) =>
  api(`/api/sessions/${id}/status`, { method: "GET" }, SessionStatusSchema)

export const fetchSessionLogs = (id: string) =>
  api(`/api/sessions/${id}/logs`, { method: "GET" }, z.array(SessionLogSchema))

export const sendSessionChat = (id: string, text: string) =>
  api(`/api/sessions/${id}/chat`, { method: "POST", body: JSON.stringify({ text }) }, z.array(ChatTurnSchema))

export type SessionService = {
  createSession: typeof createSession
  startSession: typeof startSession
  stopSession: typeof stopSession
  fetchSessionStatus: (id: string) => Promise<SessionStatus>
  fetchSessionLogs: (id: string) => Promise<SessionLog[]>
  sendSessionChat: (id: string, text: string) => Promise<ChatTurn[]>
}
