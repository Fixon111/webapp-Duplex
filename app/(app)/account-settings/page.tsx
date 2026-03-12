"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Mail, Lock, Bell, Globe, Moon, AlertTriangle, Home, Heart, MessageSquare, User } from "lucide-react"

export default function AccountSettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState("English")

  const handleLanguageChange = () => {
    setLanguage(language === "English" ? "Español" : "English")
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Account Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-1">
        {/* Section Title */}
        <h2 className="text-xl font-semibold text-foreground mb-6">Account Settings</h2>

        {/* Edit Email */}
        <Link href="/edit-email" className="block">
          <button className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl mb-2 active:opacity-80 transition-opacity">
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Edit Email</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
          </button>
        </Link>

        {/* Change Password */}
        <Link href="/change-password" className="block">
          <button className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl mb-2 active:opacity-80 transition-opacity">
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Change Password</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
          </button>
        </Link>

        {/* Notifications */}
        <button className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl mb-2 active:opacity-80 transition-opacity">
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Notifications</span>
          </div>
          <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
        </button>

        {/* Language */}
        <button
          onClick={handleLanguageChange}
          className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl mb-2 active:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Language</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{language}</span>
            <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
          </div>
        </button>

        {/* Dark Mode */}
        <div className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl mb-2">
          <div className="flex items-center gap-4">
            <Moon className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">Dark Mode</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              darkMode ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-foreground rounded-full transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Deactivate Account */}
        <button className="w-full flex items-center justify-between px-4 py-4 bg-card rounded-2xl active:opacity-80 transition-opacity">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-orange-500 font-medium">Deactivate Account</span>
          </div>
          <ChevronLeft className="w-5 h-5 text-orange-500 rotate-180" />
        </button>
      </div>

      {/* Bottom Navigation */}
      
    </div>
  )
}
