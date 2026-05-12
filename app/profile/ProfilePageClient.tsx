"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  CalendarCheck,
  Target,
  Disc,
  Wallet,
  ShoppingBag,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface QuestInfo {
  title: string
  type: string
}

interface RewardInfo {
  title: string
  points_cost: number
}

interface QuestCompletion {
  id: string
  completed_at: string
  points_earned: number | null
  quests: QuestInfo | QuestInfo[] | null
}

interface Redemption {
  id: string
  redeemed_at: string
  points_spent: number
  rewards: RewardInfo | RewardInfo[] | null
}

interface Player {
  name: string
  points: number
  rank?: number
  isCurrentUser?: boolean
}

type LedgerCategory = "checkin" | "mission" | "spin" | "wallet" | "spend"

interface LedgerEntry {
  id: string
  date: string
  label: string
  sublabel: string
  points: number
  category: LedgerCategory
  runningBalance: number
}

interface ProfilePageClientProps {
  userId: string
  email: string
  username: string
  walletAddress: string | null
  pointsBalance: number
  streakCount: number
  questCount: number
  redemptionCount: number
  completions: QuestCompletion[]
  redemptions: Redemption[]
  userRank: number
  topPlayer: Player
  nextAbove: Player | null
  nextBelow: Player | null
  memberSince: string
}

function formatSGT(dateStr: string): string {
  const date = new Date(dateStr)
  const sgt = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  const nowSGT = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const todayKey = `${nowSGT.getUTCFullYear()}-${nowSGT.getUTCMonth()}-${nowSGT.getUTCDate()}`
  const entryKey = `${sgt.getUTCFullYear()}-${sgt.getUTCMonth()}-${sgt.getUTCDate()}`
  const yesterdayDate = new Date(nowSGT)
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1)
  const yesterdayKey = `${yesterdayDate.getUTCFullYear()}-${yesterdayDate.getUTCMonth()}-${yesterdayDate.getUTCDate()}`
  const hours = String(sgt.getUTCHours()).padStart(2, "0")
  const mins = String(sgt.getUTCMinutes()).padStart(2, "0")
  const time = `${hours}:${mins} SGT`
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  if (entryKey === todayKey) return `Today · ${time}`
  if (entryKey === yesterdayKey) return `Yesterday · ${time}`
  return `${sgt.getUTCDate()} ${months[sgt.getUTCMonth()]} · ${time}`
}

const LEDGER_PAGE_SIZE = 10

