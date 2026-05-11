"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { SpinWheel } from "./SpinWheel"

interface SpinResult {
  points_earned: number
  label: string
  segment_index: number
  new_balance: number
}

interface SpinWheelSectionProps {
  initialHasSpun: boolean
  onSpinComplete?: (result: SpinResult) => void
}

export function SpinWheelSection({ initialHasSpun, onSpinComplete }: SpinWheelSectionProps) {
  const [hasSpunToday, setHasSpunToday] = useState(initialHasSpun)

  function handleSpinComplete(result: SpinResult) {
    setHasSpunToday(true)
    if (onSpinComplete) {
      onSpinComplete(result)
    }
  }

  return (
    <section id="spin-section" className="mb-16 animate-slide-up scroll-mt-28" style={{ animationDelay: "100ms" }}>
      <div className="mb-8">
        <p className="text-base text-[#a3e635] uppercase tracking-widest mb-2">
          Daily Spin
        </p>
        <h2 className="text-4xl font-bold text-white">
          Spin to Win
        </h2>
      </div>
      
      <Card className="bg-[#111111] border-[#1a1a1a] rounded-2xl">
        <CardContent className="p-8 lg:p-10">
          <SpinWheel 
            hasSpunToday={hasSpunToday} 
            onSpinComplete={handleSpinComplete}
          />
        </CardContent>
      </Card>
    </section>
  )
}
