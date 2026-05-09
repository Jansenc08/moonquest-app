"use client"

import { useRef, useState, useCallback } from "react"
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
} from "lucide-react"

const CARD_WIDTH = 500
const CARD_HEIGHT = 380
const GAP = 24
const TOTAL_CARDS = 6

interface MonthlyMissionsSliderProps {
  streakCount: number
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
}

export function MonthlyMissionsSlider({ streakCount }: MonthlyMissionsSliderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const dragStartX = useRef(0)
  const dragStartTranslate = useRef(0)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)

  const today = new Date()
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const daysRemaining = Math.max(0, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  
  const completedMissions = 1
  const totalMissions = 6
  const progressPercent = (completedMissions / totalMissions) * 100

  const missions: Mission[] = [
    {
      id: "first-checkin",
      title: "First Check-in",
      description: "Check in for the first time ever",
      points: 10,
      status: "completed",
      icon: Flame,
      bottomText: `Completed May ${today.getDate()}`,
    },
    {
      id: "3-day-streak",
      title: "3-Day Streak",
      description: "Check in 3 days in a row",
      points: 50,
      status: "active",
      icon: CalendarCheck,
      bottomText: `${streakCount} of 3 days`,
      progress: streakCount,
      progressMax: 3,
    },
    {
      id: "refer-friend",
      title: "Refer a Friend",
      description: "Invite someone to join",
      points: 75,
      status: "locked",
      icon: Users,
      bottomText: "Complete mission 2 to unlock",
    },
    {
      id: "7-day-champion",
      title: "7-Day Champion",
      description: "Maintain a 7-day streak",
      points: 100,
      status: "locked",
      icon: Star,
      bottomText: "Unlocks mid-May",
    },
    {
      id: "social-gamer",
      title: "Social Gamer",
      description: "Connect social accounts",
      points: 150,
      status: "locked",
      icon: Gamepad2,
      bottomText: "Unlocks May 20",
    },
    {
      id: "may-champion",
      title: "May Champion",
      description: "Complete all May missions",
      points: 500,
      status: "finale",
      icon: Trophy,
      bottomText: "Unlocks May 31",
    },
  ]

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
    
    const isCompleted = mission.status === "completed"
    const isActive = mission.status === "active"
    const isLocked = mission.status === "locked"
    const isFinale = mission.status === "finale"
    
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
          className={`rounded-2xl p-8 flex flex-col ${isActive ? "animate-pulse-glow-orange" : ""}`}
          style={{
            height: CARD_HEIGHT,
            background: cardBg,
            border: `2px solid ${borderColor}`,
          }}
        >
          {/* Badge */}
          <div className="flex items-center justify-between mb-5">
            {isCompleted ? (
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                style={{ background: "#a3e635", color: "#000" }}
              >
                <Check width={14} height={14} />
                COMPLETED
              </span>
            ) : isActive ? (
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                style={{
                  background: "#1a0d00",
                  color: "#f97316",
                  border: "1px solid #f97316",
                }}
              >
                <span className="animate-blink">●</span>
                ACTIVE
              </span>
            ) : isFinale ? (
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                style={{ background: "#1a1a2e", color: "#555" }}
              >
                <Crown width={14} height={14} />
                MONTH FINALE
              </span>
            ) : (
              <span
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide"
                style={{ background: "#1a1a1a", color: "#555" }}
              >
                <Lock width={14} height={14} />
                LOCKED
              </span>
            )}
            <span
              className="text-xl font-bold"
              style={{
                color: isCompleted
                  ? "#a3e635"
                  : isActive
                    ? "#f97316"
                    : isFinale
                      ? "#333"
                      : "#444",
              }}
            >
              +{mission.points} pts
            </span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
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
                width={28}
                height={28}
                style={{
                  color: isCompleted
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
              className="font-bold text-2xl"
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
            className="text-lg mb-auto leading-relaxed"
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

          {/* Progress bar for active mission */}
          {isActive && mission.progress !== undefined && mission.progressMax !== undefined && (
            <div className="mb-4">
              <div
                className="h-2.5 rounded-full overflow-hidden"
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

          {/* Bottom text */}
          <p
            className="text-lg flex items-center gap-2"
            style={{
              color: isCompleted
                ? "#a3e635"
                : isActive
                  ? "#f97316"
                  : isFinale
                    ? "#333"
                    : "#444",
            }}
          >
            {isCompleted && <Check width={18} height={18} />}
            {mission.bottomText}
          </p>
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
