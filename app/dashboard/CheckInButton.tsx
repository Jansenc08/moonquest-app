"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { checkIn } from "./actions"
import { CheckCircle2, Loader2, Flame } from "lucide-react"

interface CheckInButtonProps {
  hasCheckedIn: boolean
  compact?: boolean
  fullWidth?: boolean
}

export function CheckInButton({ hasCheckedIn, compact, fullWidth }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(hasCheckedIn)
  const [result, setResult] = useState<{
    pointsEarned: number
    newStreak: number
  } | null>(null)

  async function performCheckIn() {
    setLoading(true)
    try {
      const response = await checkIn()
      if (response.success && response.pointsEarned !== undefined) {
        setChecked(true)
        setResult({
          pointsEarned: response.pointsEarned,
          newStreak: response.newStreak || 0,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (checked) {
    if (compact) {
      return (
        <div className="text-center">
          {result && (
            <p className="text-[#a3e635] font-semibold text-sm mb-1">+{result.pointsEarned} pts!</p>
          )}
          <div className="flex items-center justify-center gap-1.5 text-[#888888]">
            <CheckCircle2 className="h-4 w-4 text-[#a3e635]" />
            <span className="text-sm">Done for today</span>
          </div>
        </div>
      )
    }

    return (
      <div className="text-center">
        {result ? (
          <div className="mb-4">
            <p className="text-[#a3e635] font-bold text-xl">+{result.pointsEarned} pts earned!</p>
            <p className="text-sm text-[#888888] flex items-center justify-center gap-1">Day {result.newStreak} streak <Flame className="h-4 w-4 text-orange-500" /></p>
          </div>
        ) : null}
        <div className="flex items-center justify-center gap-2 text-[#888888]">
          <CheckCircle2 className="h-6 w-6 text-[#a3e635]" />
          <span className="text-lg">Come back tomorrow</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <Button
        className={`bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-bold text-base h-[52px] rounded-lg ${fullWidth ? "w-full" : ""}`}
        onClick={performCheckIn}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Checking in...
          </>
        ) : (
          "Check In"
        )}
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-bold text-lg px-10 py-7 h-auto rounded-xl shadow-[0_0_24px_rgba(163,230,53,0.3)] hover:shadow-[0_0_32px_rgba(163,230,53,0.5)] transition-all"
      onClick={performCheckIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Checking in...
        </>
      ) : (
        "Check In Now"
      )}
    </Button>
  )
}
