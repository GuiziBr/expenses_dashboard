"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxOption {
  id: string
  value: string
  label: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  value: string[]
  onChange: (value: string[]) => void
  className?: string
  icon?: React.ElementType
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  className,
  icon: Icon
}: CheckboxGroupProps) {
  const toggleOption = (optionValue: string) => {
    const isChecked = value.includes(optionValue)
    if (isChecked) {
      onChange([])
    } else {
      onChange([optionValue])
    }
  }

  return (
    <div className={cn("flex gap-3 p-3 bg-container-background rounded-md border-2 border-container-background focus-within:border-orange", className)}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="size-5 text-iron-gray" />}
      </div>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => {
          const isChecked = value.includes(option.value)
          return (
            <label
              key={option.id}
              className="flex items-center gap-2 cursor-pointer group select-none"
            >
              <div
                className={cn(
                  "size-5 rounded border-2 flex items-center justify-center transition-colors shrink-0",
                  isChecked
                    ? "bg-orange border-orange"
                    : "border-iron-gray group-hover:border-orange"
                )}
              >
                {isChecked && (
                  <svg
                    className="size-3.5 text-background"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={isChecked}
                onChange={() => toggleOption(option.value)}
              />
              <span className="text-base font-medium text-input-text">
                {option.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
