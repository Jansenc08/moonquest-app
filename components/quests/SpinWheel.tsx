"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Medal, ChevronDown, ChevronUp } from "lucide-react"

interface SpinResult {
  points_earned: number
  label: string
  segment_index: number
  new_balance: number
}

interface SpinWheelProps {
  hasSpunToday: boolean
  lastSpinResult?: SpinResult
  onSpinComplete?: (result: SpinResult) => void
}

type WheelState = "available" | "spinning" | "collapsed"

const segments = [
  { points: 0, label: "Better luck tomorrow", color: "#ef4444", rarity: "Miss", dotColor: "#ef4444" },
  { points: 5, label: "Nice try!", color: "#888888", rarity: "Common", dotColor: "#555555" },
  { points: 10, label: "Keep going!", color: "#888888", rarity: "Common", dotColor: "#555555" },
  { points: 15, label: "Not bad!", color: "#888888", rarity: "Common", dotColor: "#555555" },
  { points: 25, label: "Great spin!", color: "#a3e635", rarity: "Uncommon", dotColor: "#a3e635" },
  { points: 50, label: "Amazing!", color: "#a3e635", rarity: "Rare", dotColor: "#a3e635" },
  { points: 75, label: "Incredible!", color: "#a3e635", rarity: "Epic", dotColor: "#a3e635" },
  { points: 100, label: "JACKPOT!", color: "#f59e0b", rarity: "Jackpot!", dotColor: "#f59e0b" },
]

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000

function getTimeUntilMidnightSGT(): { hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const sgtNow = new Date(now.getTime() + SGT_OFFSET_MS)
  
  const midnightSGT = new Date(Date.UTC(
    sgtNow.getUTCFullYear(),
    sgtNow.getUTCMonth(),
    sgtNow.getUTCDate() + 1,
    0, 0, 0, 0
  ))
  const midnightUTC = new Date(midnightSGT.getTime() - SGT_OFFSET_MS)
  
  const diff = Math.max(0, midnightUTC.getTime() - now.getTime())
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds }
}

