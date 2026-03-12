"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { ChevronLeft, Mail, AlertCircle, Check, Home, Heart, MessageSquare, User } from "lucide-react"
import Link from "next/link"

export default function EditEmailPage() {
  const router = useRouter()
  const [newEmail, setNewEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const emailsMatch = newEmail === confirmEmail && newEmail !== ""
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)

  const handleSaveEmail = async () => {
    setError("")
    setSuccess(false)

    if (!newEmail || !confirmEmail) {
      setError("Please fill in all fields")
      return
    }

    if (!emailsMatch) {
      setError("Email addresses do not match")
      return
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        throw new Error("User not authenticated")
      }

      await updateEmail(user, newEmail)

      setSuccess(true)
      setNewEmail("")
      setConfirmEmail("")

      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use by another account")
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address")
      } else if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log back in, then try again")
      } else {
        setError(err.message || "Failed to update email")
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
          <h1 className="text-lg font-semibold text-foreground">Edit Email</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Edit Email Address</h2>
          <p className="text-muted-foreground">Update your email to keep your account current and secure.</p>
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
            <p className="text-green-200 text-sm">Email updated successfully! A confirmation email has been sent. Redirecting...</p>
          </div>
        )}

        {/* New Email */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">New Email Address</label>
          <div className="flex items-center bg-card border border-border rounded-xl px-4 py-3">
            <Mail className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              type="email"
              placeholder="Enter new email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Confirm Email */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Confirm New Email Address</label>
          <div className="flex items-center bg-card border border-border rounded-xl px-4 py-3">
            <Mail className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              type="email"
              placeholder="Re-enter new email address"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            A confirmation email will be sent to verify your new address.
          </p>
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
            onClick={handleSaveEmail}
            disabled={loading || !emailsMatch || !isValidEmail}
            className={`flex-1 font-semibold py-3 rounded-xl transition-colors ${
              loading || !emailsMatch || !isValidEmail
                ? "bg-primary/50 text-primary-foreground/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-orange-500"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}