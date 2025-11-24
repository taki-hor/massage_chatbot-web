import { z } from "zod"
import {
  ChatTurnSchema,
  SessionCreateSchema,
  SessionLogSchema,
  SessionStatusSchema,
  type ChatTurn,
  type Session,
  type SessionLog,
  type SessionStatus,
} from "@/shared/types/session"
import { RobotStatusSchema, type RobotStatus } from "@/shared/types/robot"

type SessionRecord = {
  session: Session
  meta: {
    patient_id: string
    goal: string
  }
}

const sessions = new Map<string, SessionRecord>()

let robotStatus: RobotStatus = {
  connected: true,
  mode: "idle",
  load_kg: 2.4,
  warnings: [],
}

const logs = new Map<string, SessionLog[]>()
const chatHistory = new Map<string, ChatTurn[]>()

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function requireSession(id: string) {
  const record = sessions.get(id)
  if (!record) {
    const err = new Error("Session not found")
    ;(err as any).status = 404
    throw err
  }
  return record
}

function updateRobotForSession(status: Session["status"]) {
  robotStatus = {
    ...robotStatus,
    mode:
      status === "running"
        ? "running"
        : status === "paused"
          ? "freedrive"
          : "idle",
    warnings: status === "error" ? ["controller_error"] : [],
  }
}

async function handleSessionRoutes(path: string[], method: string, init?: RequestInit) {
  // /api/sessions
  if (path.length === 2 && method === "POST") {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const payload = SessionCreateSchema.parse(body)
    const id = crypto.randomUUID()
    const session: Session = {
      id,
      started_at: new Date().toISOString(),
      status: "created",
    }
    sessions.set(id, { session, meta: { patient_id: payload.patient_id, goal: payload.goal } })
    logs.set(id, [
      {
        id: `${id}-log-1`,
        ts: new Date().toISOString(),
        level: "info",
        message: `Session created for patient ${payload.patient_id} (${payload.goal})`,
      },
    ])
    chatHistory.set(id, [
      { role: "system", text: "Welcome to the massage assistant.", ts: new Date().toISOString() },
    ])
    await delay()
    return session
  }

  const sessionId = path[2]
  const record = sessionId ? requireSession(sessionId) : null

  if (!record) throw new Error("Invalid session id")

  if (path[3] === "start" && method === "POST") {
    record.session = { ...record.session, status: "running", started_at: new Date().toISOString() }
    updateRobotForSession("running")
    await delay()
    return record.session
  }

  if (path[3] === "stop" && method === "POST") {
    record.session = { ...record.session, status: "stopped" }
    updateRobotForSession("stopped")
    await delay()
    return record.session
  }

  if (path[3] === "status" && method === "GET") {
    const payload: SessionStatus = { session: record.session, robot: robotStatus }
    await delay()
    return SessionStatusSchema.parse(payload)
  }

  if (path[3] === "chat" && method === "POST") {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    const parsed = ChatTurnSchema.pick({ text: true }).extend({ role: z.enum(["user"]) }).parse({
      ...body,
      role: "user",
    })
    const history = chatHistory.get(sessionId) || []
    history.push({ role: "user", text: parsed.text, ts: new Date().toISOString() })
    history.push({
      role: "assistant",
      text: "Acknowledged. Robot will adjust massage routine.",
      ts: new Date().toISOString(),
    })
    chatHistory.set(sessionId, history)
    await delay()
    return history
  }

  if (path[3] === "logs" && method === "GET") {
    const list = logs.get(sessionId) || []
    await delay()
    return z.array(SessionLogSchema).parse(list)
  }

  throw new Error(`Unsupported session route: ${path.join("/")}`)
}

export async function mockApi<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || "GET").toUpperCase()
  const url = new URL(path, "http://local.mock")
  const segments = url.pathname.split("/").filter(Boolean)

  if (segments[0] !== "api") {
    throw new Error("Only /api routes are mocked")
  }

  if (segments[1] === "sessions") {
    return (await handleSessionRoutes(segments, method, init)) as T
  }

  if (segments[1] === "robot" && segments[2] === "status" && method === "GET") {
    await delay()
    return RobotStatusSchema.parse(robotStatus) as T
  }

  throw new Error(`Unhandled mock route: ${segments.join("/")}`)
}
