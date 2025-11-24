import { z } from "zod"

export const RobotStatusSchema = z.object({
  connected: z.boolean(),
  mode: z.enum(["idle", "freedrive", "force_control", "running"]).optional(),
  load_kg: z.number().optional(),
  warnings: z.array(z.string()).default([]),
})

export type RobotStatus = z.infer<typeof RobotStatusSchema>
