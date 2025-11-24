import { BrowserRouter, Link, NavLink, Navigate, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useEffect, useState } from "react"
import HomePage from "@/pages/HomePage"
import SessionPage from "@/features/session/SessionPage"
import TTSPage from "@/features/tts/TTSPage"
import RobotPage from "@/features/robot/RobotPage"
import LogsPage from "@/features/logs/LogsPage"
import { Toaster } from "@/shared/components/ui/sonner"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { ApiError } from "@/shared/lib/api"
import { ErrorBoundary } from "@/shared/components/ErrorBoundary"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        // Retry up to 3 times for server errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, capped at 30s
        return Math.min(1000 * 2 ** attemptIndex, 30000)
      },
      refetchOnWindowFocus: false,
      staleTime: 5000, // Consider data fresh for 5 seconds
    },
    mutations: {
      retry: (failureCount, error) => {
        // Never retry mutations on client errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        // Only retry once for mutations
        return failureCount < 1
      },
    },
  },
})

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("light")

  useEffect(() => {
    const root = document.documentElement
    if (theme === "light") {
      root.classList.add("theme-light")
    } else {
      root.classList.remove("theme-light")
    }
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div
          className={cn(
            "flex h-screen min-h-screen overflow-hidden",
            theme === "light"
              ? "bg-[radial-gradient(circle_at_top_left,#fff, #e7eefb_40%,#dce5f8_70%)] text-slate-900"
              : "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100",
          )}
        >
          <div className="flex h-full w-full flex-col gap-5 px-6 py-5">
            <AppHeader theme={theme} onToggle={() => setTheme(theme === "light" ? "dark" : "light")} />
            <main className="flex-1 min-h-0 overflow-hidden">
              <ErrorBoundary>
                <div className="h-full min-h-0 overflow-hidden">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/session" element={<SessionPage />} />
                    <Route path="/tts" element={<TTSPage />} />
                    <Route path="/robot" element={<RobotPage />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

function AppHeader({ theme, onToggle }: { theme: "dark" | "light"; onToggle: () => void }) {
  const navItems = [
    { to: "/session", label: "Session" },
    { to: "/robot", label: "Robot" },
    { to: "/tts", label: "TTS" },
    { to: "/logs", label: "Logs" },
  ]

  return (
    <header
      className={cn(
        "flex flex-col gap-4 rounded-2xl border px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between",
        theme === "light"
          ? "border-[rgba(79,141,245,0.2)] bg-white/80 shadow-lg shadow-blue-100"
          : "border-white/10 bg-white/5",
      )}
    >
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
          <span className="text-lg font-bold">MC</span>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Massage Chatbot</p>
          <p className={cn("text-lg font-semibold", theme === "light" ? "text-slate-900" : "text-white")}>
            Web Console
          </p>
        </div>
        <span className="ml-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner shadow-emerald-200/60">
          專業護理版
        </span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-white/10",
                  isActive
                    ? theme === "light"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white/15 text-white"
                    : theme === "light"
                      ? "text-slate-700"
                      : "text-slate-200",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 border border-slate-200 shadow-sm">
            <span role="img" aria-label="mascot">
              🦊
            </span>
            <span>按摩助手</span>
          </div>
          <Button variant="outline" size="sm" onClick={onToggle}>
            {theme === "light" ? "切換暗色" : "切換亮色"}
          </Button>
        </div>
      </div>
    </header>
  )
}
