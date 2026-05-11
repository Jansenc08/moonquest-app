import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { quest_id } = await request.json()

  if (!quest_id) {
    return NextResponse.json({ error: 'Quest ID required' }, { status: 400 })
  }

  // Get quest details
  const { data: quest } = await supabase
    .from('quests')
    .select('id, points_reward, title')
    .eq('id', quest_id)
    .single()

  if (!quest) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  // Check if already claimed
  const { data: existing } = await supabase
    .from('quest_completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('quest_id', quest_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
  }

  // Insert quest completion
  const { error: insertError } = await supabase
    .from('quest_completions')
    .insert({
      user_id: user.id,
      quest_id: quest_id,
      points_earned: quest.points_reward,
    })

  if (insertError) {
    console.error('Failed to insert quest completion:', insertError)
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }

  // Get current points balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('points_balance')
    .eq('id', user.id)
    .single()

  const newBalance = (profile?.points_balance || 0) + quest.points_reward

  // Update points balance
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ points_balance: newBalance })
    .eq('id', user.id)

  if (updateError) {
    console.error('Failed to update points:', updateError)
    return NextResponse.json({ error: 'Failed to update points' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    points_earned: quest.points_reward,
    new_balance: newBalance,
  })
}
