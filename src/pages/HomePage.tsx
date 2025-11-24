import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

export default function HomePage() {
  const shortcuts = [
    { title: "Session", to: "/session", description: "Create and control chat/massage sessions." },
    { title: "Robot", to: "/robot", description: "Check UR10e connectivity and live status." },
    { title: "TTS", to: "/tts", description: "Tune voice, speed, and overlap protection." },
    { title: "Logs", to: "/logs", description: "Inspect system and LLM logs for debugging." },
  ]

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-indigo-900/40 p-8 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <div className="space-y-3 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Massage Chatbot Console</p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Rebuilt frontend on Vite + React + TypeScript + Tailwind
          </h1>
          <p className="text-lg text-slate-200">
            This shell talks to the existing Python backend (`server_qwen.py`) via REST. Start with the Session
            workflow, keep the proxy at `/api`, and opt into mocks with `VITE_USE_MOCKS=true` when the backend is not
            available.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/session">Start a session</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/robot">Robot status</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((item) => (
          <Card key={item.to} className="transition hover:-translate-y-1 hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-500/20">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" asChild>
                <Link to={item.to}>Open {item.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
