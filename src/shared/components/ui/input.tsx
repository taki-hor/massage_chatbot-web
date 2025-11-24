import * as React from "react"
import { cn } from "@/shared/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border-2 border-slate-400 bg-white px-4 text-sm font-medium text-slate-900 placeholder:text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100 disabled:text-slate-700 disabled:border-slate-400 disabled:cursor-not-allowed",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"
