import { z } from "zod"
import { mockApi } from "@/mocks/mockApi"

const BASE = import.meta.env.VITE_API_BASE || ""
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true"

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(status: number, body?: unknown, message?: string) {
    super(message ?? `API Error ${status}`)
    this.status = status
    this.body = body
  }
}

async function parseJson(res: Response) {
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export async function api<T>(path: string, init?: RequestInit, schema?: z.ZodType<T>): Promise<T> {
  if (USE_MOCKS) {
    const payload = await mockApi<T>(path, init)
    return schema ? schema.parse(payload) : (payload as T)
  }

  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const json = await parseJson(res)

  if (!res.ok) {
    throw new ApiError(res.status, json)
  }

  return schema ? schema.parse(json) : (json as T)
}
