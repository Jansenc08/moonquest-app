import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { wallet_address } = await request.json()

  if (!wallet_address) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }

  // Get wallet quest
  const { data: walletQuest } = await supabase
    .from('quests')
    .select('id, points_reward')
    .eq('type', 'wallet_connect')
    .single()

  if (!walletQuest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // 1. Check if quest_completions row already exists (source of truth)
  const { data: existingCompletion } = await supabase
    .from('quest_completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('quest_id', walletQuest.id)
    .maybeSingle()

  if (existingCompletion) {
    return NextResponse.json({ error: 'Already connected' }, { status: 400 })
  }

  // 2. Save wallet address to profile (idempotent)
  await supabase
    .from('profiles')
    .update({ wallet_address })
    .eq('id', user.id)

  // 3. Insert quest completion with points_earned
  const { error: insertError } = await supabase
    .from('quest_completions')
    .insert({
      user_id: user.id,
      quest_id: walletQuest.id,
      points_earned: walletQuest.points_reward,
    })

  if (insertError) {
    console.error('Failed to insert quest completion:', insertError)
    return NextResponse.json({ error: 'Failed to complete quest' }, { status: 500 })
  }

  // 4. Get current points and increment
  const { data: profile } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', user.id)
    .single()

  const newBalance = (profile?.points_balance || 0) + walletQuest.points_reward

  await supabase
    .from('profiles')
    .update({ points_balance: newBalance })
    .eq('id', user.id)

  // 5. Return success
  return NextResponse.json({
    success: true,
    points_earned: walletQuest.points_reward,
    new_balance: newBalance,
  })
}
