"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function checkIn() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const today = new Date().toISOString().split("T")[0]

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_checkin_at, streak_count, points_balance")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return { error: "Profile not found" }
  }

  const lastCheckin = profile.last_checkin_at
    ? new Date(profile.last_checkin_at).toISOString().split("T")[0]
    : null

  if (lastCheckin === today) {
    return { error: "Already checked in today" }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  const isConsecutive = lastCheckin === yesterdayStr
  const newStreak = isConsecutive ? profile.streak_count + 1 : 1
  const pointsEarned = 10 + (newStreak > 1 ? Math.min(newStreak, 7) * 2 : 0)

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

  revalidatePath("/dashboard")
  return { success: true, pointsEarned, newStreak }
}
