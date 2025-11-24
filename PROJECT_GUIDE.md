# 方案 A：新建前端、舊後端共存的完整遷移指南（Vite + React + TypeScript）

> 目標：以**全新** Vite + React + TS 前端專案（`massage_chatbot-web`）承接舊 Python 後端 API，逐步移植功能；完成後端收斂到 FastAPI（可選），前後端以明確的型別合約溝通，利於 LLM 穩定生成、維護與擴充。

---

## 1. 專案藍圖與里程碑

**M0（1–2 天）最小可用骨架**

* Vite + React + TS + Tailwind + shadcn/ui + React Router + React Query
* `.env.local` 注入 `VITE_API_BASE`，建立 `shared/lib/api.ts` fetch 包裝器
* 建立 `shared/types/*` 與 `features/session` 最小頁：建立/開始/停止對話

**M1（3–5 天）核心功能移植**

* 對話/任務工作流（Session）頁、TTS 設定頁、Log 檢視頁
* 與舊後端 API 對接（REST + 可選 WebSocket）
* 加入錯誤處理、重試、取消、載入狀態、全域通知

**M2（1 週）體驗與可視化**

* UR10e 狀態面板（連線、模式、負載、警告）
* 3D Demo（可選，React-Three-Fiber/R3F）
* 權限/設定保存（localStorage）

**M3（可選）後端收斂**

* 舊後端功能整理到 FastAPI，產出 OpenAPI → 以 `openapi-typescript` 生成 TS 型別
* 將臨時 DTO/zod schema 對齊正式 OpenAPI

---

## 2. 目錄與分層（LLM 友善）

```
massage_chatbot-web/
  src/
    app/                # App Shell、路由、Layout、全域 Providers
    shared/
      components/       # 通用 UI：表單、Modal、表格、狀態列
      hooks/            # 通用 hooks（按鍵、互斥鎖、可取消請求等）
      lib/              # api.ts、logger.ts、storage.ts、ws.ts
      types/            # DTO/Schema（zod）與 TypeScript 型別
      utils/            # 小工具：format、guard、assert
    features/
      session/          # 對話/任務流程（頁面、hooks、ui、schema）
      tts/              # 語音設定、播放佇列、重疊保護
      robot/            # UR10e 狀態面板、控制（後續接 WebSocket）
      logs/             # LLM/系統 log 檢視（時間軸/表格）
    pages/              # 路由對應頁（或用 file-based router 替代）
  public/
  index.html
  vite.config.ts
  tailwind.config.ts
```

> **命名規範**：`features/<domain>/{components,hooks,schemas,types,services}`，利於 LLM 只在單一 domain 產出/修改檔案。

---

## 3. 套件選型與設定

* **UI**：Tailwind + shadcn/ui（一致設計語言，降低 LLM CSS 走樣）
* **資料請求**：`fetch` 包裝 + **React Query**（快取/重新整理/失敗重試）
* **型別驗證**：**zod**（與 TS 搭配，防止 API 變更導致 runtime 錯）
* **路由**：React Router（多頁清晰、易於 LLM 維護）
* **狀態機（可選）**：XState（若流程複雜，如 TTS 佇列、UR10e 控制）
* **WebSocket（可選）**：原生 WS + 重新連線策略（指數退避）

**Tailwind + shadcn 核心設置**

* 初始化 `tailwind.config.ts`，加入 `./src/**/*.{ts,tsx}`
* shadcn 初始化後，將共用元件拉進 `shared/components/ui/*`

---

## 4. API 契約與資料模型（zod + TS）

> 以「契約先行」驅動 UI：先定義 schema，再讓 LLM 依型別實作頁面與請求。

```ts
// src/shared/types/session.ts
import { z } from "zod";

export const RobotStatusSchema = z.object({
  connected: z.boolean(),
  mode: z.enum(["idle", "freedrive", "force_control", "running"]).optional(),
  load_kg: z.number().optional(),
  warnings: z.array(z.string()).default([]),
});
export type RobotStatus = z.infer<typeof RobotStatusSchema>;

export const TTSConfigSchema = z.object({
  voice: z.string(),
  speed: z.number().min(0.5).max(2).default(1),
  volume: z.number().min(0).max(1).default(1),
  overlap_protection: z.boolean().default(true),
});
export type TTSConfig = z.infer<typeof TTSConfigSchema>;

export const SessionCreateSchema = z.object({
  patient_id: z.string().min(1),
  goal: z.string().min(1),
  tts: TTSConfigSchema.optional(),
});
export type SessionCreate = z.infer<typeof SessionCreateSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  started_at: z.string(),
  status: z.enum(["created", "running", "paused", "stopped", "error"]).default("created"),
});
export type Session = z.infer<typeof SessionSchema>;

export const ChatTurnSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("assistant"),
  text: z.string(),
  ts: z.string(),
});
export type ChatTurn = z.infer<typeof ChatTurnSchema>;
```

