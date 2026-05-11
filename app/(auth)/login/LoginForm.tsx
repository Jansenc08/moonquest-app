"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }
  const score = Object.values(checks).filter(Boolean).length
  return { checks, score }
}

function getStrengthLabel(score: number) {
  if (score <= 1) return { label: "Weak", color: "#ef4444" }
  if (score === 2) return { label: "Fair", color: "#f97316" }
  if (score === 3) return { label: "Good", color: "#eab308" }
  return { label: "Strong", color: "#a3e635" }
}

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")

  const { checks: passwordChecks, score: passwordScore } = getPasswordStrength(password)
  const strengthInfo = getStrengthLabel(passwordScore)

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const trimmedEmail = email.trim()

    // Email validation
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Login validation
        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setIsLoading(false)
          return
        }

        const loginResult = await signInWithEmail(trimmedEmail, password)
        if (loginResult?.error) {
          const errMsg = loginResult.error.toLowerCase()
          if (
            errMsg.includes("invalid login") ||
            errMsg.includes("invalid credentials") ||
            errMsg.includes("wrong password")
          ) {
            setError("Incorrect email or password. Please try again.")
          } else if (errMsg.includes("email not confirmed")) {
            setError("Please confirm your email before logging in.")
          } else if (errMsg.includes("too many requests")) {
            setError("Too many attempts. Please wait a moment and try again.")
          } else {
            setError(loginResult.error)
          }
          setIsLoading(false)
        }
      } else {
        // Signup validation
        if (!passwordChecks.length) {
          setError("Password must be at least 8 characters")
          setIsLoading(false)
          return
        }
        if (!passwordChecks.uppercase) {
          setError("Password must contain at least one uppercase letter")
          setIsLoading(false)
          return
        }
        if (!passwordChecks.lowercase) {
          setError("Password must contain at least one lowercase letter")
          setIsLoading(false)
          return
        }
        if (!passwordChecks.number) {
          setError("Password must contain at least one number")
          setIsLoading(false)
          return
        }
        if (!passwordChecks.special) {
          setError("Password must contain at least one special character")
          setIsLoading(false)
          return
        }

        const signupResult = await signUpWithEmail(trimmedEmail, password)
        if (signupResult?.error) {
          const errMsg = signupResult.error.toLowerCase()
          if (
            errMsg.includes("already registered") ||
            errMsg.includes("already exists") ||
            errMsg.includes("email already")
          ) {
            setError("An account with this email already exists. Try logging in instead.")
          } else {
            setError(signupResult.error)
          }
          setIsLoading(false)
          return
        }

        if (signupResult?.success) {
          setSuccess(signupResult.success)
          setEmail("")
          setPassword("")
          setIsLoading(false)
        }
      }
    } catch (err: unknown) {
      // Next.js redirect throws with digest property — not a real error
      if (err && typeof err === "object" && "digest" in err) {
        return
      }
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  async function continueWithGoogle() {
    setIsLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      // Next.js redirect throws with digest property — not a real error
      if (err && typeof err === "object" && "digest" in err) {
        return
      }
      setError("Could not connect to Google. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-12">
          <Gamepad2 className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold text-white tracking-tight">
            Moonquest
          </span>
        </Link>

        <Card className="bg-[#111111] border-[#222222]">
          <CardContent className="p-8">
            {/* Toggle */}
            <div className="flex rounded-lg bg-[#080808] p-1 mb-8">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setError(null)
                  setSuccess(null)
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isLogin
                    ? "bg-white text-black"
                    : "text-[#666666] hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false)
                  setError(null)
                  setSuccess(null)
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  !isLogin
                    ? "bg-white text-black"
                    : "text-[#666666] hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error/Success Messages */}
            {(error || urlError) && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error || urlError}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-[#a3e635]/10 border border-[#a3e635]/20 text-[#a3e635] text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={submitCredentials} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-[#666666]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#080808] border border-[#222222] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#a3e635]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-[#666666]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666666]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={isLogin ? 6 : 8}
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#080808] border border-[#222222] text-white placeholder:text-[#666666] focus:outline-none focus:border-[#a3e635]/50 transition-colors"
                  />
                </div>
                {/* Password strength indicator (signup only) */}
                {!isLogin && password.length > 0 && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-0.5 flex-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-sm"
                          style={{
                            backgroundColor: i < passwordScore ? strengthInfo.color : "#222222",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: strengthInfo.color }}
                    >
                      {strengthInfo.label}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-white text-black hover:bg-white/90 font-medium"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#222222]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#111111] text-[#666666]">or</span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              type="button"
              variant="ghost"
              onClick={continueWithGoogle}
              disabled={isLoading}
              className="w-full h-11 border border-[#222222] text-white hover:text-white hover:bg-[#222222] font-medium"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Terms */}
            <p className="mt-8 text-center text-xs text-[#666666]">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-white hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <p className="mt-8 text-center text-sm">
          <Link href="/" className="text-[#666666] hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  )
}
