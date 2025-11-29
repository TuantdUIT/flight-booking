"use client"
import { CheckCircle2, X } from "lucide-react"
import { cn } from "@/src/core/utils"

interface SuccessBannerProps {
  message: string
  onDismiss?: () => void
  className?: string
}

export function SuccessBanner({ message, onDismiss, className }: SuccessBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-success",
        className,
      )}
      role="alert"
    >
      <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:bg-success/10 rounded p-1 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
