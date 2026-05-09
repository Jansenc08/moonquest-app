import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckInButton } from "@/app/dashboard/CheckInButton"
import { MonthlyMissionsSlider } from "@/components/quests/MonthlyMissionsSlider"
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
  ArrowRight,
  RefreshCw,
} from "lucide-react"

export default async function QuestsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: activeQuests } = await supabase
    .from("quests")
    .select("*")
    .eq("is_active", true)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: last7DaysCheckins } = await supabase
    .from("quest_completions")
    .select("completed_at")
    .eq("user_id", user.id)
    .gte("completed_at", sevenDaysAgo.toISOString())

  const checkinDates = new Set(
    (last7DaysCheckins || []).map((c) =>
      new Date(c.completed_at).toISOString().split("T")[0]
    )
  )

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  const lastCheckin = profile?.last_checkin_at
    ? new Date(profile.last_checkin_at).toISOString().split("T")[0]
    : null
  const hasCheckedInToday = lastCheckin === todayStr

  const pointsBalance = profile?.points_balance || 0
  const streakCount = profile?.streak_count || 0
  const streakBonus = streakCount > 0 ? Math.min(streakCount, 7) * 2 : 0
  const todayCheckInPoints = 10 + streakBonus
  const username = profile?.username || user.email?.split("@")[0] || "Player"

  const dummyQuests = [
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

  // Leaderboard data - mix static players with real user
  const staticPlayers = [
    { name: "GamerPro99", points: 850, color: "#7c3aed" },
    { name: "NightOwl", points: 720, color: "#0891b2" },
    { name: "PixelKing", points: 340, color: "#059669" },
    { name: "StarChaser", points: 280, color: "#dc2626" },
  ]

  const realUser = {
    name: username,
    points: pointsBalance,
    color: "#a3e635",
    isCurrentUser: true,
  }

  const allPlayers = [...staticPlayers, realUser]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((player, index) => ({ ...player, rank: index + 1 }))

  const getRankColor = (rank: number) => {
    if (rank === 1) return "#f59e0b"
    if (rank === 2) return "#94a3b8"
    if (rank === 3) return "#b45309"
    return "#666666"
  }

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-28 pb-20 w-full px-6 md:px-12 xl:px-[48px]">
        <div className="w-full max-w-[min(1920px,100%)] mx-auto">
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
                  {streakCount}
                </span>
                <span className="text-lg text-[#666666]">day streak</span>
              </div>
            </div>
          </div>

          {/* SECTION A — MONTHLY MISSIONS SLIDER */}
          <MonthlyMissionsSlider streakCount={streakCount} />

          {/* SECTION B — LEADERBOARD PREVIEW */}
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

                {/* Player Rows */}
                <div className="space-y-0">
                  {allPlayers.map((player, index) => (
                    <div
                      key={player.name}
                      className={`flex items-center gap-6 py-5 ${
                        index < allPlayers.length - 1
                          ? "border-b border-[#1a1a1a]"
                          : ""
                      }`}
                    >
                      {/* Rank */}
                      <span
                        className="text-2xl font-bold w-12 text-center tabular-nums"
                        style={{ color: getRankColor(player.rank) }}
                      >
                        #{player.rank}
                      </span>

                      {/* Avatar */}
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name.slice(0, 2).toUpperCase()}
                      </div>

                      {/* Name + YOU badge */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-white font-medium text-xl truncate">
                          {player.name}
                        </span>
                        {"isCurrentUser" in player && player.isCurrentUser && (
                          <span className="px-2.5 py-1 rounded-md bg-[#0d1a00] text-[#a3e635] text-sm font-bold shrink-0">
                            YOU
                          </span>
                        )}
                      </div>

                      {/* Points */}
                      <span className="text-[#a3e635] font-semibold text-xl whitespace-nowrap">
                        {player.points.toLocaleString()} pts
                      </span>
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

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10">
              {/* Daily Check-in Card in Grid */}
              <Card 
                className={`group transition-all duration-200 border-2 min-h-[300px] rounded-2xl animate-slide-up ${
                  hasCheckedInToday 
                    ? "bg-[#111111] border-[#222222] hover:border-[#a3e635]" 
                    : "bg-[#0d1a00] border-[#a3e635]"
                } hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(163,230,53,0.15)]`}
                style={{ animationDelay: "300ms" }}
              >
                <CardContent className="p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-5 py-2 rounded-full text-base font-bold uppercase ${
                      hasCheckedInToday 
                        ? "bg-[#a3e635]/20 text-[#a3e635]" 
                        : "bg-[#a3e635]/20 text-[#a3e635]"
                    }`}>
                      {hasCheckedInToday ? "✓ Done" : "Active"}
                    </span>
                    <span className="text-2xl font-bold text-[#a3e635]">+{todayCheckInPoints} pts</span>
                  </div>
                  <h3 className="text-2xl xl:text-3xl font-bold text-white mb-3">Daily Check-in</h3>
                  <p className="text-lg xl:text-xl text-[#666666] mb-8 flex-grow leading-relaxed">
                    Check in daily to earn points and build your streak
                  </p>
                  {hasCheckedInToday ? (
                    <Button disabled className="w-full bg-[#222222] text-[#888888] cursor-not-allowed text-lg py-4 h-auto rounded-xl">
                      ✓ Completed Today
                    </Button>
                  ) : (
                    <CheckInButton hasCheckedIn={false} compact fullWidth />
                  )}
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
                    <CardContent className="p-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-5 py-2 rounded-full bg-[#222222] text-[#666666] text-base font-bold uppercase">
                          Coming Soon
                        </span>
                        <span className="text-2xl font-bold text-[#666666]">+{quest.points_reward} pts</span>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <IconComponent className="h-8 w-8 text-[#555555] shrink-0" />
                        <h3 className="text-2xl xl:text-3xl font-bold text-[#888888]">{quest.title}</h3>
                      </div>
                      <p className="text-lg text-[#555555] mb-8 flex-grow leading-relaxed">
                        {quest.description}
                      </p>
                      <Button disabled className="w-full bg-[#1a1a1a] text-[#555555] cursor-not-allowed text-lg py-4 h-auto rounded-xl">
                        <Lock className="h-6 w-6 mr-2" />
                        Locked
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
