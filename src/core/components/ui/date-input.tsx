"use client"

import type * as React from "react"
import { cn } from "@/src/core/utils"
import { Calendar } from "lucide-react"

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string
  error?: string
}

export function DateInput({ label, error, className, id, ...props }: DateInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Calendar className="h-4 w-4" />
        </div>
        <input
          id={inputId}
          type="date"
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
