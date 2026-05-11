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

  // Get wallet quest ID
  const { data: walletQuest } = await supabase
    .from('quests')
    .select('id, points_reward')
    .eq('type', 'wallet_connect')
    .single()

  if (!walletQuest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

// Check if wallet already connected on profile
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('wallet_address')
  .eq('id', user.id)
  .single()

if (existingProfile?.wallet_address) {
  return NextResponse.json({ error: 'Already connected' }, { status: 400 })
}

  // Save wallet address to profile
  await supabase
    .from('profiles')
    .update({ wallet_address })
    .eq('id', user.id)

  // Insert quest completion
  await supabase
    .from('quest_completions')
    .insert({
      user_id: user.id,
      quest_id: walletQuest.id,
    })

  // Award points
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

  return NextResponse.json({
    success: true,
    points_earned: walletQuest.points_reward,
    new_balance: newBalance,
  })
}
