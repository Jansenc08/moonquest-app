"use client"

import { useEffect, useState } from "react"
import { X, CalendarCheck, RotateCw, Lock, CheckCircle } from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  points_reward: number
  type: "daily_checkin" | "daily_spin" | "dummy"
}

interface QuestDetailsModalProps {
  quest: Quest | null
  isOpen: boolean
  onClose: () => void
  streakCount: number
  isCompletedToday: boolean
}

export function QuestDetailsModal({
  quest,
  isOpen,
  onClose,
  streakCount,
  isCompletedToday,
}: QuestDetailsModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !quest) return null

  const getIconConfig = () => {
    switch (quest.type) {
      case "daily_checkin":
        return {
          Icon: CalendarCheck,
          bgColor: "#1a3300",
          iconColor: "#a3e635",
        }
      case "daily_spin":
        return {
          Icon: RotateCw,
          bgColor: "#1a1a00",
          iconColor: "#f59e0b",
        }
      default:
        return {
          Icon: Lock,
          bgColor: "#1a1a1a",
          iconColor: "#444",
        }
    }
  }

  const getBadgeConfig = () => {
    if (quest.type === "daily_checkin") {
      return isCompletedToday
        ? { text: "DONE", bgColor: "#1a3300", textColor: "#a3e635" }
        : { text: "ACTIVE", bgColor: "#a3e635", textColor: "#000" }
    }
    if (quest.type === "daily_spin") {
      return isCompletedToday
        ? { text: "DONE", bgColor: "#1a1a00", textColor: "#f59e0b" }
        : { text: "ACTIVE", bgColor: "#f59e0b", textColor: "#000" }
    }
    return { text: "COMING SOON", bgColor: "#1a1a1a", textColor: "#555" }
  }

  const getHowToComplete = () => {
    switch (quest.type) {
      case "daily_checkin":
        return "Click the Check In button once per day. Each consecutive day increases your streak and bonus points. Missing a day resets your streak."
      case "daily_spin":
        return "Spin the wheel once per day for a chance to win bonus points. The wheel has 8 segments with different point values and rarities."
      default:
        return "This quest is coming soon. Complete active quests to unlock future missions."
    }
  }

  const { Icon, bgColor, iconColor } = getIconConfig()
  const badge = getBadgeConfig()
  const todayReward = Math.min(10 + streakCount * 2, 50)

  return (
    <div
      className={`fixed inset-0 z-50 ${isMobile ? "flex items-end" : "flex items-center justify-center px-4"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${isMobile ? "animate-slide-up-mobile" : "max-w-[480px] animate-fade-in"}`}
        style={{
          backgroundColor: "#111",
          border: "1px solid #1a1a1a",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          padding: isMobile ? "24px 20px 40px" : "32px",
          maxHeight: isMobile ? "90vh" : "auto",
          overflowY: isMobile ? "auto" : "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (mobile only) */}
        {isMobile && (
          <div className="flex justify-center mb-5">
            <div
              style={{
                width: "36px",
                height: "4px",
                backgroundColor: "#333",
                borderRadius: "2px",
              }}
            />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
          style={{ top: isMobile ? "12px" : "16px" }}
        >
          <X className="h-5 w-5 text-[#666]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: bgColor,
              borderRadius: "10px",
            }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span
                className="px-3 py-1 text-xs font-bold uppercase rounded"
                style={{
                  backgroundColor: badge.bgColor,
                  color: badge.textColor,
                }}
              >
                {badge.text}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white truncate">
              {quest.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p
          className="mb-6"
          style={{ color: "#888", fontSize: "14px", lineHeight: "1.6" }}
        >
          {quest.description}
        </p>

        {/* How to Complete */}
        <div
          className="mb-6"
          style={{
            backgroundColor: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <p
            className="font-bold uppercase tracking-wider mb-2"
            style={{ color: "#a3e635", fontSize: "11px" }}
          >
            HOW TO COMPLETE
          </p>
          <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6" }}>
            {getHowToComplete()}
          </p>
        </div>

        {/* Streak Bonus Table (daily_checkin only) */}
        {quest.type === "daily_checkin" && (
          <div
            className="mb-6"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <p
              className="font-bold uppercase tracking-wider mb-3"
              style={{ color: "#a3e635", fontSize: "11px" }}
            >
              STREAK BONUS
            </p>
            <div className="space-y-0">
              {[
                { day: "Day 1", pts: "+10 pts", label: "Base reward" },
                { day: "Day 2", pts: "+12 pts", label: "Streak bonus" },
                { day: "Day 3", pts: "+14 pts", label: "Streak bonus" },
                { day: "Day 5", pts: "+18 pts", label: "Streak bonus" },
                { day: "Day 21+", pts: "+50 pts", label: "MAX reward", highlight: true },
              ].map((row, i) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom: i < 4 ? "1px solid #1a1a1a" : "none",
                  }}
                >
                  <span style={{ color: "#888", fontSize: "13px" }}>
                    {row.day}
                  </span>
                  <span
                    style={{
                      color: row.highlight ? "#a3e635" : "#888",
                      fontSize: "13px",
                      fontWeight: row.highlight ? "600" : "400",
                    }}
                  >
                    {row.pts}
                  </span>
                  <span
                    style={{
                      color: row.highlight ? "#a3e635" : "#666",
                      fontSize: "12px",
                    }}
                  >
                    {row.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spin Prize Table (daily_spin only) */}
        {quest.type === "daily_spin" && (
          <div
            className="mb-6"
            style={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <p
              className="font-bold uppercase tracking-wider mb-3"
              style={{ color: "#f59e0b", fontSize: "11px" }}
            >
              PRIZE POOL
            </p>
            <div className="space-y-0">
              {[
                { label: "Miss", pts: "0 pts", color: "#ef4444" },
                { label: "Common", pts: "5-15 pts", color: "#888" },
                { label: "Uncommon", pts: "25 pts", color: "#a3e635" },
                { label: "Rare", pts: "50 pts", color: "#a3e635" },
                { label: "Epic", pts: "75 pts", color: "#a3e635" },
                { label: "Jackpot!", pts: "100 pts", color: "#f59e0b" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom: i < 5 ? "1px solid #1a1a1a" : "none",
                  }}
                >
                  <span style={{ color: row.color, fontSize: "13px" }}>
                    {row.label}
                  </span>
                  <span style={{ color: row.color, fontSize: "13px" }}>
                    {row.pts}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Status (daily_checkin only) */}
        {quest.type === "daily_checkin" && (
          <div
            style={{
              backgroundColor: "#0d1a00",
              border: "1px solid #a3e635",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: "#888", fontSize: "12px" }}>
                  Your current streak
                </p>
                <p
                  className="font-bold"
                  style={{ color: "#a3e635", fontSize: "24px" }}
                >
                  {streakCount} {streakCount === 1 ? "day" : "days"}
                </p>
              </div>
              <div className="text-right">
                <p style={{ color: "#888", fontSize: "12px" }}>
                  Today&apos;s reward
                </p>
                <p
                  className="font-bold"
                  style={{ color: "#a3e635", fontSize: "24px" }}
                >
                  +{todayReward} pts
                </p>
              </div>
            </div>
            {isCompletedToday && (
              <div
                className="flex items-center gap-2 mt-3 pt-3"
                style={{ borderTop: "1px solid #1a3300" }}
              >
                <CheckCircle className="h-4 w-4 text-[#a3e635]" />
                <span style={{ color: "#a3e635", fontSize: "13px" }}>
                  Checked in today!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes slideUpMobile {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up-mobile {
          animation: slideUpMobile 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </div>
  )
}
