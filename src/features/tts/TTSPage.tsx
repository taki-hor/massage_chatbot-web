import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

export default function TTSPage() {
  return (
    <Card className="border-white/15 bg-white/5">
      <CardHeader>
        <CardTitle>TTS 設定</CardTitle>
        <CardDescription>預留給語音配置、播放佇列與重疊保護的介面</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-200">
        <p>依 PROJECT_GUIDE 建議，後續在此加入：</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>聲音、語速、音量與重疊策略（interrupt/queue/ignore）</li>
          <li>播放中 / 佇列中語音卡片</li>
          <li>React Query hooks 連動後端 TTS API</li>
        </ul>
      </CardContent>
    </Card>
  )
}
