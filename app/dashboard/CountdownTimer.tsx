"use client"

import { useState, useEffect } from "react"

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date()
      const SGT_OFFSET_MS = 8 * 60 * 60 * 1000
      const nowSGT = new Date(now.getTime() + SGT_OFFSET_MS)
      
      // Next midnight in SGT (subtract offset to convert back to UTC timestamp)
      const midnightSGT = new Date(Date.UTC(
        nowSGT.getUTCFullYear(),
        nowSGT.getUTCMonth(),
        nowSGT.getUTCDate() + 1,
        0, 0, 0, 0
      ) - SGT_OFFSET_MS)
      
      const diff = midnightSGT.getTime() - now.getTime()
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    setTimeLeft(calculateTimeLeft())
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <p className="text-base text-[#888888] uppercase tracking-widest mb-3">Resets in</p>
      <p className="text-5xl font-mono font-bold text-white">{timeLeft}</p>
    </div>
  )
}
