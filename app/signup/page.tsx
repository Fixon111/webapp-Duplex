"use client";

import Link from "next/link";
import { useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Signup() {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Add extra info to Firestore 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        username,
        phone,
        email,
        createdTimestamp: serverTimestamp(),
        active: true,
        banned: false,
        premium: false,
        verified: false,
        profilePictureUrl: "",
      });

      alert("Signup successful!");
      // Optional: redirect user to login or dashboard
    } catch (error: any) {
      console.error("Signup error:", error);
      alert(error.message); // Show Firebase error to user
    }
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
        Create Your
        <br />
        Dream Home Account
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px", width: "280px" }}
      >
        <input
          type="text"
          placeholder="Full Name"
          value={username}
          onChange={(e) => setName(e.target.value)}
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
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          style={{
            padding: "14px 0",
            backgroundColor: "#d4a74a",
            color: "#1a1a1a",
            fontWeight: 600,
            fontSize: "16px",
            borderRadius: "9999px",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c79940")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#d4a74a")}
        >
          Sign up
        </button>
      </form>

      <p style={{ marginTop: "24px", color: "#e8e4dc", fontSize: "14px" }}>
        Already have an account?{" "}
        <Link href="/" style={{ color: "#d4a74a", textDecoration: "underline" }}>
          Log in
        </Link>
      </p>
    </div>
  );
}