**API 端點（暫定，對齊舊後端命名）**

```
POST   /api/sessions              # 建立對話/任務
POST   /api/sessions/:id/start    # 開始
POST   /api/sessions/:id/stop     # 停止
GET    /api/sessions/:id/status   # 取得狀態（含 RobotStatus）
POST   /api/sessions/:id/chat     # 傳送使用者輸入
GET    /api/sessions/:id/logs     # 取得 LLM/系統 log
GET    /api/robot/status          # 即時狀態（或 WebSocket 推送）
```

---

## 5. `fetch` 包裝與 React Query 範式

```ts
// src/shared/lib/api.ts
import { z } from "zod";

const BASE = import.meta.env.VITE_API_BASE as string;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body?: unknown,
    message?: string,
  ) { super(message ?? `API Error ${status}`); }
}

export async function api<T>(path: string, init?: RequestInit, schema?: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, json);
  return schema ? schema.parse(json) : (json as T);
}
```

```ts
// src/features/session/services.ts
import { api } from "@/shared/lib/api";
import { Session, SessionSchema, SessionCreate } from "@/shared/types/session";

export const createSession = (payload: SessionCreate) =>
  api("/api/sessions", { method: "POST", body: JSON.stringify(payload) }, SessionSchema);

export const startSession = (id: string) =>
  api(`/api/sessions/${id}/start`, { method: "POST" }, SessionSchema);

export const stopSession = (id: string) =>
  api(`/api/sessions/${id}/stop`, { method: "POST" }, SessionSchema);
```

```ts
// src/features/session/hooks/useCreateSession.ts
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../services";

export function useCreateSession() {
  return useMutation({ mutationFn: createSession });
}
```

---

## 6. 路由與頁面骨架

```tsx
// src/app/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/shared/components/ui/sonner"; // 以 shadcn/toast 或 sonner 為例
import HomePage from "@/pages/HomePage";
import SessionPage from "@/features/session/SessionPage";
import TTSPage from "@/features/tts/TTSPage";
import RobotPage from "@/features/robot/RobotPage";
import LogsPage from "@/features/logs/LogsPage";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/tts" element={<TTSPage />} />
          <Route path="/robot" element={<RobotPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
```

---

## 7. UI 範例（Session 建立/啟停）

```tsx
// src/features/session/SessionPage.tsx
import { useState } from "react";
import { z } from "zod";
import { useCreateSession } from "./hooks/useCreateSession";
import { startSession, stopSession } from "./services";
import { SessionCreateSchema } from "@/shared/types/session";

const FormSchema = SessionCreateSchema.pick({ patient_id: true, goal: true });

type FormData = z.infer<typeof FormSchema>;

export default function SessionPage() {
  const [form, setForm] = useState<FormData>({ patient_id: "", goal: "放鬆肩頸" });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const createMut = useCreateSession();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">對話/按摩任務</h1>
      <div className="space-y-2">
        <input
          className="input input-bordered w-full"
          placeholder="病人 ID"
          value={form.patient_id}
          onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
        />
        <input
          className="input input-bordered w-full"
          placeholder="目標（如：放鬆肩頸）"
          value={form.goal}
          onChange={(e) => setForm({ ...form, goal: e.target.value })}
        />
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={async () => {
              const parsed = FormSchema.safeParse(form);
              if (!parsed.success) return alert("請完整填寫");
              const s = await createMut.mutateAsync(parsed.data);
              setSessionId(s.id);
            }}
          >建立</button>

          <button
            className="btn"
            disabled={!sessionId}
            onClick={async () => sessionId && (await startSession(sessionId))}
          >開始</button>

          <button
            className="btn btn-outline"
            disabled={!sessionId}
            onClick={async () => sessionId && (await stopSession(sessionId))}
          >停止</button>
        </div>
      </div>
    </div>
  );
}
```

> 上例使用了簡化的樣式類名，可替換為 shadcn/ui 元件（`<Input/>`, `<Button/>`）。

---

## 8. WebSocket／即時狀態（可選）

* 以 `/ws/robot` 取得 UR10e 即時狀態：位置、模式、力回饋、警告碼
* **策略**：

  * 初次連線：5s timeout，失敗顯示離線
  * 斷線重連：指數退避（1s → 2s → 4s，最大 30s）
  * 心跳：每 15s 發 `ping`，逾時視為斷線

