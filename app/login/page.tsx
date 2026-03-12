"use client"

import Link from "next/link"
import { useState } from "react"
import { auth } from "@/firebase/firebaseConfig"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log("Logged in user:", user)
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to log in. Please try again.")
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
      {/* Heading */}
      <h1
        style={{
          fontSize: "36px",
          color: "#e8e4dc",
          textAlign: "center",
          marginBottom: "48px",
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        Welcome Back
        <br />
        Log in to continue
      </h1>

      {/* Error Message */}
      {error && (
        <div
          style={{
            width: "280px",
            padding: "12px",
            marginBottom: "16px",
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

      {/* Login Form */}
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
          placeholder="Email"
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing in..." : "Enter"}
        </button>
      </form>

      {/* Forgot Password Link */}
      <p style={{ marginTop: "16px", color: "#d4a74a", fontSize: "13px" }}>
        <Link
          href="/forgot-password"
          style={{
            color: "#d4a74a",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Forgot Password?
        </Link>
      </p>

      {/* Signup Link */}
      <p style={{ marginTop: "24px", color: "#e8e4dc", fontSize: "14px" }}>
        New user?{" "}
        <Link href="/signup" style={{ color: "#d4a74a", textDecoration: "underline" }}>
          Sign up
        </Link>
      </p>
    </div>
  )
}