export function ProfilePageClient({
  userId,
  email,
  username: initialUsername,
  walletAddress,
  pointsBalance,
  streakCount,
  questCount,
  redemptionCount,
  completions,
  redemptions,
  userRank,
  topPlayer,
  nextAbove,
  memberSince,
}: ProfilePageClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const ledgerRef = useRef<HTMLDivElement>(null)
  
  const [username, setUsername] = useState(initialUsername)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(initialUsername)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [ledgerPage, setLedgerPage] = useState(1)

  // Build ledger entries
  const ledgerEntries: LedgerEntry[] = []

  const getQuestInfo = (quests: QuestInfo | QuestInfo[] | null): QuestInfo | null => {
    if (!quests) return null
    return Array.isArray(quests) ? quests[0] : quests
  }

  const getRewardInfo = (rewards: RewardInfo | RewardInfo[] | null): RewardInfo | null => {
    if (!rewards) return null
    return Array.isArray(rewards) ? rewards[0] : rewards
  }

  completions.forEach((c) => {
    const quest = getQuestInfo(c.quests)
    let category: LedgerCategory = "checkin"
    let label = quest?.title || "Quest"
    let sublabel = ""

    if (quest?.type === "daily_checkin") {
      category = "checkin"
      label = "Daily Check-in"
      sublabel = `streak×${streakCount}`
    } else if (quest?.title === "Daily Spin") {
      category = "spin"
      label = "Daily Spin"
      sublabel = ""
    } else if (quest?.type === "wallet_connect") {
      category = "wallet"
      label = "Connect Wallet"
      sublabel = "one-time quest"
    } else if (quest?.type === "monthly_mission") {
      category = "mission"
      label = quest?.title || "Monthly Mission"
      sublabel = "monthly mission"
    }

    ledgerEntries.push({
      id: c.id,
      date: c.completed_at,
      label,
      sublabel,
      points: c.points_earned || 0,
      category,
      runningBalance: 0,
    })
  })

  redemptions.forEach((r) => {
    const reward = getRewardInfo(r.rewards)
    ledgerEntries.push({
      id: r.id,
      date: r.redeemed_at,
      label: reward?.title || "Reward",
      sublabel: "loot shop",
      points: -(r.points_spent || reward?.points_cost || 0),
      category: "spend",
      runningBalance: 0,
    })
  })

  ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let running = pointsBalance
  for (let i = 0; i < ledgerEntries.length; i++) {
    ledgerEntries[i].runningBalance = running
    if (ledgerEntries[i].points > 0) {
      running -= ledgerEntries[i].points
    } else {
      running += Math.abs(ledgerEntries[i].points)
    }
  }

  const totalPages = Math.ceil(ledgerEntries.length / LEDGER_PAGE_SIZE)
  const paginatedLedger = ledgerEntries.slice(
    (ledgerPage - 1) * LEDGER_PAGE_SIZE,
    ledgerPage * LEDGER_PAGE_SIZE
  )
  const showingStart = (ledgerPage - 1) * LEDGER_PAGE_SIZE + 1
  const showingEnd = Math.min(ledgerPage * LEDGER_PAGE_SIZE, ledgerEntries.length)

  function handlePageChange(newPage: number) {
    setLedgerPage(newPage)
    ledgerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    const pages: (number | "...")[] = []
    if (ledgerPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages)
    } else if (ledgerPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", ledgerPage - 1, ledgerPage, ledgerPage + 1, "...", totalPages)
    }
    return pages
  }

  function getMobilePageNumbers(): (number | "...")[] {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (ledgerPage === 1) return [1, 2, "...", totalPages]
    if (ledgerPage === totalPages) return [1, "...", totalPages - 1, totalPages]
    return [1, "...", ledgerPage, "...", totalPages]
  }

  async function handleSaveName() {
    if (!editName.trim() || editName === username) {
      setIsEditingName(false)
      return
    }

    setIsSavingName(true)
    try {
      await supabase
        .from("profiles")
        .update({ username: editName.trim() })
        .eq("id", userId)
      
      setUsername(editName.trim())
      setIsEditingName(false)
    } catch (error) {
      console.error("Failed to update username:", error)
    } finally {
      setIsSavingName(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    await supabase.auth.signOut()
    router.push("/login")
  }

  const gap = topPlayer.points - pointsBalance
  const progressPercent = topPlayer.points > 0 ? (pointsBalance / topPlayer.points) * 100 : 0

  const getCategoryIcon = (category: LedgerCategory, mobile: boolean = false) => {
    const size = mobile ? "w-4 h-4" : "w-4 h-4 md:w-5 md:h-5"
    switch (category) {
      case "checkin":
        return <CalendarCheck className={size} style={{ color: "#a3e635" }} />
      case "mission":
        return <Target className={size} style={{ color: "#a3e635" }} />
      case "spin":
        return <Disc className={size} style={{ color: "#f97316" }} />
      case "wallet":
        return <Wallet className={size} style={{ color: "#6366f1" }} />
      case "spend":
        return <ShoppingBag className={size} style={{ color: "#ef4444" }} />
    }
  }

  const getCategoryBg = (category: LedgerCategory) => {
    switch (category) {
      case "checkin":
      case "mission":
        return "#0d1a00"
      case "spin":
        return "#1a0a00"
      case "wallet":
        return "#0a0a1a"
      case "spend":
        return "#1a0000"
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* SECTION 1: IDENTITY CARD */}
      <div
        className="rounded-2xl p-5 md:p-8 lg:p-10 animate-slide-up"
        style={{ background: "#111111", border: "1px solid #1a1a1a" }}
      >
        {/* Header: Avatar + Name + Points */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-3 md:items-start md:gap-5">
            {/* Avatar */}
            <div
              className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#0d1a00", border: "2px solid #a3e635" }}
            >
              <span className="text-lg md:text-2xl font-bold" style={{ color: "#a3e635" }}>
                {username.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Name + Meta */}
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-[#0d0d0d] border-b border-[#a3e635] text-white px-2 py-1 text-xl md:text-3xl font-bold outline-none w-full max-w-[200px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName()
                      if (e.key === "Escape") setIsEditingName(false)
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-2 hover:bg-[#1a1a1a] rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    {isSavingName ? (
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" style={{ color: "#a3e635" }} />
                    ) : (
                      <Check className="w-5 h-5 md:w-6 md:h-6" style={{ color: "#a3e635" }} />
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xl md:text-3xl font-bold text-white truncate">{username}</p>
              )}

              {walletAddress && (
                <p className="text-xs md:text-sm font-mono mt-1" style={{ color: "#444" }}>
                  <span className="md:hidden">{walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}</span>
                  <span className="hidden md:inline">{walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}</span>
                </p>
              )}

              {/* Badges */}
              <div className="flex gap-2 mt-2 md:mt-3 flex-wrap">
                <span
                  className="px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold"
                  style={{ background: "#0d1a00", color: "#a3e635", border: "1px solid #2a3a00" }}
                >
                  {streakCount}-day streak
                </span>
                {walletAddress && (
                  <span
                    className="px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold"
                    style={{ background: "#1a0d00", color: "#f97316", border: "1px solid #3a1a00" }}
                  >
                    wallet linked
                  </span>
                )}
                <span
                  className="px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold"
                  style={{ background: "#161616", color: "#555", border: "1px solid #222" }}
                >
                  rank #{userRank}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Points */}
          <div className="mt-2 md:mt-0 md:text-right shrink-0">
            <p className="text-5xl md:text-6xl font-bold font-mono" style={{ color: "#a3e635" }}>
              {pointsBalance.toLocaleString()}
            </p>
            <p className="text-xs md:text-sm uppercase tracking-widest mt-1" style={{ color: "#444" }}>
              points
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-5 md:my-6" style={{ borderColor: "#1a1a1a" }} />

        {/* Leaderboard position */}
        <div>
          <p className="text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3" style={{ color: "#a3e635" }}>
            Leaderboard position
          </p>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs md:text-sm font-mono mb-2">
            <span style={{ color: "#444" }}>
              #1 {topPlayer.name} · {topPlayer.points.toLocaleString()} pts
            </span>
            <span style={{ color: "#a3e635" }}>
              #{userRank} You · {pointsBalance.toLocaleString()} pts
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 md:h-2 rounded-full overflow-hidden"
            style={{ background: "#1a1a1a" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%`, background: "#a3e635" }}
            />
          </div>

          <p className="text-xs md:text-sm mt-2" style={{ color: "#444" }}>
            {gap > 0 ? (
              <>
                <span style={{ color: "#a3e635" }}>{gap.toLocaleString()}</span> pts behind #1
                {nextAbove && userRank > 1 && (
                  <span className="hidden sm:inline"> · Next rank: {nextAbove.name} at {nextAbove.points.toLocaleString()} pts</span>
                )}
              </>
            ) : (
              "You are #1!"
            )}
          </p>
        </div>
      </div>

      {/* SECTION 2: STATS ROW */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-slide-up"
        style={{ animationDelay: "50ms" }}
      >
        {[
          { value: streakCount, label: "Day streak", color: "#a3e635" },
          { value: questCount, label: "Quests done", color: "#fff" },
          { value: redemptionCount, label: "Redeemed", color: "#fff" },
          { value: streakCount, label: "Best streak", color: "#f97316" },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-xl p-4 md:p-6 lg:p-8"
            style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}
          >
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs md:text-sm uppercase tracking-widest mt-1" style={{ color: "#555" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* SECTION 3: POINTS LEDGER */}
      <div
        ref={ledgerRef}
        className="rounded-2xl p-5 md:p-8 lg:p-10 animate-slide-up scroll-mt-20 md:scroll-mt-24"
        style={{ background: "#111111", border: "1px solid #1a1a1a", animationDelay: "100ms" }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest mb-4 md:mb-5" style={{ color: "#a3e635" }}>
          Points ledger
        </p>

        {/* Column labels */}
        <div
          className="flex justify-between text-xs md:text-sm pb-3 md:pb-4 mb-1 md:mb-2"
          style={{ color: "#444", borderBottom: "1px solid #161616" }}
        >
          <span>Activity</span>
          <span className="hidden md:block">Running balance</span>
          <span className="md:hidden">Balance</span>
        </div>

        {ledgerEntries.length === 0 ? (
          <div className="py-12 md:py-16 text-center">
            <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 mx-auto" style={{ color: "#222" }} />
            <p className="text-sm md:text-base mt-3 md:mt-4" style={{ color: "#333" }}>
              No activity yet
            </p>
          </div>
        ) : (
          <>
            {paginatedLedger.map((entry, i) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 md:gap-4 py-3 md:py-4"
                style={{ borderBottom: i < paginatedLedger.length - 1 ? "1px solid #161616" : "none" }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: getCategoryBg(entry.category) }}
                >
                  {getCategoryIcon(entry.category)}
                </div>

                {/* Middle: Label + Sublabel */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base truncate" style={{ color: "#ccc" }}>
                    {entry.label}
                  </p>
                  <p className="text-xs md:text-sm mt-0.5 truncate" style={{ color: "#444" }}>
                    {formatSGT(entry.date)}{entry.sublabel ? ` · ${entry.sublabel}` : ""}
                  </p>
                </div>

                {/* Right: Points + Balance */}
                <div className="text-right font-mono shrink-0">
                  <p
                    className="text-base md:text-lg font-bold"
                    style={{
                      color:
                        entry.category === "spend"
                          ? "#ef4444"
                          : entry.category === "spin"
                            ? "#f97316"
                            : "#a3e635",
                    }}
                  >
                    {entry.points > 0 ? "+" : "−"}{Math.abs(entry.points)}
                  </p>
                  <p className="text-xs md:text-sm mt-0.5" style={{ color: "#444" }}>
                    → {entry.runningBalance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 md:mt-5 pt-4 md:pt-5"
                style={{ borderTop: "1px solid #1a1a1a" }}
              >
                {/* Showing count */}
                <p className="text-xs md:text-sm order-1 sm:order-none" style={{ color: "#444" }}>
                  Showing {showingStart}–{showingEnd} of {ledgerEntries.length}
                </p>

                {/* Page numbers - Desktop */}
                <div className="hidden sm:flex items-center gap-1 order-2 sm:order-none">
                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-xs md:text-sm" style={{ color: "#333" }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 rounded-lg text-xs md:text-sm font-mono transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{
                          background: ledgerPage === page ? "#a3e635" : "#1a1a1a",
                          color: ledgerPage === page ? "#000" : "#555",
                          fontWeight: ledgerPage === page ? "bold" : "normal",
                        }}
                        onMouseEnter={(e) => {
                          if (ledgerPage !== page) {
                            e.currentTarget.style.background = "#222"
                            e.currentTarget.style.color = "#fff"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (ledgerPage !== page) {
                            e.currentTarget.style.background = "#1a1a1a"
                            e.currentTarget.style.color = "#555"
                          }
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Page numbers - Mobile */}
                <div className="flex sm:hidden items-center gap-1 order-2">
                  {getMobilePageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`ellipsis-mobile-${i}`} className="px-1 text-xs" style={{ color: "#333" }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={`mobile-${page}`}
                        onClick={() => handlePageChange(page)}
                        className="w-9 h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center"
                        style={{
                          background: ledgerPage === page ? "#a3e635" : "#1a1a1a",
                          color: ledgerPage === page ? "#000" : "#555",
                          fontWeight: ledgerPage === page ? "bold" : "normal",
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Prev/Next */}
                <div className="flex items-center gap-3 order-3 sm:order-none">
                  <button
                    onClick={() => handlePageChange(ledgerPage - 1)}
                    disabled={ledgerPage === 1}
                    className="flex items-center gap-1 text-xs md:text-sm transition-colors min-h-[44px] px-2"
                    style={{
                      color: ledgerPage === 1 ? "#333" : "#a3e635",
                      opacity: ledgerPage === 1 ? 0.3 : 1,
                      cursor: ledgerPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => handlePageChange(ledgerPage + 1)}
                    disabled={ledgerPage === totalPages}
                    className="flex items-center gap-1 text-xs md:text-sm transition-colors min-h-[44px] px-2"
                    style={{
                      color: ledgerPage === totalPages ? "#333" : "#a3e635",
                      opacity: ledgerPage === totalPages ? 0.3 : 1,
                      cursor: ledgerPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-xs md:text-sm text-center mt-4 md:mt-5" style={{ color: "#333" }}>
          Showing last 30 days
        </p>
      </div>

      {/* SECTION 4: ACCOUNT */}
      <div
        className="rounded-2xl p-5 md:p-8 animate-slide-up"
        style={{ background: "#111111", border: "1px solid #1a1a1a", animationDelay: "150ms" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Email + Member since */}
          <div>
            <p className="text-sm md:text-base" style={{ color: "#777" }}>
              {email}
            </p>
            <p className="text-xs md:text-sm mt-1" style={{ color: "#333" }}>
              Member since {memberSince}
            </p>
          </div>

          {/* Right: Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => {
                setEditName(username)
                setIsEditingName(true)
              }}
              className="flex-1 sm:flex-none text-xs md:text-sm px-4 md:px-5 py-2.5 rounded-lg transition-all min-h-[44px]"
              style={{
                background: "#161616",
                border: "1px solid #222",
                color: "#666",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff"
                e.currentTarget.style.borderColor = "#333"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#666"
                e.currentTarget.style.borderColor = "#222"
              }}
            >
              Edit name
            </button>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex-1 sm:flex-none text-xs md:text-sm px-4 md:px-5 py-2.5 rounded-lg transition-all min-h-[44px]"
              style={{
                background: "#150000",
                border: "1px solid #2a0a0a",
                color: "#ef4444",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a0000"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#150000"
              }}
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