```ts
// src/shared/lib/ws.ts
export function connectWS(path: string, onMsg: (data: any) => void) {
  const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${path}`;
  let ws: WebSocket | null = null;
  let retry = 1000;

  function open() {
    ws = new WebSocket(url);
    ws.onmessage = (e) => onMsg(JSON.parse(e.data));
    ws.onclose = () => setTimeout(open, retry = Math.min(retry * 2, 30000));
    ws.onerror = () => ws?.close();
  }
  open();
  return () => ws?.close();
}
```

---

## 9. TTS 佇列與重疊保護（前端側）

* **需求**：避免多段語音同時播放；新語音到來時按策略（打斷/排隊/忽略）處理
* **建議**：用簡單狀態機或 React `useReducer` 管理佇列

```ts
// 策略："interrupt" | "queue" | "ignore"
```

UI：

* 選擇聲音、語速、音量、策略
* 顯示「目前播放中」「佇列項目」

---

## 10. 錯誤處理與可觀測性

* **ApiError** 統一處理：401 → 重新登入／403 → 無權限提示／5xx → 回報與重試
* 全域 toast + `console.error` ；後續可接 Sentry
* React Query `onError` 統一掛鉤

---

## 11. 建置與環境

* `.env.local`：

  * `VITE_API_BASE=http://localhost:8000`
* `npm run dev`：前端 5173；後端 8000（或既有埠）
* CORS：後端允許 5173；或前端用 Vite `proxy`（`vite.config.ts`）

```ts
// vite.config.ts 片段
server: { proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } } }
```

---

## 12. 漸進式移植清單（從舊前端 → 新前端）

1. 盤點舊 repo API（`server_qwen.py` 等）：列出端點、參數、輸出
2. 以 zod 定義 DTO，先用假資料跑通 UI
3. 對接真 API；補齊錯誤處理、loading、空狀態
4. 移植 TTS 控制、語音策略、播放控件
5. 移植 UR10e 指令（僅 UI → API），**與真硬體控制解耦**
6. 移植 Log 檢視（filter、導出）
7. （可選）R3F 3D Demo 與真控制仍分離

---

## 13. 測試與質量門檻

* **單元**：hooks/services 用 vitest + msw
* **E2E**：Playwright（最小路徑：建立→開始→停止）
* **型別**：`tsc --noEmit`；zod runtime 驗證
* **CI**：lint（eslint/prettier）、typecheck、unit、e2e（可選）

---

## 14. LLM 協作規範（Prompt 範本）

**提交任務給 LLM（開發新功能）**

```
你只能修改：src/features/session/*
輸入：zod schema 與 TS 型別在 src/shared/types/session.ts
任務：在 SessionPage 新增「暫停/恢復」按鈕，呼叫 API：
POST /api/sessions/:id/pause、/resume；更新畫面狀態與按鈕 disable 條件。
請提供：
1) 影響檔案列表
2) 完整程式碼 diff 區塊
3) 手測步驟
```

**Code Review 給 LLM**

```
檢查點：
- 是否完全遵照型別與 schema？
- 失敗/取消/重試處理是否齊全？
- UI loading/disabled 是否正確？
- 是否跨越指定目錄？
```

---

## 15. 後端收斂（可選但推薦）

* 將舊 Python 服務整理至 **FastAPI**，補上 `CORSMiddleware`、OpenAPI
* 用 `openapi-typescript` 產生 TS 型別，替換手寫 DTO
* 引入 WebSocket endpoint（狀態推送），提供重放/回放測試資料

---

## 16. 交付標準（Definition of Done）

* 新前端可在本機以 `.env.local` 成功連線舊後端
* Session 功能：建立/開始/停止/狀態查詢 營運可用
* TTS：可設定基本參數，具重疊保護策略
* Robot 面板：顯示連線狀態與基本指標
* 測試最小覆蓋：typecheck + vitest 通過；E2E 1 條 happy path 通過

---

## 17. 風險與避坑

* **API 不穩**：先用 mock + zod 鎖定 UI 行為，再切真 API
* **CORS**：優先用 Vite proxy；若需跨域，後端開放 5173
* **資料型別飄移**：所有請求以 zod parse；錯誤明顯、易追蹤
* **3D 與真控制耦合**：堅持分離，避免 Demo 影響任務流程

---

## 18. 後續擴充建議

* 設定同步（雲端配置檔）；多語系（i18n）
* 錄音/上傳語音 → 伺服端 STT → 對話續接
* 角色/權限（護理員/管理員）；審計日誌
* 離線緩存與 PWA（若場域網路不穩）

---

### TL;DR

以**全新** Vite+React+TS 前端承接舊後端，契約先行（zod/TS），React Query 管理請求，shadcn/ui + Tailwind 建 UI。先跑通 Session/Robot/TTS 的最小閉環，再逐步強化與可視化，最後視需要收斂後端到 FastAPI/OpenAPI。
