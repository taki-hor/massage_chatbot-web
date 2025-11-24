import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-70",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-brand-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 focus-visible:outline-indigo-400",
        ghost: "text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-400",
        outline:
          "border-2 border-slate-400 bg-white text-slate-900 hover:bg-slate-100 hover:border-slate-500 focus-visible:outline-slate-400 shadow-sm",
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  },
)
Button.displayName = "Button"
