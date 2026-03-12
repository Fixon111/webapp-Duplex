"use client"


export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { doc, getDoc, collection, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "@/firebase/firebaseConfig"
import { getAuth } from "firebase/auth"
import Image from "next/image"
import { ChevronLeft, Heart, Share2, MapPin, Bed, Bath, Square, Phone, Mail, MessageCircle, ChevronRight, X } from "lucide-react"

/* ---------------- TYPES ---------------- */

interface Property {
  propertyName: string
  description: string
  price: number
  region: string
  location: string
  images: string[]
  bedrooms: number
  bathrooms: number
  squareFeet: number
  amenities: string[] | string
  ownerId: string
}

interface Owner {
  username: string
  profilePictureUrl?: string
  phone?: string
  email?: string
  verified?: boolean
}

/* ---------------- PAGE ---------------- */

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdFromQuery = searchParams.get("userId")

  const [property, setProperty] = useState<Property | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

  /* -------- FETCH PROPERTY -------- */

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        const propRef = doc(db, "properties", id as string)
        const propSnap = await getDoc(propRef)

        if (!propSnap.exists()) return

        const propData = propSnap.data() as Property
        setProperty(propData)

        /* -------- FETCH OWNER -------- */
        const ownerRef = doc(db, "users", propData.ownerId)
        const ownerSnap = await getDoc(ownerRef)

        if (ownerSnap.exists()) {
          setOwner(ownerSnap.data() as Owner)
        }

        /* -------- CHECK IF PROPERTY IS SAVED -------- */
        const auth = getAuth()
        const user = auth.currentUser

        if (user) {
          const q = query(
            collection(db, "saved_properties"),
            where("userId", "==", user.uid),
            where("propertyId", "==", id as string)
          )
          const querySnapshot = await getDocs(q)
          setIsSaved(!querySnapshot.empty)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  /* -------- IMAGE NAVIGATION -------- */

  const nextImage = () => {
    if (!property) return
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    if (!property) return
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  /* -------- TOGGLE SAVE TO FIRESTORE -------- */

  const toggleSave = async () => {
    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (!user) {
        alert("Please log in to save properties")
        return
      }

      const propertyId = id as string
      const userId = user.uid

      if (isSaved) {
        // Remove from saved_properties collection
        const q = query(
          collection(db, "saved_properties"),
          where("userId", "==", userId),
          where("propertyId", "==", propertyId)
        )
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, "saved_properties", docSnap.id))
        })
        setIsSaved(false)
      } else {
        // Add to saved_properties collection
        const savedRef = doc(collection(db, "saved_properties"))
        await setDoc(savedRef, {
          userId: userId,
          propertyId: propertyId,
          savedAt: new Date(),
        })
        setIsSaved(true)
      }
    } catch (error) {
      console.error("Error toggling save:", error)
      alert("Failed to save property. Please try again.")
    }
  }

  /* -------- PARSE AMENITIES -------- */

  const getAmenities = (): string[] => {
    if (!property) return []
    if (Array.isArray(property.amenities)) return property.amenities
    if (typeof property.amenities === "string") {
      return property.amenities.split(",").map((a) => a.trim())
    }
    return []
  }

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 animate-pulse space-y-4">
        <div className="h-[45vh] bg-card rounded-2xl" />
        <div className="h-8 bg-card rounded-xl w-2/3" />
        <div className="h-5 bg-card rounded-lg w-1/2" />
        <div className="flex gap-4">
          <div className="flex-1 h-24 bg-card rounded-2xl" />
          <div className="flex-1 h-24 bg-card rounded-2xl" />
          <div className="flex-1 h-24 bg-card rounded-2xl" />
        </div>
        <div className="h-32 bg-card rounded-2xl" />
      </div>
    )
  }

  if (!property) return null

  const amenities = getAmenities()

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Full Screen Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="relative h-full flex flex-col">
            {/* Gallery Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
              <button
                onClick={() => setShowGallery(false)}
                className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-foreground text-sm font-medium bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {currentImageIndex + 1} / {property.images.length}
              </span>
            </div>

            {/* Gallery Main Image */}
            <div className="flex-1 flex items-center justify-center px-4">
              <button
                onClick={prevImage}
                className="absolute left-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>

              <div className="relative w-full h-[70vh]">
                <Image
                  src={property.images[currentImageIndex] || "/placeholder.svg"}
                  alt={`Property image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <button
                onClick={nextImage}
                className="absolute right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      idx === currentImageIndex ? "ring-2 ring-primary" : "opacity-60"
                    }`}
                  >
                    <Image src={img || "/placeholder.svg"} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image Section */}
      <div className="relative h-[45vh]">
        <Image
          src={property.images[currentImageIndex] || "/placeholder.svg"}
          alt={property.propertyName}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={toggleSave}
              className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${
                isSaved ? "bg-primary" : "bg-card/80"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isSaved ? "text-primary-foreground fill-primary-foreground" : "text-foreground"}`}
              />
            </button>
            <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Image Counter & Gallery Button */}
        <button
          onClick={() => setShowGallery(true)}
          className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2"
        >
          <span className="text-foreground text-sm font-medium">
            {currentImageIndex + 1}/{property.images.length}
          </span>
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>

        {/* Image Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentImageIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 space-y-6">
        {/* Price & Title */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">${property.price.toLocaleString()}</h1>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-muted-foreground">{property.region}</p>
          </div>
        </div>

        {/* Property Stats */}
        <div className="flex gap-4">
          <div className="flex-1 bg-card rounded-2xl p-4 text-center">
            <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-semibold text-foreground">{property.bedrooms}</p>
            <p className="text-xs text-muted-foreground">Bedrooms</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 text-center">
            <Bath className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-semibold text-foreground">{property.bathrooms}</p>
            <p className="text-xs text-muted-foreground">Bathrooms</p>
          </div>
          <div className="flex-1 bg-card rounded-2xl p-4 text-center">
            <Square className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-semibold text-foreground">{property.squareFeet?.toLocaleString() || "N/A"}</p>
            <p className="text-xs text-muted-foreground">Sq Ft</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">About this property</h2>
          <p className="text-muted-foreground leading-relaxed">{property.description}</p>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, idx) => (
                <span key={idx} className="px-4 py-2 bg-card rounded-full text-sm text-foreground">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Owner Section */}
        {owner && (
          <div className="bg-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Property Owner</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={owner.profilePictureUrl || "/avatar.png"}
                    alt={owner.username}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                {owner.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{owner.username}</h3>
                  {owner.verified && <span className="text-xs text-primary">Verified</span>}
                </div>
                <p className="text-sm text-muted-foreground">Property Owner</p>
              </div>
            </div>

            {/* Contact Options */}
            <div className="flex gap-3 mt-5">
              <a
                href={`tel:${owner.phone || ""}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted rounded-xl text-foreground"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Call</span>
              </a>
              <a
                href={`mailto:${owner.email || ""}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted rounded-xl text-foreground"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email</span>
              </a>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted rounded-xl text-foreground">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="flex gap-3">
          <button
            onClick={toggleSave}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isSaved ? "bg-primary" : "bg-card border border-border"
            }`}
          >
            <Heart
              className={`w-6 h-6 ${isSaved ? "text-primary-foreground fill-primary-foreground" : "text-foreground"}`}
            />
          </button>
          <a
            href={`tel:${owner?.phone || ""}`}
            className="flex-1 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-2 font-semibold text-lg"
          >
            <Phone className="w-5 h-5" />
            Contact Owner
          </a>
        </div>
      </div>
    </div>
  )
}