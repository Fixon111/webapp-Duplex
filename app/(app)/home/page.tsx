"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  query,
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore"
import { db } from "@/firebase/firebaseConfig"
import { getAuth } from "firebase/auth"
import { Search, MapPin } from "lucide-react"
import Link from "next/link"

interface Property {
  propertyId: string
  propertyName: string
  propertyType: string
  price: number
  images: string[]
  bedrooms: number
  bathrooms: number
  region: string
  address?: string
  isOpenHouse?: boolean
}

const PAGE_SIZE = 7

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [activeTab, setActiveTab] =
    useState<"real-estate" | "rentals">("real-estate")

  // Get current user ID
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null)
    })
    return unsubscribe
  }, [])

  const fetchProperties = async () => {
    if (loading || !hasMore) return
    setLoading(true)

    try {
      let q = query(
        collection(db, "properties"),
        orderBy("price"),
        limit(PAGE_SIZE)
      )

      if (lastDoc) {
        q = query(
          collection(db, "properties"),
          orderBy("price"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        )
      }

      const snapshot = await getDocs(q)

      const data: Property[] = snapshot.docs.map((doc) => ({
        propertyId: doc.id,
        propertyName: doc.data().propertyName ?? "Unnamed Property",
        propertyType: doc.data().propertyType ?? "",
        price: doc.data().price ?? 0,
        images: doc.data().images ?? [],
        bedrooms: doc.data().bedrooms ?? 0,
        bathrooms: doc.data().bathrooms ?? 0,
        region: doc.data().region ?? "Unknown",
        address: doc.data().address ?? "",
        isOpenHouse: doc.data().isOpenHouse ?? false,
      }))

      if (data.length < PAGE_SIZE) setHasMore(false)

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
      setProperties((prev) => [...prev, ...data])
    } catch (err) {
      console.error("Error fetching properties:", err)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No properties found</p>
      </div>
    )
  }

  const featuredProperty = properties[0]
  const gridProperties = properties.slice(1)

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      {/* Search */}
      <div className="relative mb-5 max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          placeholder="Search Properties"
          className="w-full pl-12 pr-4 py-3.5 bg-card rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5 justify-center">
        {["real-estate", "rentals"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "border border-border"
            }`}
          >
            {tab === "real-estate" ? "Real Estate" : "Rentals"}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featuredProperty && (
        <Link
          href={`/property/${featuredProperty.propertyId}${userId ? `?userId=${userId}` : ""}`}
          className="block mb-6 rounded-2xl overflow-hidden bg-card max-w-2xl mx-auto"
        >
          <div className="relative aspect-[4/3]">
            <img
              src={featuredProperty.images[0] || "/placeholder.svg"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 flex justify-between">
            <div>
              <p className="text-xl font-semibold">
                {featuredProperty.propertyName}
              </p>
              <p className="text-sm text-muted-foreground">
                {featuredProperty.region}
              </p>
              <p className="mt-1">
                ${featuredProperty.price.toLocaleString()}
              </p>
            </div>
            <MapPin />
          </div>
        </Link>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gridProperties.map((property) => (
          <Link
            key={property.propertyId}
            href={`/property/${property.propertyId}${userId ? `?userId=${userId}` : ""}`}
            className="rounded-2xl overflow-hidden bg-card"
          >
            <div className="aspect-square">
              <img
                src={property.images[0] || "/placeholder.svg"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <p className="font-semibold">{property.propertyName}</p>
              <p className="text-sm text-muted-foreground">
                {property.region}
              </p>
              <p className="text-xs mt-1">
                ${property.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={fetchProperties}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  )
}
