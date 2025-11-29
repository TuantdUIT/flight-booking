"use client"

import type * as React from "react"
import { cn } from "@/src/core/utils"
import { ChevronDown } from "lucide-react"

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
  icon?: React.ReactNode
}

export function SelectField({ label, error, options, icon, className, id, ...props }: SelectFieldProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={selectId}
          className={cn(
            "flex h-11 w-full appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-destructive focus:ring-destructive",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
