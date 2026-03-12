"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // ✅ Pages where bottom nav should appear
  const showBottomNav =
    pathname === "/home" ||
    pathname === "/favorites" ||
    pathname === "/messages" ||
    pathname === "/profile"

  const NavLink = ({
    href,
    icon,
    label,
  }: {
    href: string
    icon: React.ReactNode
    label: string
  }) => {
    const [pressed, setPressed] = useState(false)
    const isActive = pathname === href

    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        <div
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: isActive ? "#d4a74a" : "#e8e4dc",
            fontSize: "12px",
            transform: pressed ? "scale(0.9)" : "scale(1)",
            transition: "transform 0.1s",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          {icon}
          {label}
        </div>
      </Link>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#0c1a2b",
        color: "#e8e4dc",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* MAIN CONTENT */}
        <main style={{ flex: 1 }}>{children}</main>

        {/* ✅ Bottom Nav ONLY on selected pages */}
        {showBottomNav && (
          <nav
            style={{
              height: "60px",
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              borderTop: "1px solid #333",
              backgroundColor: "#0c1a2b",
              position: "sticky",
              bottom: 0,
              width: "100%",
            }}
          >
            <NavLink
              href="/home"
              label="Home"
              icon={<svg width="24" height="24" fill="currentColor"><path d="M3 12l9-9 9 9v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z"/></svg>}
            />

            <NavLink
              href="/favorites"
              label="Favorites"
              icon={<svg width="24" height="24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
            />

            <NavLink
              href="/messages"
              label="Messages"
              icon={<svg width="24" height="24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>}
            />

            <NavLink
              href="/profile"
              label="Profile"
              icon={<svg width="24" height="24" fill="currentColor"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>}
            />
          </nav>
        )}
      </div>
    </div>
  )
}