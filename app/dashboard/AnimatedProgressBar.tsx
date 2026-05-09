"use client"

import { useState, useEffect } from "react"

interface AnimatedProgressBarProps {
  progress: number
  className?: string
}

export function AnimatedProgressBar({
  progress,
  className = "",
}: AnimatedProgressBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(progress)
    }, 100)

    return () => clearTimeout(timer)
  }, [progress])

  return (
    <div className={`w-full h-5 bg-[#222222] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-[#a3e635] rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      >
        <div className="absolute inset-0 animate-progress-shine" />
      </div>
    </div>
  )
}
