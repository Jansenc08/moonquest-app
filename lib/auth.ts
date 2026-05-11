"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.session) {
    redirect("/dashboard")
  }

  return { error: "Login failed. Please try again." }
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.session && !error) {
    // Could be duplicate email with confirmation disabled
    // Check if user was already confirmed
    if (data.user.identities?.length === 0) {
      return { error: "An account with this email already exists." }
    }
  }

  if (data.session) {
    // Email confirmation is disabled — user is logged in directly
    redirect("/dashboard")
  }

  // Email confirmation is enabled — show message
  return { success: "Check your email for a confirmation link." }
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
