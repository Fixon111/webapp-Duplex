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
  deleteDoc,
  doc,
} from "firebase/firestore"
import { db } from "@/firebase/firebaseConfig"
import Link from "next/link"
import Image from "next/image"
import { Check, FileText, Eye, Mail, Trash2, Plus } from "lucide-react"

interface Property {
  propertyId: string
  propertyName: string
  price: number
  images: string[]
  ownerId: string
  viewCount: number
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setListings([])
        setLoading(false)
        setUserId(null)
        return
      }

      setUserId(user.uid)

      const q = query(
        collection(db, "properties"),
        where("ownerId", "==", user.uid)
      )

      // 🔥 REAL-TIME LISTENER
      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const results: Property[] = []

        snapshot.forEach((docSnap) => {
          const data = docSnap.data()

          results.push({
            propertyId: data.propertyId,
            propertyName: data.propertyName,
            price: Number(data.price),
            images: data.images || [],
            ownerId: data.ownerId,
            viewCount: Number(data.viewCount || 0),
          })
        })

        setListings(results)
        setLoading(false)
      })

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  /* ----------------------------- */
  /* DELETE LISTING */
  /* ----------------------------- */
  const handleDelete = async (propertyId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this listing?"
    )
    if (!confirmDelete) return

    try {
      await deleteDoc(doc(db, "properties", propertyId))
    } catch (error) {
      console.error("Error deleting listing:", error)
    }
  }

  /* ----------------------------- */
  /* LOADING STATE */
  /* ----------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading your listings...
        </p>
      </div>
    )
  }

  /* -------------------------------- */
  /* USER HAS LISTINGS */
  /* -------------------------------- */
  if (listings.length > 0) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6 pb-8">
        <h1 className="text-3xl font-bold mb-6">My Listings</h1>

        <div className="space-y-5 mb-8">
          {listings.map((property) => (
            <div
              key={property.propertyId}
              className="bg-card rounded-2xl overflow-hidden shadow-sm"
            >
              <Link
                href={`/property/${property.propertyId}${userId ? `?userId=${userId}` : ""}`}
                className="block active:scale-95 transition-transform"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={
                      property.images?.[0] ||
                      "/placeholder.jpg"
                    }
                    alt={property.propertyName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4 space-y-1">
                  <h2 className="font-semibold text-lg">
                    {property.propertyName}
                  </h2>

                  <p className="text-primary font-bold">
                    ${property.price.toLocaleString()}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {property.viewCount} views
                  </p>
                </div>
              </Link>

              {/* ACTIONS */}
              <div className="flex justify-end p-3 border-t border-border">
                <button
                  onClick={() =>
                    handleDelete(property.propertyId)
                  }
                  className="flex items-center gap-2 text-sm text-destructive hover:opacity-70"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ADD ANOTHER PROPERTY SECTION */}
        <div className="bg-card border-2 border-dashed border-muted-foreground rounded-2xl p-6 text-center">
          <Link href="/add-property">
            <button className="flex flex-col items-center justify-center w-full">
              <Plus className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Add Another Property</h3>
              <p className="text-sm text-muted-foreground">List a new property to your portfolio</p>
            </button>
          </Link>
        </div>
      </div>
    )
  }

  /* -------------------------------- */
  /* NO LISTINGS — DEFAULT PAGE */
  /* -------------------------------- */

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="relative h-48 w-full">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop"
          alt="Become a Landlord"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="px-5 pt-8 space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-3">
            Become a Landlord
          </h1>
          <p className="text-muted-foreground">
            List your property for sale or rent and connect with potential buyers or tenants
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-primary" />
            <span>Reach thousands of potential buyers</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-primary" />
            <span>Manage your listings effortlessly</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-primary" />
            <span>Free and easy to get started</span>
          </div>
        </div>

        <Link href="/add-property">
          <button className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-2xl">
            List Your Property
          </button>
        </Link>

        <div>
          <h2 className="text-2xl font-bold mb-6">
            Why Become a Landlord?
          </h2>

          <div className="grid grid-cols-1 gap-4">

            <div className="bg-card rounded-2xl p-6 text-center">
              <FileText className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                Easy Listing
              </h3>
              <p className="text-sm text-muted-foreground">
                Create and manage property listings in minutes
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 text-center">
              <Eye className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                Massive Exposure
              </h3>
              <p className="text-sm text-muted-foreground">
                Get your property in front of thousands of users
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 text-center">
              <Mail className="w-6 h-6 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">
                Direct Inquiries
              </h3>
              <p className="text-sm text-muted-foreground">
                Receive direct messages from interested parties
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}