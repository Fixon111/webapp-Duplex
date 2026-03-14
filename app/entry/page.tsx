"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  AuthProvider,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<"google" | "facebook" | "apple" | "">("");

  const loginWithProvider = async (provider: AuthProvider, providerName: "google" | "facebook" | "apple") => {
    setError("");
    setLoadingProvider(providerName);

    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      console.error(`${providerName} sign in error:`, err); // eslint-disable-line no-console
      if (err.code === "auth/operation-not-supported-in-this-environment" || err.code === "auth/operation-not-allowed") {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error("Redirect sign in failed:", redirectErr);
          setError(redirectErr.message || "Social login failed. Please try again.");
        }
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Popup closed before we could sign you in. Please try again.");
      } else {
        setError(err.message || "Social login failed. Please try again.");
      }
    } finally {
      setLoadingProvider("");
    }
  };

  const signInWithGoogle = () => loginWithProvider(new GoogleAuthProvider(), "google");
  const signInWithFacebook = () => loginWithProvider(new FacebookAuthProvider(), "facebook");
  const signInWithApple = () => {
    const appleProvider = new OAuthProvider("apple.com");
    appleProvider.addScope("email");
    appleProvider.addScope("name");
    return loginWithProvider(appleProvider, "apple");
  };

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
      {/* Heading - Elegant Italic Serif */}
      <h1
        style={{
          fontSize: "42px",
          lineHeight: 1.15,
          color: "#e8e4dc",
          textAlign: "center",
          marginBottom: "64px",
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: "italic",
          fontWeight: 400,
        }}
      >
        Find Your
        <br />
        Dream
        <br />
        Home
      </h1>

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

      {/* Golden Login Button wrapped in Link */}
      <Link href="/login">
        <button
          style={{
            width: "240px",
            backgroundColor: "#d4a74a",
            color: "#1a1a1a",
            fontWeight: 600,
            fontSize: "16px",
            padding: "16px 0",
            borderRadius: "9999px",
            marginBottom: "20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Log in
        </button>
      </Link>

      {/* Social Login Buttons */}
      <div style={{ width: "240px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={loadingProvider !== ""}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loadingProvider === "google" ? "#d6d6cf" : "#f5f5f0",
            color: "#1a1a1a",
            fontWeight: 500,
            fontSize: "14px",
            padding: "16px 24px",
            borderRadius: "9999px",
            border: "none",
            cursor: loadingProvider === "" ? "pointer" : "not-allowed",
            opacity: loadingProvider === "" ? 1 : 0.7,
          }}
        >
          <svg style={{ width: "20px", height: "20px", marginRight: "16px" }} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Facebook */}
        <button
          onClick={signInWithFacebook}
          disabled={loadingProvider !== ""}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loadingProvider === "facebook" ? "#d6d6cf" : "#f5f5f0",
            color: "#1a1a1a",
            fontWeight: 500,
            fontSize: "14px",
            padding: "16px 24px",
            borderRadius: "9999px",
            border: "none",
            cursor: loadingProvider === "" ? "pointer" : "not-allowed",
            opacity: loadingProvider === "" ? 1 : 0.7,
          }}
        >
          <svg style={{ width: "20px", height: "20px", marginRight: "16px" }} viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
        </button>

        {/* Apple */}
        <button
          onClick={signInWithApple}
          disabled={loadingProvider !== ""}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: loadingProvider === "apple" ? "#d6d6cf" : "#f5f5f0",
            color: "#1a1a1a",
            fontWeight: 500,
            fontSize: "14px",
            padding: "16px 24px",
            borderRadius: "9999px",
            border: "none",
            cursor: loadingProvider === "" ? "pointer" : "not-allowed",
            opacity: loadingProvider === "" ? 1 : 0.7,
          }}
        >
          <svg style={{ width: "20px", height: "20px", marginRight: "16px" }} viewBox="0 0 24 24" fill="#000000">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Continue with Apple
        </button>
      </div>
    </div>
  );
}
