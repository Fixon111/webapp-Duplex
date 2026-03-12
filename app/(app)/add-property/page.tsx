"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Plus, X, Calendar, Home, Heart, MessageSquare, User } from "lucide-react"
import Link from "next/link"
import { getAuth } from "firebase/auth"
import { collection, doc, setDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db } from "@/firebase/firebaseConfig"
import { v4 as uuidv4 } from "uuid"


interface PropertyFormData {
  // Step 1 - Property Address
  propertyName: string
  region: string
  location: string
  digitalAddress: string

  // Step 2 - Property Details
  propertyType: string
  bedrooms: number
  bathrooms: number
  squareFeet: number
  price: number

  // Step 3 - Media
  images: string[]

  // Step 4 - Description
  description: string
  amenities: string
}

const initialFormData: PropertyFormData = {
  propertyName: "",
  region: "",
  location: "",
  digitalAddress: "",
  propertyType: "",
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: 0,
  price: 0,
  images: [],
  description: "",
  amenities: "",
}

export default function ListPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      const fileArray = Array.from(files)
      fileArray.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result
          if (result) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, result as string],
            }))
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      alert("You must be logged in")
      return
    }

    if (!formData.propertyName || formData.images.length === 0) {
      alert("Please complete required fields")
      return
    }

    const storage = getStorage()
    const imageUrls: string[] = []

    // 🔥 Convert Base64 to Blob and upload
    for (const image of formData.images) {
      const response = await fetch(image)
      const blob = await response.blob()

      const imageRef = ref(
        storage,
        `property_images/${uuidv4()}.jpg`
      )

      await uploadBytes(imageRef, blob)
      const downloadURL = await getDownloadURL(imageRef)
      imageUrls.push(downloadURL)
    }

    // 🔥 Create Firestore document
    const propertyRef = doc(collection(db, "properties"))
    const propertyId = propertyRef.id

    await setDoc(propertyRef, {
      amenities: formData.amenities || "",
      bathrooms: Number(formData.bathrooms),
      bedrooms: Number(formData.bedrooms),
      description: formData.description,
      digitalAddress: formData.digitalAddress || "",
      images: imageUrls,
      location: formData.location,
      ownerId: user.uid,
      price: Number(formData.price),
      propertyId: propertyId,
      propertyName: formData.propertyName,
      propertyType: formData.propertyType,
      region: formData.region,
      squareFeet: Number(formData.squareFeet),
      viewCount: 0,
      createdAt: new Date(),
    })

    router.push("/my-listings")

  } catch (error) {
    console.error("Error submitting property:", error)
    alert("Something went wrong while submitting")
  }
}


  const progressPercentage = (step / 4) * 100

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-full bg-card flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">List Your Property</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Step {step} of 4: </span>
          <span className="text-sm text-muted-foreground">
            {step === 1 && "Property Address"}
            {step === 2 && "Property Details"}
            {step === 3 && "Media"}
            {step === 4 && "Description"}
          </span>
        </div>
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 space-y-6">
        {/* ==================== STEP 1: ADDRESS ==================== */}
        {step === 1 && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Property Address</h2>
            </div>

            <div className="space-y-4">
              {/* Property Name */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g., Duplex, House, Apartment"
                  value={formData.propertyName}
                  onChange={(e) => handleInputChange("propertyName", e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Region */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Region / State</label>
                <input
                  type="text"
                  placeholder="e.g., Greater Accra"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Location / City</label>
                <input
                  type="text"
                  placeholder="e.g., North Kaneshie, Accra, Ghana"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Digital Address */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Digital Address (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., ET-2394-4578"
                  value={formData.digitalAddress}
                  onChange={(e) => handleInputChange("digitalAddress", e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </>
        )}

        {/* ==================== STEP 2: DETAILS ==================== */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Property Details</h2>
            </div>

            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Property Type</label>
                <div className="space-y-2">
                  {["House", "Apartment", "Condo", "Duplex", "Villa", "Studio"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleInputChange("propertyType", type)}
                      className={`w-full px-4 py-3 rounded-2xl border transition-colors text-left ${
                        formData.propertyType === type
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Bedrooms</label>
                  <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2 w-fit">
                    <button
                      onClick={() =>
                        handleInputChange("bedrooms", Math.max(0, formData.bedrooms - 1))
                      }
                      className="text-primary text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-foreground font-semibold">
                      {formData.bedrooms}
                    </span>
                    <button
                      onClick={() =>
                        handleInputChange("bedrooms", formData.bedrooms + 1)
                      }
                      className="text-primary text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Bathrooms</label>
                  <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2 w-fit">
                    <button
                      onClick={() =>
                        handleInputChange("bathrooms", Math.max(0, formData.bathrooms - 1))
                      }
                      className="text-primary text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-foreground font-semibold">
                      {formData.bathrooms}
                    </span>
                    <button
                      onClick={() =>
                        handleInputChange("bathrooms", formData.bathrooms + 1)
                      }
                      className="text-primary text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Square Feet */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Area in Square Feet</label>
                <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3">
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.squareFeet || ""}
                    onChange={(e) => handleInputChange("squareFeet", Number(e.target.value))}
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                  />
                  <span className="text-muted-foreground text-sm">ft²</span>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Price</label>
                <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3">
                  <span className="text-muted-foreground text-sm mr-2">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.price || ""}
                    onChange={(e) => handleInputChange("price", Number(e.target.value))}
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== STEP 3: MEDIA ==================== */}
        {step === 3 && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Property Media</h2>
              <p className="text-muted-foreground">Upload photos and, optionally, a video that showcase your property.</p>
            </div>

            <div className="space-y-6">
              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx}>
                    {formData.images[idx] ? (
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card">
                        <img
                          src={formData.images[idx]}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <Plus className="w-8 h-8 text-primary mb-1" />
                        <span className="text-sm text-foreground">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ==================== STEP 4: DESCRIPTION ==================== */}
        {step === 4 && (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Property Description</h2>
              <p className="text-muted-foreground">Provide a detailed description of your property to attract buyers or tenants.</p>
            </div>

            <div className="space-y-6">
              {/* Description Text Area */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Description</label>
                <textarea
                  placeholder="Write a detailed description..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  maxLength={2000}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none h-32"
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {formData.description.length} / 2000
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Amenities (comma-separated)</label>
                <textarea
                  placeholder="e.g., Wifi, swimming pool, Gym"
                  value={formData.amenities}
                  onChange={(e) => handleInputChange("amenities", e.target.value)}
                  className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary resize-none h-24"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate amenities with commas</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-card border border-border text-foreground font-semibold py-3 rounded-2xl"
            >
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 4) {
                handleSubmit()
              } else {
                setStep(step + 1)
              }
            }}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-2xl"
          >
            {step === 4 ? "Submit" : "Next"}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
       
      </div>
    </div>
  )
}