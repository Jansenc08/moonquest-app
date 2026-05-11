import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const SGT_OFFSET_MS = 8 * 60 * 60 * 1000

function getSGTDateKey(date: Date): string {
  const sgt = new Date(date.getTime() + SGT_OFFSET_MS)
  return `${sgt.getUTCFullYear()}-${sgt.getUTCMonth()}-${sgt.getUTCDate()}`
}

const segments = [
  { points: 0, weight: 10, label: "Better luck tomorrow" },
  { points: 5, weight: 25, label: "Nice try!" },
  { points: 10, weight: 25, label: "Keep going!" },
  { points: 15, weight: 15, label: "Not bad!" },
  { points: 25, weight: 10, label: "Great spin!" },
  { points: 50, weight: 8, label: "Amazing!" },
  { points: 75, weight: 5, label: "Incredible!" },
  { points: 100, weight: 2, label: "JACKPOT!" },
]

function getWeightedRandomSegment() {
  const totalWeight = segments.reduce((a, b) => a + b.weight, 0)
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < segments.length; i++) {
    random -= segments[i].weight
    if (random <= 0) {
      return { ...segments[i], index: i }
    }
  }
  
  return { ...segments[0], index: 0 }
}

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Get the Daily Spin quest
    const { data: spinQuest, error: questError } = await supabase
      .from("quests")
      .select("id")
      .eq("title", "Daily Spin")
      .single()

    if (questError || !spinQuest) {
      return NextResponse.json(
        { error: "Daily Spin quest not found" },
        { status: 404 }
      )
    }

    // Check if user has already spun today (SGT timezone)
    const now = new Date()
    const todaySGT = getSGTDateKey(now)

    // Get today's start in SGT (convert back to UTC for query)
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

    if (existingSpin) {
      return NextResponse.json(
        { error: "Already spun today" },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Generate random result
    const result = getWeightedRandomSegment()
    const newBalance = profile.points_balance + result.points

    // Update points if won any
    if (result.points > 0) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ points_balance: newBalance })
        .eq("id", user.id)

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update points" },
          { status: 500 }
        )
      }
    }

    // Record the spin in quest_completions
    const { error: completionError } = await supabase
      .from("quest_completions")
      .insert({
        user_id: user.id,
        quest_id: spinQuest.id,
        completed_at: new Date().toISOString(),
      })

    if (completionError) {
      // Rollback points if completion failed
      if (result.points > 0) {
        await supabase
          .from("profiles")
          .update({ points_balance: profile.points_balance })
          .eq("id", user.id)
      }

      return NextResponse.json(
        { error: "Failed to record spin" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      points_earned: result.points,
      label: result.label,
      segment_index: result.index,
      new_balance: newBalance,
      message: result.points > 0 
        ? `You won ${result.points} points!` 
        : "Better luck tomorrow!",
    })
  } catch (error) {
    console.error("Spin error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Get the Daily Spin quest
    const { data: spinQuest } = await supabase
      .from("quests")
      .select("id")
      .eq("title", "Daily Spin")
      .single()

    if (!spinQuest) {
      return NextResponse.json({ hasSpunToday: false })
    }

    // Check if user has already spun today
    const now = new Date()
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

    return NextResponse.json({
      hasSpunToday: !!existingSpin,
    })
  } catch (error) {
    console.error("Check spin status error:", error)
    return NextResponse.json({ hasSpunToday: false })
  }
}
