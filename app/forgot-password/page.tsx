"use client"

import Link from "next/link"
import { useState } from "react"
import { auth } from "@/firebase/firebaseConfig"
import { sendPasswordResetEmail } from "firebase/auth"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const validateEmail = (value: string) => {
    const trimmed = value.trim()
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(trimmed)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    setError("")
    setSuccess(false)

    if (!trimmedEmail) {
      setError("Email is required.")
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)

    try {
      // 🔐 Background check handled securely by Firebase
      await sendPasswordResetEmail(auth, trimmedEmail)

      setSuccess(true)
      setEmail("")

      setTimeout(() => {
        router.push("/login")
      }, 3000)

    } catch (error: any) {
      console.error("Password reset error:", error)

      // Do NOT expose whether email exists
      if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else {
        setError("If this email exists, a reset link has been sent.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0c1a2b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          backgroundColor: "#1a2a3e",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#e8e4dc",
        }}
      >
        <ChevronLeft size={24} />
      </button>

      {/* Heading */}
      <h1
        style={{
          fontSize: "32px",
          color: "#e8e4dc",
          textAlign: "center",
          marginBottom: "12px",
          fontWeight: 600,
        }}
      >
        Reset Password
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontSize: "14px",
          color: "#9ca3af",
          textAlign: "center",
          marginBottom: "48px",
          maxWidth: "300px",
        }}
      >
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {/* Success Message */}
      {success && (
        <div
          style={{
            width: "280px",
            padding: "16px",
            marginBottom: "24px",
            backgroundColor: "#1a3a2a",
            color: "#4ade80",
            borderRadius: "12px",
            fontSize: "14px",
            textAlign: "center",
            border: "1px solid #22c55e",
          }}
        >
          <p style={{ margin: 0, marginBottom: "8px", fontWeight: 600 }}>
            Email sent!
          </p>
          <p style={{ margin: 0 }}>
            Check your email for the password reset link. Redirecting to login in 3 seconds...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            width: "280px",
            padding: "12px",
            marginBottom: "24px",
            backgroundColor: "#3d2323",
            color: "#ff6b6b",
            borderRadius: "8px",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Reset Form */}
      {!success && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "280px",
          }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #555",
              backgroundColor: "#1a1a1a",
              color: "#e8e4dc",
              fontSize: "14px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 0",
              backgroundColor: loading ? "#a6852a" : "#d4a74a",
              color: "#1a1a1a",
              fontWeight: 600,
              fontSize: "16px",
              borderRadius: "9999px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#c79940")
            }
            onMouseLeave={(e) =>
              !loading && (e.currentTarget.style.backgroundColor = "#d4a74a")
            }
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      {/* Back to Login Link */}
      <p style={{ marginTop: "24px", color: "#e8e4dc", fontSize: "14px" }}>
        Remember your password?{" "}
        <Link
          href="/login"
          style={{ color: "#d4a74a", textDecoration: "underline" }}
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
