import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { QuestsPageClient } from "./QuestsPageClient"

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

  const now = new Date()
  const todayStr = getSGTDateKey(now)

  const lastCheckinDate = profile?.last_checkin_at
    ? new Date(profile.last_checkin_at)
    : null
  const lastCheckinSGT = lastCheckinDate ? getSGTDateKey(lastCheckinDate) : null
  const hasCheckedInToday = lastCheckinSGT === todayStr

  // Get wallet connect quest
  const { data: walletQuest } = await supabase
    .from("quests")
    .select("*")
    .eq("type", "wallet_connect")
    .single()

  // Check if user has completed wallet quest
  const { data: walletCompletion } = walletQuest
    ? await supabase
        .from("quest_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("quest_id", walletQuest.id)
        .maybeSingle()
    : { data: null }

  // Get wallet address from profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("wallet_address")
    .eq("id", user.id)
    .single()

  // Get monthly mission quests
  const { data: monthlyQuests } = await supabase
    .from("quests")
    .select("id, title, type, points_reward")
    .eq("type", "monthly_mission")

  // Get claimed monthly missions for this user
  const monthlyQuestIds = monthlyQuests?.map(q => q.id) || []
  const { data: claimedMissions } = monthlyQuestIds.length > 0
    ? await supabase
        .from("quest_completions")
        .select("quest_id")
        .eq("user_id", user.id)
        .in("quest_id", monthlyQuestIds)
    : { data: [] }

  const claimedMissionIds = new Set(claimedMissions?.map(c => c.quest_id) || [])

  // Build monthly missions map: quest_id -> { points_reward, isClaimed }
  const monthlyMissionsData = monthlyQuests?.reduce((acc, quest) => {
    acc[quest.title] = {
      quest_id: quest.id,
      points_reward: quest.points_reward,
      isClaimed: claimedMissionIds.has(quest.id),
    }
    return acc
  }, {} as Record<string, { quest_id: string; points_reward: number; isClaimed: boolean }>) || {}

  // Check if user has spun today
  const { data: spinQuest } = await supabase
    .from("quests")
    .select("id")
    .eq("title", "Daily Spin")
    .single()

  let hasSpunToday = false
  if (spinQuest) {
    const sgtNow = new Date(now.getTime() + SGT_OFFSET_MS)
    const todayStartSGT = new Date(Date.UTC(
      sgtNow.getUTCFullYear(),
      sgtNow.getUTCMonth(),
      sgtNow.getUTCDate(),
      0, 0, 0, 0
    ))
    const todayStartUTC = new Date(todayStartSGT.getTime() - SGT_OFFSET_MS)

    const { data: existingSpin } = await supabase
      .from("quest_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("quest_id", spinQuest.id)
      .gte("completed_at", todayStartUTC.toISOString())
      .limit(1)
      .single()

    hasSpunToday = !!existingSpin
  }

  const pointsBalance = profile?.points_balance || 0
  const streakCount = profile?.streak_count || 0
  const todayCheckInPoints = Math.min(10 + streakCount * 2, 50)
  const pointsEarnedToday = Math.min(10 + (streakCount - 1) * 2, 50)
  const username = profile?.username || user.email?.split("@")[0] || "Player"

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

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-28 pb-20 w-full px-6 md:px-12 xl:px-[48px]">
        <div className="w-full max-w-[min(1920px,100%)] mx-auto">
          <QuestsPageClient
            initialPointsBalance={pointsBalance}
            initialStreakCount={streakCount}
            initialHasCheckedInToday={hasCheckedInToday}
            initialHasSpunToday={hasSpunToday}
            todayCheckInPoints={todayCheckInPoints}
            pointsEarnedToday={pointsEarnedToday}
            username={username}
            allPlayers={allPlayers}
            hasConnectedWallet={!!walletCompletion}
            walletAddress={profileData?.wallet_address}
            walletQuestPoints={walletQuest?.points_reward || 50}
            monthlyMissionsData={monthlyMissionsData}
          />
        </div>
      </div>
    </main>
  )
}
