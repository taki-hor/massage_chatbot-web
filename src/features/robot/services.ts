import { api } from "@/shared/lib/api"
import { RobotStatusSchema, type RobotStatus } from "@/shared/types/robot"

export const fetchRobotStatus = () => api("/api/robot/status", { method: "GET" }, RobotStatusSchema)

export type RobotService = {
  fetchRobotStatus: () => Promise<RobotStatus>
}
