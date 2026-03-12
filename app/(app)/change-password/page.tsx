"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth"
import { ChevronLeft, Eye, EyeOff, Lock, AlertCircle, Check, Home, Heart, MessageSquare, User } from "lucide-react"
import Link from "next/link"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validatePassword = (password: string) => {
    return {
      hasLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@#$%!]/.test(password),
    }
  }

  const passwordRequirements = validatePassword(newPassword)
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req)

  const handleSaveChanges = async () => {
    setError("")
    setSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (!allRequirementsMet) {
      setError("Password does not meet all requirements")
      return
    }

    setLoading(true)

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user || !user.email) {
        throw new Error("User not authenticated")
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      await updatePassword(user, newPassword)

      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err: any) {
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect")
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log back in, then try again")
      } else {
        setError(err.message || "Failed to update password")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-card flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Change Password</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Change Password</h2>
          </div>
          <p className="text-muted-foreground">Update your account password to keep your account secure.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-200 text-sm">Password updated successfully! Redirecting...</p>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary pr-10"
            />
            <button
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline mt-2 inline-block"
          >
            Forgot password?
          </Link>
        </div>

        {/* New Password */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary pr-10"
            />
            <button
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Password must contain:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${passwordRequirements.hasLength ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${passwordRequirements.hasLength ? "text-foreground" : "text-muted-foreground"}`}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${passwordRequirements.hasUppercase ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${passwordRequirements.hasUppercase ? "text-foreground" : "text-muted-foreground"}`}>
                1 uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${passwordRequirements.hasNumber ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${passwordRequirements.hasNumber ? "text-foreground" : "text-muted-foreground"}`}>
                1 number
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${passwordRequirements.hasSpecial ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm ${passwordRequirements.hasSpecial ? "text-foreground" : "text-muted-foreground"}`}>
                1 special character (@, #, $, %, !)
              </span>
            </div>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary pr-10"
            />
            <button
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-400 mb-2">Security Note</h3>
              <ul className="space-y-1 text-sm text-orange-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Do not reuse an old password
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Do not share your password with anyone
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 bg-card border border-border text-foreground font-semibold py-3 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={loading || !allRequirementsMet}
            className={`flex-1 font-semibold py-3 rounded-xl transition-colors ${
              loading || !allRequirementsMet
                ? "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-orange-500"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}