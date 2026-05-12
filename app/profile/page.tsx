import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { ProfilePageClient } from "./ProfilePageClient"

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

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 2. Fetch quest completions with quest info
  const { data: completions } = await supabase
    .from("quest_completions")
    .select("id, completed_at, points_earned, quests(title, type)")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(30)

  // 3. Fetch redemptions with reward info
  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("id, redeemed_at, points_spent, rewards(title, points_cost)")
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })
    .limit(30)

  // 4. Count completed quests
  const { count: questCount } = await supabase
    .from("quest_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // 5. Count redemptions
  const { count: redemptionCount } = await supabase
    .from("redemptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Leaderboard data
  const staticPlayers: Player[] = [
    { name: "GamerPro99", points: 850 },
    { name: "NightOwl", points: 720 },
    { name: "PixelKing", points: 340 },
    { name: "StarChaser", points: 280 },
  ]

  const username = profile?.username || user.email?.split("@")[0] || "Player"
  const userPoints = profile?.points_balance || 0

  const realUser: Player = {
    name: username,
    points: userPoints,
    isCurrentUser: true,
  }

  const allPlayers = [...staticPlayers, realUser]
    .sort((a, b) => b.points - a.points)
    .map((player, index) => ({ ...player, rank: index + 1 }))

  const userRank = allPlayers.find((p) => p.isCurrentUser)?.rank || allPlayers.length
  const userIndex = allPlayers.findIndex((p) => p.isCurrentUser)
  const nextAbove = userIndex > 0 ? allPlayers[userIndex - 1] : null
  const nextBelow = userIndex < allPlayers.length - 1 ? allPlayers[userIndex + 1] : null
  const topPlayer = allPlayers[0]

  // Member since
  const createdAt = new Date(user.created_at)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const memberSince = `${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`

  return (
    <main className="min-h-screen bg-[#080808]">
      <Navbar />

      <div className="pt-20 md:pt-28 pb-16 md:pb-20 w-full px-4 md:px-8 lg:px-12 xl:px-[48px]">
        <div className="w-full max-w-[min(1920px,100%)] mx-auto">
          <ProfilePageClient
            userId={user.id}
            email={user.email || ""}
            username={username}
            walletAddress={profile?.wallet_address || null}
            pointsBalance={userPoints}
            streakCount={profile?.streak_count || 0}
            questCount={questCount || 0}
            redemptionCount={redemptionCount || 0}
            completions={(completions as QuestCompletion[]) || []}
            redemptions={(redemptions as Redemption[]) || []}
            userRank={userRank}
            topPlayer={topPlayer}
            nextAbove={nextAbove}
            nextBelow={nextBelow}
            memberSince={memberSince}
          />
        </div>
      </div>
    </main>
  )
}
