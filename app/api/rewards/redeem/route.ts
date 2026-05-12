import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { reward_id } = body

    if (!reward_id) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from("rewards")
      .select("*")
      .eq("id", reward_id)
      .eq("is_active", true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      )
    }

    // Check stock (null = unlimited)
    if (reward.stock !== null && reward.stock === 0) {
      return NextResponse.json(
        { error: "Out of stock" },
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

    // Check balance
    if (profile.points_balance < reward.points_cost) {
      return NextResponse.json(
        { error: "Insufficient points balance" },
        { status: 400 }
      )
    }

    const newBalance = profile.points_balance - reward.points_cost

    // Deduct points from profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points_balance: newBalance })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to deduct points" },
        { status: 500 }
      )
    }

    // Insert redemption record
    const { error: redemptionError } = await supabase
      .from("redemptions")
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
      })

    if (redemptionError) {
      // Rollback points deduction
      await supabase
        .from("profiles")
        .update({ points_balance: profile.points_balance })
        .eq("id", user.id)

      return NextResponse.json(
        { error: "Failed to record redemption" },
        { status: 500 }
      )
    }

    // Decrement stock if not unlimited (null = unlimited)
    if (reward.stock !== null) {
      const { error: stockError } = await supabase
        .rpc('decrement_stock', { reward_id_input: reward_id })

      if (stockError) {
        console.error('Failed to decrement stock:', stockError)
      }
    }

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      reward_title: reward.title,
      points_spent: reward.points_cost,
      message: `Successfully redeemed ${reward.title}`,
    })
  } catch (error) {
    console.error("Redemption error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
