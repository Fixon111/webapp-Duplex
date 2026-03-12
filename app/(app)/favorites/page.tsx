"use client"

import { useEffect, useState } from "react"
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "@/firebase/firebaseConfig"
import { Heart, ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface Property {
  propertyId: string
  propertyName: string
  price: number
  images: string[]
}

export default function SavedPropertiesPage() {
  const router = useRouter()
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSavedProperties([])
        setLoading(false)
        setUserId(null)
        return
      }

      setUserId(user.uid)

      const savedQuery = query(
        collection(db, "saved_properties"),
        where("userId", "==", user.uid)
      )

      // 🔥 REAL-TIME LISTENER (same approach as MyListings)
      const unsubscribeSnapshot = onSnapshot(
        savedQuery,
        async (snapshot) => {
          const results: Property[] = []

          for (const docSnap of snapshot.docs) {
            const { propertyId } = docSnap.data()

            const propertyRef = doc(db, "properties", propertyId)
            const propertySnap = await getDoc(propertyRef)

            if (propertySnap.exists()) {
              const data = propertySnap.data()

              results.push({
                propertyId: data.propertyId,
                propertyName: data.propertyName,
                price: Number(data.price),
                images: data.images || [],
              })
            }
          }

          setSavedProperties(results)
          setLoading(false)
        }
      )

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  /* ----------------------------- */
  /* REMOVE SAVED PROPERTY */
  /* ----------------------------- */
  const handleUnsave = async (propertyId: string) => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, "saved_properties"),
      where("userId", "==", user.uid),
      where("propertyId", "==", propertyId)
    )

    const snapshot = await onSnapshot(q, async (snap) => {
      snap.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "saved_properties", docSnap.id))
      })
    })
  }

  /* ----------------------------- */
  /* LOADING */
  /* ----------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading saved properties...
        </p>
      </div>
    )
  }

  /* ----------------------------- */
  /* USER HAS SAVED */
  /* ----------------------------- */
  if (savedProperties.length > 0) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Saved
              </h1>
            </div>
            <Heart className="w-6 h-6 text-primary fill-current" />
          </div>
        </div>

        <div className="px-5 py-6 space-y-4">
          {savedProperties.map((property) => (
            <div
              key={property.propertyId}
              className="flex gap-4 pb-4 border-b border-border"
            >
              {/* IMAGE */}
              <Link
                href={`/property/${property.propertyId}${userId ? `?userId=${userId}` : ""}`}
                className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden"
              >
                <Image
                  src={
                    property.images?.[0] ||
                    "/placeholder.jpg"
                  }
                  alt={property.propertyName}
                  fill
                  className="object-cover"
                />
              </Link>

              {/* INFO */}
              <div className="flex-1 flex flex-col justify-between">
                <Link
                  href={`/property/${property.propertyId}${userId ? `?userId=${userId}` : ""}`}
                >
                  <p className="text-primary font-bold text-lg">
                    ${property.price.toLocaleString()}
                  </p>
                  <p className="text-foreground text-sm">
                    {property.propertyName}
                  </p>
                </Link>
              </div>

              {/* HEART REMOVE */}
              <button
                onClick={() =>
                  handleUnsave(property.propertyId)
                }
                className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-2"
              >
                <Heart className="w-6 h-6 text-primary fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  /* ----------------------------- */
  /* NO SAVED */
  /* ----------------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5">
      <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No Saved Properties
      </h2>
      <p className="text-muted-foreground mb-6">
        Save properties to view them here
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-medium"
      >
        Browse Properties
      </Link>
    </div>
  )
}