import { Toaster as SonnerToaster, toast } from "sonner"

export { toast }

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-slate-900/90 border border-white/10 text-slate-50",
        },
      }}
    />
  )
}
