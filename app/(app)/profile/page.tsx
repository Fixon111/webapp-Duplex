"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth"
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import { db } from "@/firebase/firebaseConfig"
import {
  Home,
  Heart,
  MessageSquare,
  LogOut,
  Settings,
  HelpCircle,
  ChevronRight,
  Camera,
} from "lucide-react"

/* -------- TYPES -------- */

interface UserData {
  username: string
  email: string
  profilePictureUrl?: string
}

/* -------- PAGE -------- */

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogOutConfirm, setShowLogOutConfirm] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  /* -------- AUTH LISTENER -------- */

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  /* -------- PROFILE PHOTO UPLOAD -------- */

  const handleProfilePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    try {
      const storage = getStorage()
      const storageRef = ref(storage, `profilePic/${user.uid}.jpg`)

      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(Math.round(progress))
        },
        (error) => {
          console.error(error)
          setUploadProgress(null)
        },
        async () => {
          const downloadURL = await getDownloadURL(
            uploadTask.snapshot.ref
          )

          const userRef = doc(db, "users", user.uid)
          await updateDoc(userRef, {
            profilePictureUrl: downloadURL,
          })

          setUserData((prev) =>
            prev
              ? { ...prev, profilePictureUrl: downloadURL }
              : prev
          )

          setUploadProgress(null)
          setShowImageModal(false)
        }
      )
    } catch (error) {
      console.error(error)
      setUploadProgress(null)
    }
  }

  /* -------- LOG OUT -------- */

  const handleLogOut = async () => {
    const auth = getAuth()
    await signOut(auth)
    setShowLogOutConfirm(false)
  }

  /* -------- LOADING -------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No user found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* FULL SCREEN IMAGE MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative w-64 h-64 rounded-full overflow-hidden mb-6">
            <Image
              src={userData.profilePictureUrl || "/avatar.png"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          {uploadProgress !== null && (
            <div className="w-full max-w-xs mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-white mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl cursor-pointer">
            <Camera className="w-5 h-5" />
            {userData.profilePictureUrl
              ? "Change Photo"
              : "Add Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowImageModal(false)}
            className="mt-4 text-white text-sm"
          >
            Close
          </button>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {showLogOutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Log Out?
            </h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogOutConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogOut}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center pt-6 pb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Profile
        </h1>
      </div>

      {/* PROFILE SECTION */}
      <div className="px-5 pb-8 text-center">
        <div
          className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-muted cursor-pointer"
          onClick={() => setShowImageModal(true)}
        >
          <Image
            src={userData.profilePictureUrl || "/avatar.png"}
            alt={userData.username}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-foreground">
          {userData.username}
        </h2>

        <p className="text-muted-foreground mt-1">
          {userData.email}
        </p>
      </div>

      {/* MENU */}
      <div className="px-5 space-y-3">
        <Link
          href="/my-listings"
          className="flex items-center justify-between p-4 bg-card rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <Home className="w-6 h-6 text-primary" />
            <span>My Listings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <Link
          href="/favorites"
          className="flex items-center justify-between p-4 bg-card rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-primary" />
            <span>Saved Properties</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <Link
          href="/messages"
          className="flex items-center justify-between p-4 bg-card rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6 text-primary" />
            <span>Messages</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <Link
          href="/account-settings"
          className="flex items-center justify-between p-4 bg-card rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <Settings className="w-6 h-6 text-primary" />
            <span>Account Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <Link
          href="/support"
          className="flex items-center justify-between p-4 bg-card rounded-2xl"
        >
          <div className="flex items-center gap-4">
            <HelpCircle className="w-6 h-6 text-primary" />
            <span>Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="px-5 mt-8">
        <button
          onClick={() => setShowLogOutConfirm(true)}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}
