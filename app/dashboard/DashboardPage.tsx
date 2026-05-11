import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckInButton } from "./CheckInButton"
import { CountdownTimer } from "./CountdownTimer"
import { AnimatedCounter } from "./AnimatedCounter"
import {
  Coins,
  Flame,
  Star,
  Gift,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  Coffee,
  Gamepad2,
  Crown,
  Moon,
} from "lucide-react"

export async function DashboardPage() {
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
    .limit(3)

  const { data: allRewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_cost", { ascending: true })
    .limit(3)

  // Get the daily check-in quest ID
  const { data: dailyQuest } = await supabase
    .from("quests")
    .select("id")
    .eq("type", "daily_checkin")
    .single()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: last7DaysCheckins } = dailyQuest
    ? await supabase
        .from("quest_completions")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("quest_id", dailyQuest.id)
        .gte("completed_at", sevenDaysAgo.toISOString())
    : { data: [] }

  const SGT_OFFSET_MS = 8 * 60 * 60 * 1000
  
  function getSGTDateKey(date: Date): string {
    const sgt = new Date(date.getTime() + SGT_OFFSET_MS)
    return `${sgt.getUTCFullYear()}-${String(sgt.getUTCMonth() + 1).padStart(2, "0")}-${String(sgt.getUTCDate()).padStart(2, "0")}`
  }

  const checkinDates = new Set(
    (last7DaysCheckins || []).map((c) => getSGTDateKey(new Date(c.completed_at)))
  )

  const now = new Date()
  const todayStr = getSGTDateKey(now)
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const dateStr = getSGTDateKey(date)
    const sgtDate = new Date(date.getTime() + SGT_OFFSET_MS)
    const dayNames = ["S", "M", "T", "W", "T", "F", "S"]
    return {
      date: dateStr,
      dayLabel: dayNames[sgtDate.getUTCDay()],
      completed: checkinDates.has(dateStr),
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
    }
  })

  const userPoints = profile?.points_balance || 0
  const { data: affordableReward } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .lte("points_cost", userPoints)
    .order("points_cost", { ascending: true })
    .limit(1)
    .single()

  const { data: cheapestReward } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_cost", { ascending: true })
    .limit(1)
    .single()

  const lastCheckinDate = profile?.last_checkin_at
    ? new Date(profile.last_checkin_at)
    : null
  const lastCheckinSGT = lastCheckinDate ? getSGTDateKey(lastCheckinDate) : null
  const hasCheckedInToday = lastCheckinSGT === todayStr

  const username = profile?.username || user.email?.split("@")[0] || "Gamer"
  const firstName = username.split(/[._-]/)[0]

  const pointsBalance = profile?.points_balance || 0
  const currentLevel = Math.floor(pointsBalance / 500) + 1

  const streakCount = profile?.streak_count || 0
  // Points for NEXT check-in: base 10 + (current_streak * 2), max 50
  const todayCheckInPoints = Math.min(10 + streakCount * 2, 50)
  // Points they actually earned today (if already checked in)
  const pointsEarnedToday = Math.min(10 + (streakCount - 1) * 2, 50)

  const getStreakMessage = () => {
    if (streakCount >= 7) {
      return `You're on a ${streakCount}-day streak. Don't break it — check in today and earn ${todayCheckInPoints} pts.`
    } else if (streakCount >= 3) {
      return `You're on a ${streakCount}-day streak. Keep it going!`
    } else if (streakCount === 1) {
      return "Great start! Come back tomorrow to build your streak."
    }
    return "Start your streak today — check in and earn your first points."
  }

  const rewardIcons = [Gift, Coffee, Gamepad2, Crown]

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-28 pb-16 w-full px-8 lg:px-16 xl:px-24">
        <div className="w-full max-w-[1800px] mx-auto">
          
          {/* SECTION 1 — HERO */}
          <section 
            className="mb-16 py-12 w-full grid lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center min-h-[500px]"
          >
            {/* LEFT SIDE */}
            <div className="flex flex-col justify-center gap-6 animate-slide-up">
              {/* Signed in badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#a3e635] bg-[#0d1a00] w-fit">
                <CheckCircle2 className="h-5 w-5 text-[#a3e635]" />
                <span className="text-base text-[#a3e635] font-medium">
                  Signed in as {username}
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[64px] font-bold leading-[1.1]">
                <span className="text-white">Welcome back,</span>
                <br />
                <span className="text-[#a3e635]">{firstName}.</span>
              </h1>

              {/* Dynamic subtext */}
              <p className="text-xl text-[#888888] max-w-xl">
                {getStreakMessage()}
              </p>

              {/* Mini stats card */}
              <div 
                className="inline-flex items-center gap-8 px-8 py-6 rounded-2xl bg-[#111111] border border-[#1a1a1a] w-fit animate-slide-up" 
                style={{ animationDelay: "100ms" }}
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#a3e635]">
                    <AnimatedCounter value={pointsBalance} />
                  </p>
                  <p className="text-sm text-[#666666] uppercase tracking-wider mt-1">Balance</p>
                </div>
                <div className="w-px h-12 bg-[#222222]" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{streakCount}</p>
                  <p className="text-sm text-[#666666] uppercase tracking-wider mt-1">Days</p>
                </div>
                <div className="w-px h-12 bg-[#222222]" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{currentLevel}</p>
                  <p className="text-sm text-[#666666] uppercase tracking-wider mt-1">Level</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <Link href="/quests">
                  <Button className="bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-semibold text-lg px-8 py-4 h-auto">
                    Continue Playing
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/rewards">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 hover:text-white font-medium text-lg px-8 py-4 h-auto">
                    View Rewards
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT SIDE — Floating Cards */}
            <div className="relative h-[600px] w-full hidden lg:block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,230,53,0.1)_0%,transparent_70%)]" />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="particle particle-1" />
                <div className="particle particle-2" />
                <div className="particle particle-3" />
                <div className="particle particle-4" />
                <div className="particle particle-5" />
                <div className="particle particle-6" />
              </div>

              {/* Card 1 — Daily Check-in (top right) */}
              <Card 
                className={`absolute top-0 right-0 w-[520px] animate-float ${
                  hasCheckedInToday 
                    ? "bg-[#111111] border-[#222222]" 
                    : "bg-[#111111] border-2 border-[#a3e635]"
                }`}
                style={{ "--rotation": "2deg" } as React.CSSProperties}
              >
                <CardContent className="p-12">
                  {!hasCheckedInToday ? (
                    <>
                      <span className="inline-block px-8 py-3 rounded-full bg-[#a3e635] text-black text-xl font-bold uppercase mb-8">
                        Daily Quest
                      </span>
                      <div className="mb-8">
                        <CountdownTimer />
                      </div>
                      <p className="text-2xl text-[#888888] mb-8">
                        Day {streakCount + 1} — earn <span className="text-[#a3e635] font-bold">{todayCheckInPoints} pts</span> today
                      </p>
                      <CheckInButton hasCheckedIn={false} compact fullWidth />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-5 mb-8">
                        <CheckCircle2 className="h-14 w-14 text-[#a3e635]" />
                        <span className="text-4xl text-[#a3e635] font-bold">Checked in!</span>
                      </div>
                      <p className="text-2xl text-[#888888] mb-5">
                        Come back tomorrow ✓
                      </p>
                      <p className="text-xl text-[#a3e635] font-semibold">
                        +{pointsEarnedToday} pts earned today
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Card 2 — Affordable Reward (bottom left) */}
              <Card 
                className="absolute bottom-0 left-0 w-[480px] bg-[#111111] border-[#222222] animate-float-delayed-2"
                style={{ "--rotation": "-3deg" } as React.CSSProperties}
              >
                <CardContent className="p-12">
                  <div className="flex items-center gap-8 mb-8">
                    <div className="w-24 h-24 rounded-2xl bg-[#a3e635]/10 flex items-center justify-center">
                      <Gift className="h-12 w-12 text-[#a3e635]" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-3xl mb-2">
                        {affordableReward?.title || cheapestReward?.title || "Rewards"}
                      </p>
                      {affordableReward ? (
                        <p className="text-xl text-[#a3e635]">You can afford this!</p>
                      ) : (
                        <p className="text-xl text-[#666666]">
                          Need {(cheapestReward?.points_cost || 100) - pointsBalance} more pts
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="h-9 w-9 text-[#a3e635]" />
                      <span className="text-4xl font-bold text-white">
                        {affordableReward?.points_cost || cheapestReward?.points_cost || 100}
                      </span>
                      <span className="text-xl text-[#666666]">pts</span>
                    </div>
                    {affordableReward && (
                      <Link href="/rewards">
                        <Button className="bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-bold text-xl px-10 py-4 h-auto">
                          Redeem
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* SECTION 2 — DAILY CHECK-IN FEATURED CARD */}
          <section className="mb-16">
            <Card className="bg-[#0d1a00] border-[#a3e635] animate-pulse-glow-white">
              <CardContent className="p-0">
                <div className="flex flex-col lg:grid lg:grid-cols-[70%_30%] gap-4 lg:gap-8">
                  {/* LEFT SIDE */}
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                      <span className="px-4 py-1.5 rounded-full bg-[#a3e635] text-black text-sm font-bold uppercase tracking-wide">
                        Daily Quest
                      </span>
                      <Zap className="h-6 w-6 text-[#a3e635]" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3">
                      Daily Check-in
                    </h2>
                    <p className="text-[#888888] text-sm md:text-base mb-6 md:mb-8">
                      Check in daily to maintain your streak and earn bonus points
                    </p>

                    {/* Last 7 Days */}
                    <div className="mb-6 md:mb-8">
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-3 md:mb-4">
                        Last 7 Days
                      </p>
                      <div className="flex items-center gap-2 md:gap-3">
                        {last7Days.map((day, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5 md:gap-2">
                            <div
                             className={day.isToday && day.completed ? "moon-glow" : ""}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                animationDelay: `${i * 80}ms`,
                                backgroundColor: day.completed ? "#222222" : "#1a1a1a",
                                border: day.isToday && day.completed
                                  ? "2px solid #ffffff"
                                  : day.isToday && !day.completed
                                  ? "1px solid rgba(255,255,255,0.4)"
                                  : day.completed
                                  ? "1px solid #555555"
                                  : "1px solid #2a2a2a",
                                boxShadow: day.isToday && day.completed
                                  ? "0 0 12px rgba(255,255,255,0.5)"
                                  : "none",
                              }}
                            >
                              <Moon
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  color: day.isToday
                                    ? "#ffffff"
                                    : day.completed
                                    ? "#aaaaaa"
                                    : "#333333",
                                  fill: day.completed 
                                    ? (day.isToday ? "#ffffff" : "#aaaaaa") 
                                    : "none",
                                }}
                              />
                            </div>
                            <span 
                              className="text-[10px] md:text-xs font-medium"
                              style={{
                                color: day.isToday && day.completed
                                  ? "#ffffff"
                                  : day.isToday
                                  ? "rgba(255,255,255,0.5)"
                                  : day.completed
                                  ? "#888888"
                                  : "#444444",
                                fontWeight: day.isToday && day.completed ? 600 : 500,
                              }}
                            >
                              {day.dayLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-8">
                      <div>
                        <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Day</p>
                        <p className="text-2xl md:text-3xl font-bold text-[#a3e635]">{streakCount + 1}</p>
                      </div>
                      <div className="w-px h-10 md:h-12 bg-[#333333]" />
                      <div>
                        <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Reward</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">+{todayCheckInPoints} pts</p>
                      </div>
                      <div className="hidden md:block w-px h-12 bg-[#333333]" />
                      <div className="hidden md:block">
                        <CountdownTimer />
                      </div>
                    </div>
                    
                    {/* Mobile countdown */}
                    <div className="mt-4 md:hidden">
                      <CountdownTimer />
                    </div>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-[#333333]">
                    <CheckInButton hasCheckedIn={hasCheckedInToday} />
                    {!hasCheckedInToday && (
                      <p className="text-sm text-[#888888] mt-4 text-center">
                        Day {streakCount + 1} streak — earn {todayCheckInPoints} pts today
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3 — ACTIVE QUESTS */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-sm text-[#a3e635] uppercase tracking-widest mb-2">Your Quests</p>
                <h2 className="text-4xl font-bold text-white">Active quests</h2>
              </div>
              <Link href="/quests" className="flex items-center gap-2 text-lg text-[#888888] hover:text-[#a3e635] transition-colors">
                View all <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Daily Check-in Quest Card */}
              <Card className={`group transition-all duration-200 hover:-translate-y-2 border-2 ${
                hasCheckedInToday 
                  ? "bg-[#111111] border-[#222222] hover:border-[#a3e635]" 
                  : "bg-[#0d1a00] border-[#a3e635]"
              } hover:shadow-[0_0_40px_rgba(163,230,53,0.2)]`}>
                <CardContent className="p-6 md:p-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`px-5 py-2 rounded-full text-base font-bold uppercase ${
                      hasCheckedInToday 
                        ? "bg-[#a3e635]/20 text-[#a3e635]" 
                        : "bg-[#a3e635]/20 text-[#a3e635]"
                    }`}>
                      {hasCheckedInToday ? "✓ Done" : "Active"}
                    </span>
                    <span className="text-xl font-bold text-[#a3e635]">
                      +{hasCheckedInToday ? pointsEarnedToday : todayCheckInPoints} pts
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Daily Check-in</h3>
                  <p className="text-lg text-[#666666] mb-6">Check in daily to earn points and build your streak</p>
                  {hasCheckedInToday ? (
                    <Button disabled className="w-full bg-[#222222] text-[#666666] cursor-not-allowed text-lg py-4 h-auto">
                      ✓ Completed
                    </Button>
                  ) : (
                    <CheckInButton hasCheckedIn={false} compact fullWidth />
                  )}
                </CardContent>
              </Card>

              {/* Coming Soon Quest Cards */}
              {[
                { title: "Social Share", desc: "Share your progress on social media" },
                { title: "Refer a Friend", desc: "Invite friends to join Moonquest" },
              ].map((quest, i) => (
                <Card key={i} className="bg-[#111111] border-2 border-[#1a1a1a] opacity-60 hover:border-[#a3e635]/50 hover:opacity-80 transition-all duration-200">
                  <CardContent className="p-6 md:p-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-5 py-2 rounded-full bg-[#222222] text-[#666666] text-base font-bold uppercase">
                        Coming Soon
                      </span>
                      <span className="text-xl font-bold text-[#666666]">+15 pts</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#888888] mb-3">{quest.title}</h3>
                    <p className="text-lg text-[#555555] mb-6">{quest.desc}</p>
                    <Button disabled className="w-full bg-[#1a1a1a] text-[#555555] cursor-not-allowed text-lg py-4 h-auto">
                      <Lock className="h-5 w-5 mr-2" />
                      Locked
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* SECTION 4 — REWARDS */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-sm text-[#a3e635] uppercase tracking-widest mb-2">Rewards Store</p>
                <h2 className="text-4xl font-bold text-white">Rewards you can afford</h2>
              </div>
              <Link href="/rewards" className="flex items-center gap-2 text-lg text-[#888888] hover:text-[#a3e635] transition-colors">
                View all <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {(allRewards || []).map((reward, i) => {
                const canAfford = pointsBalance >= reward.points_cost
                const IconComponent = rewardIcons[i % rewardIcons.length]
                
                return (
                  <Card 
                    key={reward.id} 
                    className={`group transition-all duration-200 border-2 ${
                      canAfford 
                        ? "bg-[#111111] border-[#1a1a1a] hover:border-[#a3e635] hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(163,230,53,0.2)]" 
                        : "bg-[#111111] border-[#1a1a1a] opacity-60 hover:border-[#a3e635]/50 hover:opacity-80"
                    }`}
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <CardContent className="p-6 md:p-10">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                        canAfford ? "bg-[#a3e635]/10" : "bg-[#222222]"
                      }`}>
                        <IconComponent className={`h-10 w-10 ${canAfford ? "text-[#a3e635]" : "text-[#555555]"}`} />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 ${canAfford ? "text-white" : "text-[#888888]"}`}>
                        {reward.title}
                      </h3>
                      <p className={`text-lg mb-6 ${canAfford ? "text-[#666666]" : "text-[#555555]"}`}>
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {canAfford ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Coins className="h-6 w-6 text-[#a3e635]" />
                              <span className="text-2xl font-bold text-[#a3e635]">{reward.points_cost}</span>
                              <span className="text-base text-[#666666]">pts</span>
                            </div>
                            <Link href="/rewards">
                              <Button className="bg-[#a3e635] hover:bg-[#a3e635]/90 text-black font-bold text-base px-6 py-2.5 h-auto">
                                Redeem
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <span className="text-lg text-[#666666]">
                              Need {reward.points_cost - pointsBalance} more pts
                            </span>
                            <Button disabled className="bg-[#1a1a1a] text-[#555555] cursor-not-allowed text-base px-6 py-2.5 h-auto">
                              <Lock className="h-4 w-4 mr-2" />
                              Locked
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Fallback if no rewards */}
              {(!allRewards || allRewards.length === 0) && (
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-[#111111] border-2 border-[#1a1a1a] opacity-60 hover:border-[#a3e635]/50 hover:opacity-80 transition-all duration-200">
                      <CardContent className="p-6 md:p-10">
                        <div className="w-20 h-20 rounded-2xl bg-[#222222] flex items-center justify-center mb-6">
                          <Gift className="h-10 w-10 text-[#555555]" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#888888] mb-3">Coming Soon</h3>
                        <p className="text-lg text-[#555555] mb-6">New rewards are on the way</p>
                        <Button disabled className="bg-[#1a1a1a] text-[#555555] cursor-not-allowed text-base px-6 py-2.5 h-auto">
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
