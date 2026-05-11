"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import {
  Flame,
  CalendarCheck,
  Users,
  Star,
  Gamepad2,
  Trophy,
  Lock,
  Crown,
  Check,
  Rocket,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const CARD_WIDTH_DESKTOP = 500
const CARD_WIDTH_MOBILE = 200
const CARD_HEIGHT_DESKTOP = 420
const CARD_HEIGHT_MOBILE = 320
const GAP_DESKTOP = 24
const GAP_MOBILE = 12
const TOTAL_CARDS = 6

interface MonthlyMissionData {
  quest_id: string
  points_reward: number
  isClaimed: boolean
}

interface MonthlyMissionsSliderProps {
  streakCount: number
  monthlyMissionsData: Record<string, MonthlyMissionData>
  onMissionClaim: (result: { new_balance: number }) => void
}

interface Mission {
  id: string
  title: string
  description: string
  points: number
  status: "completed" | "active" | "locked" | "finale"
  icon: React.ElementType
  bottomText: string
  progress?: number
  progressMax?: number
  questId?: string
}

export function MonthlyMissionsSlider({ 
  streakCount, 
  monthlyMissionsData,
  onMissionClaim,
}: MonthlyMissionsSliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  const dragStartX = useRef(0)
  const dragStartTranslate = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  const CARD_WIDTH = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP
  const CARD_HEIGHT = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP
  const GAP = isMobile ? GAP_MOBILE : GAP_DESKTOP

  // Handle mobile detection
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [claimedIds, setClaimedIds] = useState<Set<string>>(() => {
    const initialClaimed = new Set<string>()
    Object.entries(monthlyMissionsData).forEach(([title, data]) => {
      if (data.isClaimed) initialClaimed.add(data.quest_id)
    })
    return initialClaimed
  })
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const today = new Date()
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysRemaining = Math.max(0, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // Helper to get mission data from DB
  const getMissionData = (title: string) => monthlyMissionsData[title] || null

  // Build missions with DB data
  const missions: Mission[] = [
    {
      id: "first-checkin",
      title: "First Check-in",
      description: "Check in for the first time ever",
      points: getMissionData("First Check-in")?.points_reward || 10,
      status: "completed",
      icon: Flame,
      bottomText: `Completed May ${today.getDate()}`,
      questId: getMissionData("First Check-in")?.quest_id,
    },
    {
      id: "3-day-streak",
      title: "3-Day Streak",
      description: "Check in 3 days in a row",
      points: getMissionData("3-Day Streak")?.points_reward || 50,
      status: "active",
      icon: CalendarCheck,
      bottomText: `${streakCount} of 3 days`,
      progress: streakCount,
      progressMax: 3,
      questId: getMissionData("3-Day Streak")?.quest_id,
    },
    {
      id: "refer-friend",
      title: "Refer a Friend",
      description: "Invite someone to join",
      points: getMissionData("Refer a Friend")?.points_reward || 75,
      status: "locked",
      icon: Users,
      bottomText: "Complete mission 2 to unlock",
      questId: getMissionData("Refer a Friend")?.quest_id,
    },
    {
      id: "7-day-champion",
      title: "7-Day Champion",
      description: "Maintain a 7-day streak",
      points: getMissionData("7-Day Champion")?.points_reward || 100,
      status: "locked",
      icon: Star,
      bottomText: "Unlocks mid-May",
      questId: getMissionData("7-Day Champion")?.quest_id,
    },
    {
      id: "social-gamer",
      title: "Social Gamer",
      description: "Connect social accounts",
      points: getMissionData("Social Gamer")?.points_reward || 150,
      status: "locked",
      icon: Gamepad2,
      bottomText: "Unlocks May 20",
      questId: getMissionData("Social Gamer")?.quest_id,
    },
    {
      id: "may-champion",
      title: "May Champion",
      description: "Complete all May missions",
      points: getMissionData("May Champion")?.points_reward || 500,
      status: "finale",
      icon: Trophy,
      bottomText: "Unlocks May 31",
      questId: getMissionData("May Champion")?.quest_id,
    },
  ]

  // Calculate completed missions count
  const completedMissions = missions.filter(m => 
    m.status === "completed" || (m.questId && claimedIds.has(m.questId))
  ).length
  const totalMissions = 6
  const progressPercent = (completedMissions / totalMissions) * 100

  async function handleClaimMission(questId: string) {
    if (!questId || claimingId) return
    
    setClaimingId(questId)
    try {
      const response = await fetch('/api/quests/claim-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quest_id: questId }),
      })
      const data = await response.json()
      
      if (data.success) {
        setClaimedIds(prev => new Set([...prev, questId]))
        onMissionClaim(data)
      } else if (data.error === 'Already claimed') {
        setClaimedIds(prev => new Set([...prev, questId]))
      }
    } catch (error) {
      console.error('Failed to claim mission:', error)
    } finally {
      setClaimingId(null)
    }
  }

  const maxTranslate = 0
  const minTranslate = -((CARD_WIDTH + GAP) * (TOTAL_CARDS - 1))

  const clamp = (value: number, min: number, max: number) => 
    Math.min(max, Math.max(min, value))

  const snapToCard = useCallback((currentTranslate: number, vel: number) => {
    const cardUnit = CARD_WIDTH + GAP
    let targetIndex = Math.round(-currentTranslate / cardUnit)
    
    if (vel < -0.3) {
      targetIndex = Math.min(targetIndex + 1, TOTAL_CARDS - 1)
    } else if (vel > 0.3) {
      targetIndex = Math.max(targetIndex - 1, 0)
    }
    
    targetIndex = clamp(targetIndex, 0, TOTAL_CARDS - 1)
    setActiveIndex(targetIndex)
    setTranslateX(-targetIndex * cardUnit)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartTranslate.current = translateX
    lastX.current = e.clientX
    lastTime.current = performance.now()
    velocity.current = 0
    
    if (trackRef.current) {
      trackRef.current.style.transition = "none"
    }
    
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }, [translateX])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    
    const currentX = e.clientX
    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime.current
    
    if (deltaTime > 0) {
      velocity.current = (currentX - lastX.current) / deltaTime
    }
    
    lastX.current = currentX
    lastTime.current = currentTime
    
    const delta = currentX - dragStartX.current
    const newTranslate = clamp(dragStartTranslate.current + delta, minTranslate - 50, maxTranslate + 50)
    setTranslateX(newTranslate)
  }, [isDragging, minTranslate, maxTranslate])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)"
    }
    
    const clampedTranslate = clamp(translateX, minTranslate, maxTranslate)
    snapToCard(clampedTranslate, velocity.current)
    
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }, [isDragging, translateX, minTranslate, maxTranslate, snapToCard])

  const goToCard = useCallback((index: number) => {
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)"
    }
    setActiveIndex(index)
    setTranslateX(-index * (CARD_WIDTH + GAP))
  }, [])

  const getCardTransform = (index: number) => {
    const distance = index - activeIndex
    
    if (distance === 0) {
      return { scale: 1, rotateY: 0, opacity: 1 }
    } else if (Math.abs(distance) === 1) {
      return { scale: 0.93, rotateY: distance < 0 ? 8 : -8, opacity: 0.75 }
    } else {
      return { scale: 0.86, rotateY: distance < 0 ? 14 : -14, opacity: 0.5 }
    }
  }

  const getOpacityForStatus = (status: string, index: number) => {
    if (status === "completed" || status === "active") return 1
    if (index === 2) return 0.65
    if (index === 3) return 0.5
    if (index === 4) return 0.4
    return 0.4
  }

  const renderCard = (mission: Mission, index: number) => {
    const { scale, rotateY, opacity } = getCardTransform(index)
    const statusOpacity = getOpacityForStatus(mission.status, index)
    const Icon = mission.icon
    
    const isBaseCompleted = mission.status === "completed"
    const isActive = mission.status === "active"
    const isFinale = mission.status === "finale"
    
    // Check if mission is claimed from DB
    const isClaimed = mission.questId ? claimedIds.has(mission.questId) : false
    const isClaiming = mission.questId === claimingId
    
    // Check if progress is complete (ready to claim)
    const isProgressComplete = isActive && 
      mission.progress !== undefined && 
      mission.progressMax !== undefined && 
      mission.progress >= mission.progressMax
    
    // Final states
    const isReadyToClaim = isProgressComplete && !isClaimed && mission.questId
    const isCompleted = isBaseCompleted || isClaimed
    
    let cardBg = "#0f0f0f"
    let borderColor = "#1a1a1a"
    
    if (isCompleted) {
      cardBg = "#111111"
      borderColor = "#a3e635"
    } else if (isActive) {
      cardBg = "#1a0d00"
      borderColor = "#f97316"
    } else if (isFinale) {
      cardBg = "#0a0a14"
      borderColor = "#2a2a3e"
    }

    // Badge rendering helper
    const renderBadge = () => {
      if (isCompleted) {
        return (
          <span
            className={`flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wide ${isMobile ? "px-2 py-1 text-[10px]" : "px-4 py-2 text-sm"}`}
            style={{ background: "#a3e635", color: "#000" }}
          >
            <Check width={isMobile ? 10 : 14} height={isMobile ? 10 : 14} />
            {isMobile ? "DONE" : "COMPLETED"}
          </span>
        )
      }
      if (isReadyToClaim) {
        return (
          <span
            className={`flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wide ${isMobile ? "px-2 py-1 text-[10px]" : "px-4 py-2 text-sm"}`}
            style={{ background: "#a3e635", color: "#000" }}
          >
            {isMobile ? "CLAIM" : "READY TO CLAIM"}
          </span>
        )
      }
      if (isActive) {
        return (
          <span
            className={`flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wide ${isMobile ? "px-2 py-1 text-[10px]" : "px-4 py-2 text-sm"}`}
            style={{
              background: "#1a0d00",
              color: "#f97316",
              border: "1px solid #f97316",
            }}
          >
            <span className="animate-blink">●</span>
            ACTIVE
          </span>
        )
      }
      if (isFinale) {
        return (
          <span
            className={`flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wide ${isMobile ? "px-2 py-1 text-[10px]" : "px-4 py-2 text-sm"}`}
            style={{ background: "#1a1a2e", color: "#555" }}
          >
            <Crown width={isMobile ? 10 : 14} height={isMobile ? 10 : 14} />
            {isMobile ? "FINALE" : "MONTH FINALE"}
          </span>
        )
      }
      return (
        <span
          className={`flex items-center gap-1.5 rounded-lg font-bold uppercase tracking-wide ${isMobile ? "px-2 py-1 text-[10px]" : "px-4 py-2 text-sm"}`}
          style={{ background: "#1a1a1a", color: "#555" }}
        >
          <Lock width={isMobile ? 10 : 14} height={isMobile ? 10 : 14} />
          LOCKED
        </span>
      )
    }

    return (
      <div
        key={mission.id}
        className="flex-shrink-0"
        style={{
          width: CARD_WIDTH,
          transformOrigin: "center",
          transform: `scale(${scale}) rotateY(${rotateY}deg)`,
          opacity: opacity * statusOpacity,
          transition: isDragging ? "none" : "transform 0.4s ease, opacity 0.4s ease",
        }}
      >
        <div
          className={`rounded-2xl flex flex-col ${isActive && !isReadyToClaim && !isClaimed ? "animate-pulse-glow-orange" : ""}`}
          style={{
            minHeight: CARD_HEIGHT,
            padding: isMobile ? "16px" : "32px",
            background: cardBg,
            border: `2px solid ${borderColor}`,
          }}
        >
          {/* Badge */}
          <div className={`flex items-center justify-between ${isMobile ? "mb-3" : "mb-5"}`}>
            {renderBadge()}
            <span
              className={`font-bold ${isMobile ? "text-xs" : "text-xl"}`}
              style={{
                color: isCompleted || isReadyToClaim
                  ? "#a3e635"
                  : isActive
                    ? "#f97316"
                    : isFinale
                      ? "#333"
                      : "#444",
              }}
            >
              +{mission.points}
            </span>
          </div>

          {/* Icon + Title */}
          <div className={`flex items-center ${isMobile ? "gap-2 mb-2" : "gap-4 mb-4"}`}>
            <div
              className={`rounded-xl flex items-center justify-center ${isMobile ? "w-8 h-8" : "w-14 h-14"}`}
              style={{
                background: isCompleted
                  ? "#1a1a1a"
                  : isActive
                    ? "#2a1500"
                    : isFinale
                      ? "#1a1a2e"
                      : "#1a1a1a",
              }}
            >
              <Icon
                width={isMobile ? 16 : 28}
                height={isMobile ? 16 : 28}
                style={{
                  color: isCompleted || isReadyToClaim
                    ? "#a3e635"
                    : isActive
                      ? "#f97316"
                      : isFinale
                        ? "#444"
                        : "#444",
                }}
              />
            </div>
            <h3
              className={`font-bold ${isMobile ? "text-sm" : "text-2xl"}`}
              style={{
                color: isCompleted || isActive
                  ? "#fff"
                  : isFinale
                    ? "#333"
                    : "#555",
              }}
            >
              {mission.title}
            </h3>
          </div>

          {/* Description */}
          <p
            className={`leading-relaxed ${isMobile ? "text-xs mb-2" : "text-lg mb-4"}`}
            style={{
              color: isCompleted
                ? "#666"
                : isActive
                  ? "#666"
                  : isFinale
                    ? "#333"
                    : "#444",
            }}
          >
            {mission.description}
          </p>

          {/* Progress bar for active mission (not ready to claim) */}
          {isActive && !isReadyToClaim && !isClaimed && mission.progress !== undefined && mission.progressMax !== undefined && (
            <div className={isMobile ? "mb-2" : "mb-4"}>
              <div
                className={`rounded-full overflow-hidden ${isMobile ? "h-1.5" : "h-2.5"}`}
                style={{ background: "#2a1500" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((mission.progress / mission.progressMax) * 100, 100)}%`,
                    background: "#f97316",
                  }}
                />
              </div>
            </div>
          )}

          {/* Spacer to push bottom content down */}
          <div className="flex-grow" />

          {/* Bottom text */}
          <p
            className={`flex items-center gap-1.5 ${isMobile ? "text-[10px]" : "text-lg"} ${isReadyToClaim || isClaimed ? (isMobile ? "mb-2" : "mb-4") : ""}`}
            style={{
              color: isCompleted || isReadyToClaim
                ? "#a3e635"
                : isActive
                  ? "#f97316"
                  : isFinale
                    ? "#333"
                    : "#444",
            }}
          >
            {isCompleted && <Check width={isMobile ? 12 : 18} height={isMobile ? 12 : 18} />}
            {isClaimed ? `Claimed +${mission.points} pts` : mission.bottomText}
          </p>

          {/* Claim button for ready-to-claim missions */}
          {isReadyToClaim && mission.questId && (
            <Button
              onClick={() => handleClaimMission(mission.questId!)}
              disabled={isClaiming}
              className={`w-full bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-bold ${isMobile ? "h-8 text-xs" : "h-12 text-base"} rounded-lg`}
            >
              {isClaiming ? (
                <>
                  <Loader2 className={`${isMobile ? "h-3 w-3" : "h-5 w-5"} mr-2 animate-spin`} />
                  Claiming...
                </>
              ) : (
                `Claim ${mission.points} pts`
              )}
            </Button>
          )}

          {/* Claimed button (disabled) */}
          {isClaimed && !isBaseCompleted && (
            <Button
              disabled
              className={`w-full bg-[#1a1a1a] text-[#666] cursor-not-allowed font-bold ${isMobile ? "h-8 text-xs" : "h-12 text-base"} rounded-lg`}
            >
              <Check className={`${isMobile ? "h-3 w-3" : "h-5 w-5"} mr-2`} />
              Claimed
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <p className="text-base text-[#a3e635] uppercase tracking-widest mb-2">
            Monthly Missions
          </p>
          <h2 className="text-4xl xl:text-5xl font-bold text-white mb-2">May Mission Track</h2>
          <p className="text-xl text-[#666]">
            Drag to explore • Complete missions to earn rewards
          </p>
        </div>
        <div className="flex flex-col items-start lg:items-end">
          <span className="text-lg text-[#666]">Season ends in</span>
          <span className="text-3xl font-bold text-[#a3e635]">{daysRemaining} days</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg text-[#666]">Mission Progress</span>
          <span className="text-lg font-bold text-[#a3e635]">
            {completedMissions} / {totalMissions} missions
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "#1a1a1a" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: "#a3e635",
            }}
          />
        </div>
      </div>

      {/* Slider */}
      <div
        ref={wrapperRef}
        className={`overflow-hidden select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ perspective: "1200px", minHeight: CARD_HEIGHT + 40 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(${translateX}px)`,
            willChange: "transform",
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          {missions.map((mission, index) => renderCard(mission, index))}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="flex justify-center gap-3 mt-8">
        {missions.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to mission ${index + 1}`}
            onClick={() => goToCard(index)}
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: activeIndex === index ? 36 : 12,
              background: activeIndex === index ? "#a3e635" : "#333",
            }}
          />
        ))}
      </div>

      {/* Coming Soon Banner */}
      <div
        className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl"
        style={{
          background: "#111",
          border: "1px solid #1a1a1a",
          padding: "20px 24px",
        }}
      >
        <div className="flex items-start sm:items-center gap-4">
          <Rocket width={24} height={24} className="text-[#a3e635] shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <p className="font-bold text-white text-lg">
              More missions dropping throughout May
            </p>
            <p className="text-base text-[#666]">
              Complete active missions to unlock the full month
            </p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-lg font-medium text-[#a3e635] shrink-0">
          Stay tuned
          <ArrowRight width={18} height={18} />
        </span>
      </div>
    </section>
  )
}
