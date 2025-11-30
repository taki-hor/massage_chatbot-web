import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

/**
 * 日誌頁面 - 佔位符
 */
export function LogsPage() {
  return (
    <div className="h-full overflow-auto p-6">
      <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-slate-800">系統日誌</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-500 text-center py-8">
            日誌功能開發中...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogsPage
