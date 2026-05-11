"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckInButton } from "@/app/dashboard/CheckInButton"
import { SpinWheelSection } from "@/components/quests/SpinWheelSection"
import { MonthlyMissionsSlider } from "@/components/quests/MonthlyMissionsSlider"
import { QuestDetailsModal } from "@/components/quests/QuestDetailsModal"
import {
  Coins,
  Flame,
  CheckCircle2,
  Lock,
  Share2,
  Users,
  Trophy,
  Target,
  Calendar,
  Disc,
  ArrowRight,
  RefreshCw,
  Wallet,
} from "lucide-react"
import { ConnectWalletButton } from "@/components/quests/ConnectWalletButton"
import type { LucideIcon } from "lucide-react"

interface Quest {
  id: string
  title: string
  description: string
  points_reward: number
  type: "daily_checkin" | "daily_spin" | "wallet_connect" | "dummy"
}

interface DummyQuest {
  id: string
  title: string
  description: string
  points_reward: number
  icon: LucideIcon
}

interface Player {
  name: string
  points: number
  color: string
  rank: number
  isCurrentUser?: boolean
}

interface MonthlyMissionData {
  quest_id: string
  points_reward: number
  isClaimed: boolean
}

interface QuestsPageClientProps {
  initialPointsBalance: number
  initialStreakCount: number
  initialHasCheckedInToday: boolean
  initialHasSpunToday: boolean
  todayCheckInPoints: number
  pointsEarnedToday: number
  username: string
  allPlayers: Player[]
  hasConnectedWallet: boolean
  walletAddress?: string | null
  walletQuestPoints: number
  monthlyMissionsData: Record<string, MonthlyMissionData>
}

const dummyQuests: DummyQuest[] = [
  {
    id: "social-share",
    title: "Social Share",
    description: "Share your Moonquest progress on social media",
    points_reward: 15,
    icon: Share2,
  },
  {
    id: "refer-friend",
    title: "Refer a Friend",
    description: "Invite a friend to join Moonquest and earn bonus points",
    points_reward: 50,
    icon: Users,
  },
  {
    id: "first-redemption",
    title: "First Redemption",
    description: "Redeem your first reward from the store",
    points_reward: 25,
    icon: Trophy,
  },
  {
    id: "weekly-warrior",
    title: "Weekly Warrior",
    description: "Complete check-ins for 7 consecutive days",
    points_reward: 100,
    icon: Target,
  },
  {
    id: "monthly-master",
    title: "Monthly Master",
    description: "Check in every day for an entire month",
    points_reward: 500,
    icon: Calendar,
  },
]

function getRankColor(rank: number) {
  if (rank === 1) return "#f59e0b"
  if (rank === 2) return "#94a3b8"
  if (rank === 3) return "#b45309"
  return "#666666"
}

export function QuestsPageClient({
  initialPointsBalance,
  initialStreakCount,
  initialHasCheckedInToday,
  initialHasSpunToday,
  todayCheckInPoints,
  pointsEarnedToday,
  username,
  allPlayers,
  hasConnectedWallet: initialHasConnectedWallet,
  walletAddress,
  walletQuestPoints,
  monthlyMissionsData,
}: QuestsPageClientProps) {
  const [pointsBalance, setPointsBalance] = useState(initialPointsBalance)
  const [hasSpunToday, setHasSpunToday] = useState(initialHasSpunToday)
  const [hasConnectedWallet, setHasConnectedWallet] = useState(initialHasConnectedWallet)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false)

  function handleMissionClaim(result: { new_balance: number }) {
    setPointsBalance(result.new_balance)
  }

  function handleSpinComplete(result: { new_balance: number }) {
    setPointsBalance(result.new_balance)
    setHasSpunToday(true)
  }

  function openQuestModal(quest: Quest) {
    setSelectedQuest(quest)
    setIsQuestModalOpen(true)
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14 animate-slide-up">
        <div>
          <p className="text-base text-[#a3e635] uppercase tracking-widest mb-3">
            Quests
          </p>
          <h1 className="text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight">
            Mission Board
          </h1>
          <p className="text-2xl text-[#888888] max-w-3xl">
            Complete quests to earn points and build your streak
          </p>
        </div>

        {/* Header Stats Pills */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4 px-8 py-4 rounded-full bg-[#111111] border border-[#222222]">
            <Coins className="h-8 w-8 text-[#a3e635]" />
            <span className="text-3xl font-bold text-white">
              {pointsBalance.toLocaleString()}
            </span>
            <span className="text-lg text-[#666666]">pts</span>
          </div>
          <div className="flex items-center gap-4 px-8 py-4 rounded-full bg-[#111111] border border-[#222222]">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-3xl font-bold text-white">
              {initialStreakCount}
            </span>
            <span className="text-lg text-[#666666]">day streak</span>
          </div>
        </div>
      </div>

      {/* SECTION A — DAILY SPIN */}
      <SpinWheelSection 
        initialHasSpun={hasSpunToday} 
        onSpinComplete={handleSpinComplete}
      />

      {/* SECTION B — MONTHLY MISSIONS SLIDER */}
      <MonthlyMissionsSlider 
        streakCount={initialStreakCount} 
        monthlyMissionsData={monthlyMissionsData}
        onMissionClaim={handleMissionClaim}
      />

      {/* SECTION C — LEADERBOARD PREVIEW */}
      <section className="mb-16">
        <Card className="bg-[#111111] border-[#1a1a1a] rounded-2xl">
          <CardContent className="p-10 xl:p-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div>
                <p className="text-base text-[#a3e635] uppercase tracking-widest mb-2">
                  Leaderboard
                </p>
                <h2 className="text-4xl font-bold text-white">
                  Top Players This Week
                </h2>
              </div>
              <Link
                href="/leaderboard"
                className="flex items-center gap-2 text-xl text-[#a3e635] hover:text-[#a3e635]/80 transition-colors shrink-0"
              >
                View Full Leaderboard
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>

            {/* Players */}
            <div className="space-y-5">
              {allPlayers.map((player) => (
                <div
                  key={player.name}
                  className={`flex items-center gap-6 p-6 rounded-xl transition-colors ${
                    player.isCurrentUser
                      ? "bg-[#0d1a00] border border-[#a3e635]/30"
                      : "bg-[#0a0a0a] border border-transparent hover:border-[#222222]"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: getRankColor(player.rank) }}
                  >
                    #{player.rank}
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold text-white truncate">
                      {player.name}
                      {player.isCurrentUser && (
                        <span className="ml-3 text-base text-[#a3e635]">(You)</span>
                      )}
                    </p>
                  </div>
                  {/* Points */}
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-white">
                      {player.points.toLocaleString()}
                    </p>
                    <p className="text-base text-[#666666]">pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-10 text-[#666666] text-lg">
              <RefreshCw className="h-6 w-6 shrink-0" />
              <span>Leaderboard resets every Monday at midnight</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ALL QUESTS GRID */}
      <section>
        <h2 className="text-4xl xl:text-5xl font-bold text-white mb-10 animate-slide-up" style={{ animationDelay: "200ms" }}>
          All Quests
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10">
          {/* Daily Check-in Card in Grid */}
          <Card 
            className={`group transition-all duration-200 border-2 min-h-[300px] rounded-2xl animate-slide-up ${
              initialHasCheckedInToday 
                ? "bg-[#111111] border-[#222222] hover:border-[#a3e635]" 
                : "bg-[#0d1a00] border-[#a3e635]"
            } hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(163,230,53,0.15)]`}
            style={{ animationDelay: "300ms" }}
          >
            <CardContent className="p-6 md:p-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-5 py-2 rounded-full text-base font-bold uppercase ${
                  initialHasCheckedInToday 
                    ? "bg-[#a3e635]/20 text-[#a3e635]" 
                    : "bg-[#a3e635]/20 text-[#a3e635]"
                }`}>
                  {initialHasCheckedInToday ? "✓ Done" : "Active"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#a3e635]">
                    +{initialHasCheckedInToday ? pointsEarnedToday : todayCheckInPoints} pts
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openQuestModal({
                        id: "daily-checkin",
                        title: "Daily Check-in",
                        description: "Check in daily to earn points and build your streak",
                        points_reward: todayCheckInPoints,
                        type: "daily_checkin",
                      })
                    }}
                    className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                  >
                    ?
                  </button>
                </div>
              </div>
              <h3 className="text-2xl xl:text-3xl font-bold text-white mb-3">Daily Check-in</h3>
              <p className="text-lg xl:text-xl text-[#666666] mb-8 flex-grow leading-relaxed">
                Check in daily to earn points and build your streak
              </p>
              {initialHasCheckedInToday ? (
                <Button disabled className="w-full bg-[#222222] text-[#888888] cursor-not-allowed text-base font-bold h-[52px] rounded-lg">
                  ✓ Completed Today
                </Button>
              ) : (
                <CheckInButton hasCheckedIn={false} compact fullWidth />
              )}
            </CardContent>
          </Card>

          {/* Daily Spin Card in Grid */}
          <Card 
            className={`group transition-all duration-200 border-2 min-h-[300px] rounded-2xl animate-slide-up ${
              hasSpunToday 
                ? "bg-[#111111] border-[#222222] hover:border-[#a3e635]" 
                : "bg-[#0d1a00] border-[#a3e635]"
            } hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(163,230,53,0.15)]`}
            style={{ animationDelay: "350ms" }}
          >
            <CardContent className="p-6 md:p-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-5 py-2 rounded-full text-base font-bold uppercase ${
                  hasSpunToday 
                    ? "bg-[#a3e635]/20 text-[#a3e635]" 
                    : "bg-[#a3e635]/20 text-[#a3e635]"
                }`}>
                  {hasSpunToday ? "✓ Done" : "Active"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#a3e635]">Up to +100 pts</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openQuestModal({
                        id: "daily-spin",
                        title: "Daily Spin",
                        description: "Spin the wheel once per day to win bonus points!",
                        points_reward: 100,
                        type: "daily_spin",
                      })
                    }}
                    className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                  >
                    ?
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Disc className="h-8 w-8 text-[#a3e635] shrink-0" />
                <h3 className="text-2xl xl:text-3xl font-bold text-white">Daily Spin</h3>
              </div>
              <p className="text-lg xl:text-xl text-[#666666] mb-8 flex-grow leading-relaxed">
                Spin the wheel once per day to win bonus points!
              </p>
              {hasSpunToday ? (
                <Button disabled className="w-full bg-[#222222] text-[#888888] cursor-not-allowed text-base font-bold h-[52px] rounded-lg">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Spun Today
                </Button>
              ) : (
                <a href="#spin-section">
                  <Button className="w-full bg-[#a3e635] text-black hover:bg-[#a3e635]/90 text-base font-bold h-[52px] rounded-lg">
                    Spin Now
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Connect Wallet Card */}
          <Card 
            className={`group transition-all duration-200 border-2 min-h-[300px] rounded-2xl animate-slide-up ${
              hasConnectedWallet 
                ? "bg-[#111111] border-[#1a1a1a]" 
                : "bg-[#0d1a00] border-[#a3e635] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(163,230,53,0.15)]"
            }`}
            style={{ animationDelay: "400ms" }}
          >
            <CardContent className="p-6 md:p-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className={`px-5 py-2 rounded-full text-base font-bold uppercase ${
                  hasConnectedWallet 
                    ? "bg-[#a3e635]/20 text-[#a3e635]" 
                    : "bg-[#a3e635]/20 text-[#a3e635]"
                }`}>
                  {hasConnectedWallet ? "✓ Done" : "Active"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#a3e635]">+{walletQuestPoints} pts</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openQuestModal({
                        id: "wallet-connect",
                        title: "Connect Wallet",
                        description: "Connect your Web3 wallet to unlock onchain rewards",
                        points_reward: walletQuestPoints,
                        type: "wallet_connect",
                      })
                    }}
                    className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                  >
                    ?
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Wallet className="h-8 w-8 text-[#a3e635] shrink-0" />
                <h3 className="text-2xl xl:text-3xl font-bold text-white">Connect Wallet</h3>
              </div>
              <p className="text-lg xl:text-xl text-[#666666] mb-8 flex-grow leading-relaxed">
                Connect your Web3 wallet to unlock onchain rewards
              </p>
              <ConnectWalletButton
                isCompleted={hasConnectedWallet}
                walletAddress={walletAddress}
                onComplete={(result) => {
                  setPointsBalance(result.new_balance)
                  setHasConnectedWallet(true)
                }}
              />
            </CardContent>
          </Card>

          {/* Dummy Quest Cards */}
          {dummyQuests.map((quest, i) => {
            const IconComponent = quest.icon
            return (
              <Card 
                key={quest.id}
                className="bg-[#111111] border-2 border-[#1a1a1a] opacity-60 min-h-[300px] rounded-2xl animate-slide-up"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <CardContent className="p-6 md:p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-5 py-2 rounded-full bg-[#222222] text-[#666666] text-base font-bold uppercase">
                      Coming Soon
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#666666]">+{quest.points_reward} pts</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openQuestModal({
                            id: quest.id,
                            title: quest.title,
                            description: quest.description,
                            points_reward: quest.points_reward,
                            type: "dummy",
                          })
                        }}
                        className="w-[22px] h-[22px] rounded-full bg-[#1a1a1a] border border-[#333] text-[#666] text-[11px] font-bold flex items-center justify-center hover:bg-[#a3e635] hover:border-[#a3e635] hover:text-black transition-all duration-200"
                      >
                        ?
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <IconComponent className="h-8 w-8 text-[#555555] shrink-0" />
                    <h3 className="text-2xl xl:text-3xl font-bold text-[#888888]">{quest.title}</h3>
                  </div>
                  <p className="text-lg text-[#555555] mb-8 flex-grow leading-relaxed">
                    {quest.description}
                  </p>
                  <Button disabled className="w-full bg-[#1a1a1a] text-[#555555] cursor-not-allowed text-base font-bold h-[52px] rounded-lg">
                    <Lock className="h-5 w-5 mr-2" />
                    Locked
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Quest Details Modal */}
      <QuestDetailsModal
        quest={selectedQuest}
        isOpen={isQuestModalOpen}
        onClose={() => setIsQuestModalOpen(false)}
        streakCount={initialStreakCount}
        isCompletedToday={
          selectedQuest?.type === "daily_checkin"
            ? initialHasCheckedInToday
            : selectedQuest?.type === "daily_spin"
              ? hasSpunToday
              : selectedQuest?.type === "wallet_connect"
                ? hasConnectedWallet
                : false
        }
      />
    </>
  )
}
