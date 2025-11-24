import { useQuery } from "@tanstack/react-query"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { fetchRobotStatus } from "./services"

export default function RobotPage() {
  const statusQuery = useQuery({
    queryKey: ["robot-status"],
    queryFn: fetchRobotStatus,
    refetchInterval: 5000,
  })

  const status = statusQuery.data

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">UR10e</p>
          <h1 className="text-2xl font-semibold text-white">Robot Status</h1>
        </div>
        <Button variant="outline" onClick={() => statusQuery.refetch()} disabled={statusQuery.isFetching}>
          {statusQuery.isFetching ? "更新中..." : "手動更新"}
        </Button>
      </div>

      <Card className="border-white/15 bg-gradient-to-br from-slate-900/80 to-indigo-900/40">
        <CardHeader>
          <CardTitle>連線狀態</CardTitle>
          <CardDescription>模擬 /api/robot/status</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Connected</p>
            <p className="text-2xl font-semibold text-white">
              {status ? (status.connected ? "Online" : "Offline") : "…"}
            </p>
            <p className="text-xs text-slate-400">Mode: {status?.mode ?? "n/a"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">Payload</p>
            <p className="text-2xl font-semibold text-white">{status?.load_kg ?? 0} kg</p>
            <p className="text-xs text-slate-400">Warnings: {status?.warnings?.join(", ") || "none"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
