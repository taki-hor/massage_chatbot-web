import { z } from "zod"
import { RobotStatusSchema } from "./robot"

export type RobotStatus = z.infer<typeof RobotStatusSchema>

// Branded types for type safety
export type SessionId = string & { readonly __brand: "SessionId" }
export type PatientId = string & { readonly __brand: "PatientId" }

export const brandSessionId = (id: string): SessionId => id as SessionId
export const brandPatientId = (id: string): PatientId => id as PatientId

// Voice configuration with available voices
export const VoiceConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string().default("zh-TW"),
  gender: z.enum(["male", "female", "neutral"]).optional(),
})
export type VoiceConfig = z.infer<typeof VoiceConfigSchema>

export const TTSConfigSchema = z.object({
  voice: z.string().default("default"),
  speed: z.number().min(0.5).max(2).default(1),
  volume: z.number().min(0).max(1).default(1),
  overlap_protection: z.boolean().default(true),
  strategy: z.enum(["interrupt", "queue", "ignore"]).default("interrupt"),
})
export type TTSConfig = z.infer<typeof TTSConfigSchema>

export const SessionCreateSchema = z.object({
  patient_id: z.string().min(1),
  goal: z.string().min(1),
  tts: TTSConfigSchema.optional(),
})
export type SessionCreate = z.infer<typeof SessionCreateSchema>

export const SessionSchema = z.object({
  id: z.string(),
  started_at: z.string(),
  status: z.enum(["created", "running", "paused", "stopped", "error"]).default("created"),
})
export type Session = z.infer<typeof SessionSchema>

export const SessionStatusSchema = z.object({
  session: SessionSchema,
  robot: RobotStatusSchema,
})
export type SessionStatus = z.infer<typeof SessionStatusSchema>

export const ChatTurnSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("assistant"),
  text: z.string(),
  ts: z.string(),
})
export type ChatTurn = z.infer<typeof ChatTurnSchema>

export const SessionLogSchema = z.object({
  id: z.string(),
  ts: z.string(),
  level: z.enum(["info", "warning", "error"]).default("info"),
  message: z.string(),
})
export type SessionLog = z.infer<typeof SessionLogSchema>

// Additional schemas for pause/resume and session management
export const PauseSessionSchema = z.object({
  reason: z.string().optional(),
})
export type PauseSession = z.infer<typeof PauseSessionSchema>

export const ResumeSessionSchema = z.object({
  from_checkpoint: z.boolean().default(false),
})
export type ResumeSession = z.infer<typeof ResumeSessionSchema>

export const SessionListItemSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  goal: z.string(),
  status: z.enum(["created", "running", "paused", "stopped", "error"]),
  started_at: z.string(),
  updated_at: z.string(),
  duration_seconds: z.number().optional(),
})
export type SessionListItem = z.infer<typeof SessionListItemSchema>

export const SessionListSchema = z.array(SessionListItemSchema)
export type SessionList = z.infer<typeof SessionListSchema>
