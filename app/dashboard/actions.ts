"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000

function getSGTDateKey(date: Date): string {
  const sgt = new Date(date.getTime() + SGT_OFFSET_MS)
  return `${sgt.getUTCFullYear()}-${sgt.getUTCMonth()}-${sgt.getUTCDate()}`
}

export async function checkIn() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const now = new Date()
  const todaySGT = getSGTDateKey(now)

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_checkin_at, streak_count, points_balance")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  const lastCheckin = profile.last_checkin_at
    ? new Date(profile.last_checkin_at)
    : null
  const lastCheckinSGT = lastCheckin ? getSGTDateKey(lastCheckin) : null

  if (lastCheckinSGT === todaySGT) {
    return { error: "Already checked in today" }
  }

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const yesterdaySGT = getSGTDateKey(yesterday)

  const isConsecutive = lastCheckinSGT === yesterdaySGT
  const newStreak = isConsecutive ? profile.streak_count + 1 : 1
  const pointsEarned = Math.min(10 + (newStreak - 1) * 2, 50)

  const { error } = await supabase
    .from("profiles")
    .update({
      last_checkin_at: new Date().toISOString(),
      streak_count: newStreak,
      points_balance: profile.points_balance + pointsEarned,
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Fetch the daily check-in quest and insert a completion record
  const { data: dailyQuest } = await supabase
    .from("quests")
    .select("id")
    .eq("type", "daily_checkin")
    .single()

  if (!dailyQuest) {
    console.error("Daily check-in quest not found in database")
  }

  if (dailyQuest) {
    const { error: completionError } = await supabase
      .from("quest_completions")
      .insert({
        user_id: user.id,
        quest_id: dailyQuest.id,
        completed_at: new Date().toISOString(),
      })

    if (completionError) {
      console.error("Failed to insert quest completion:", completionError)
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/quests")
  return { success: true, pointsEarned, newStreak }
}