export function SpinWheel({ hasSpunToday, lastSpinResult, onSpinComplete }: SpinWheelProps) {
  const [wheelState, setWheelState] = useState<WheelState>(hasSpunToday ? "collapsed" : "available")
  const [spinResult, setSpinResult] = useState<SpinResult | null>(lastSpinResult || null)
  const [rotation, setRotation] = useState(0)
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [showPrizePool, setShowPrizePool] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const wheelRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    setMounted(true)
    setCountdown(getTimeUntilMidnightSGT())
    
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnightSGT())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleSpin() {
    if (wheelState !== "available") return

    setWheelState("spinning")

    try {
      const response = await fetch("/api/quests/spin", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === "Already spun today") {
          setWheelState("collapsed")
        } else {
          alert(data.error || "Failed to spin")
          setWheelState("available")
        }
        return
      }

      const result: SpinResult = {
        points_earned: data.points_earned,
        label: data.label,
        segment_index: data.segment_index,
        new_balance: data.new_balance,
      }

      setSpinResult(result)

      // Calculate rotation
      const segmentAngle = 360 / 8
      const targetAngle = 360 - (result.segment_index * segmentAngle) - (segmentAngle / 2)
      const totalRotation = rotation + (5 * 360) + targetAngle - (rotation % 360)
      
      setRotation(totalRotation)

      // Wait for animation to complete, then collapse
      setTimeout(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setWheelState("collapsed")
          setIsTransitioning(false)
          if (onSpinComplete) {
            onSpinComplete(result)
          }
        }, 300)
      }, 4200)
    } catch (error) {
      console.error("Spin error:", error)
      alert("Something went wrong. Please try again.")
      setWheelState("available")
    }
  }

  // Collapsed state view
  if (wheelState === "collapsed") {
    return (
      <div className="animate-slide-up">
        {/* Main collapsed card */}
        <div className="bg-[#0d1a00] border border-[#a3e635] rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1a3300] flex items-center justify-center shrink-0">
              <Medal className="h-6 w-6 text-[#a3e635]" />
            </div>
            <div>
              <p className="text-[11px] text-[#666666] uppercase tracking-wider mb-1">
                Daily Spin — Completed
              </p>
              {spinResult ? (
                <>
                  <p className={`text-lg font-bold ${spinResult.points_earned > 0 ? "text-[#a3e635]" : "text-[#ef4444]"}`}>
                    {spinResult.points_earned > 0 
                      ? `+${spinResult.points_earned} pts won — ${spinResult.label}` 
                      : "Better luck tomorrow!"}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {spinResult.points_earned > 0 ? "Added to your balance" : "Try again tomorrow"}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-[#a3e635]">Spin completed!</p>
              )}
            </div>
          </div>

          {/* Right side - countdown */}
          <div className="text-center md:text-right shrink-0">
            <p className="text-[11px] text-[#666666]">Next spin in</p>
            {mounted ? (
              <p className="text-[22px] font-bold text-white tabular-nums">
                {countdown.hours.toString().padStart(2, "0")}:
                {countdown.minutes.toString().padStart(2, "0")}:
                {countdown.seconds.toString().padStart(2, "0")}
              </p>
            ) : (
              <p className="text-[22px] font-bold text-white tabular-nums">
                --:--:--
              </p>
            )}
            <p className="text-[11px] text-[#666666]">Resets midnight SGT</p>
          </div>
        </div>

        {/* Expand row */}
        <div 
          className="mt-2 bg-[#111111] border border-[#1a1a1a] rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#151515] transition-colors"
          onClick={() => setShowPrizePool(!showPrizePool)}
        >
          <span className="text-xs text-[#666666]">View prize pool</span>
          {showPrizePool ? (
            <ChevronUp className="h-4 w-4 text-[#666666]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#666666]" />
          )}
        </div>

        {/* Expanded prize pool */}
        <div 
          className={`overflow-hidden transition-all duration-300 ${
            showPrizePool ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[#111111] border border-t-0 border-[#1a1a1a] rounded-b-lg px-4 py-3">
            <div className="space-y-2">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: seg.dotColor }}
                    />
                    <span className={`text-sm ${seg.points === 100 ? "text-[#f59e0b]" : "text-[#888888]"}`}>
                      {seg.rarity}
                    </span>
                  </div>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: seg.color }}
                  >
                    {seg.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full wheel view (available or spinning)
  return (
    <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
      <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* Left column - Wheel */}
        <div className="flex flex-col items-center">
          {/* Wheel container */}
          <div className="relative mb-6">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div 
                className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#a3e635]"
                style={{ filter: "drop-shadow(0 2px 4px rgba(163, 230, 53, 0.4))" }}
              />
            </div>

            {/* Wheel SVG */}
            <svg
              ref={wheelRef}
              viewBox="0 0 320 320"
              className="w-[240px] h-[240px] md:w-[320px] md:h-[320px]"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: wheelState === "spinning" ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {/* Outer ring */}
              <circle cx="160" cy="160" r="158" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              
              {/* Segments */}
              {segments.map((segment, i) => {
                const angle = (360 / 8) * i
                const startAngle = angle - 90
                const endAngle = startAngle + 45
                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                const x1 = 160 + 150 * Math.cos(startRad)
                const y1 = 160 + 150 * Math.sin(startRad)
                const x2 = 160 + 150 * Math.cos(endRad)
                const y2 = 160 + 150 * Math.sin(endRad)
                
                const midAngle = startAngle + 22.5
                const midRad = (midAngle * Math.PI) / 180
                const textX = 160 + 105 * Math.cos(midRad)
                const textY = 160 + 105 * Math.sin(midRad)

                const isGreen = i % 2 === 1
                const bgColor = isGreen ? "#0d1a00" : "#111111"
                const strokeColor = isGreen ? "#1a1a1a" : "#080808"

                const fontSize = segment.points === 100 ? 14 : segment.points >= 25 ? 13 : 12

                return (
                  <g key={i}>
                    <path
                      d={`M 160 160 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`}
                      fill={bgColor}
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      fill={segment.color}
                      fontSize={fontSize}
                      fontWeight="bold"
                    >
                      {segment.points}
                    </text>
                  </g>
                )
              })}
              
              {/* Center circle */}
              <circle cx="160" cy="160" r="30" fill="#080808" stroke="#a3e635" strokeWidth="2" />
              <text
                x="160"
                y="160"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#a3e635"
                fontSize="12"
                fontWeight="bold"
              >
                SPIN
              </text>
            </svg>
          </div>

          {/* Spin button */}
          <Button
            onClick={handleSpin}
            disabled={wheelState === "spinning"}
            className={`w-full md:w-[200px] h-12 md:h-12 text-base font-bold tracking-wider ${
              wheelState === "spinning"
                ? "bg-[#1a1a1a] text-[#555555] cursor-not-allowed"
                : "bg-[#a3e635] text-black hover:bg-[#a3e635]/90 animate-pulse-glow-button"
            }`}
          >
            {wheelState === "spinning" ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              "SPIN NOW"
            )}
          </Button>
          <p className="text-xs text-[#666666] mt-3 text-center">
            1 free spin available today
          </p>
        </div>

        {/* Right column - Prize list */}
        <div>
          <p className="text-[11px] text-[#a3e635] uppercase tracking-widest mb-3 font-semibold">
            Prize Pool
          </p>

          {/* Desktop: vertical list */}
          <div className="hidden md:block">
            {segments.map((seg, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between py-2 ${
                  i < segments.length - 1 ? "border-b border-[#1a1a1a]" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: seg.dotColor }}
                  />
                  <span className={`text-sm ${seg.points === 100 ? "text-[#f59e0b]" : "text-[#888888]"}`}>
                    {seg.rarity}
                  </span>
                </div>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: seg.color }}
                >
                  {seg.points} pts
                </span>
              </div>
            ))}
          </div>

          {/* Mobile: 2-column grid of pills */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {segments.map((seg, i) => (
              <div 
                key={i}
                className="bg-[#111111] border border-[#1a1a1a] rounded-full px-3 py-2 flex items-center gap-2"
              >
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: seg.dotColor }}
                />
                <span className="text-xs text-[#888888] truncate">{seg.rarity}</span>
                <span 
                  className="text-xs font-semibold ml-auto"
                  style={{ color: seg.color }}
                >
                  {seg.points}
                </span>
              </div>
            ))}
          </div>

          {/* Last Win card */}
          <div className="mt-4 bg-[#111111] border border-[#1a1a1a] rounded-lg p-3">
            <p className="text-[11px] text-[#666666] mb-1">Last Win</p>
            <p className="text-sm text-[#888888]">Spin to win points!</p>
          </div>

          {/* Info text */}
          <p className="text-[11px] text-[#444444] mt-3">
            Spin resets daily at midnight SGT (UTC+8)
          </p>
        </div>
      </div>
    </div>
  )
}
