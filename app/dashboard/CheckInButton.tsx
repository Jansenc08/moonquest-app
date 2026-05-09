"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { checkIn } from "./actions"
import { Loader2, Check, Sparkles } from "lucide-react"

interface CheckInButtonProps {
  hasCheckedIn: boolean
}

export function CheckInButton({ hasCheckedIn }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [checked, setChecked] = useState(hasCheckedIn)
  const [result, setResult] = useState<{ pointsEarned?: number; newStreak?: number } | null>(null)

  async function performCheckIn() {
    setIsLoading(true)
    const checkInResult = await checkIn()
    setIsLoading(false)

    if (checkInResult.success) {
      setChecked(true)
      setResult({ pointsEarned: checkInResult.pointsEarned, newStreak: checkInResult.newStreak })
    }
  }

  if (checked) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635] font-medium">
          <Check className="h-5 w-5" />
          {result ? (
            <span>+{result.pointsEarned} pts earned! Streak: {result.newStreak} 🔥</span>
          ) : (
            <span>Come back tomorrow ✓</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <Button
      onClick={performCheckIn}
      disabled={isLoading}
      className="h-14 px-10 bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-semibold text-lg shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] transition-all"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Sparkles className="h-5 w-5 mr-2" />
          Check In Now
        </>
      )}
    </Button>
  )
}
