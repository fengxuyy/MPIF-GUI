import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "border border-purple-300 bg-purple-300 text-purple-950 shadow-sm shadow-purple-500/15 hover:border-purple-400 hover:bg-purple-400 hover:text-purple-950 hover:shadow-md hover:shadow-purple-500/20 dark:border-purple-500 dark:bg-purple-500 dark:text-zinc-950 dark:hover:border-purple-400 dark:hover:bg-purple-400",
        destructive:
          "border border-red-700 bg-red-700 text-white shadow-sm shadow-red-700/20 hover:bg-red-600 hover:border-red-600 hover:shadow-md hover:shadow-red-700/20 dark:border-red-500 dark:bg-red-500 dark:text-white dark:hover:bg-red-400 dark:hover:border-red-400",
        outline:
          "border border-zinc-300 bg-white text-zinc-900 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-white",
        secondary:
          "border border-purple-200 bg-purple-100 text-purple-950 shadow-sm hover:border-purple-300 hover:bg-purple-200 hover:text-purple-950 dark:border-purple-800 dark:bg-purple-950/70 dark:text-purple-100 dark:hover:border-purple-700 dark:hover:bg-purple-900/80",
        ghost: "border border-transparent bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white",
        link: "text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
