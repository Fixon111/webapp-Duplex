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
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "@/firebase/firebaseConfig"
import { ChevronLeft, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface Conversation {
  id: string
  contactName: string
  avatar: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

export default function MessagesPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth()

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setConversations([])
        setLoading(false)
        setUserId(null)
        return
      }

      setUserId(user.uid)

      const chatroomsQuery = query(
        collection(db, "chatrooms"),
        where("userIds", "array-contains", user.uid),
        orderBy("lastMessageTimestamp", "desc")
      )

      const unsubscribeSnapshot = onSnapshot(
        chatroomsQuery,
        async (snapshot) => {
          const results: Conversation[] = []

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data()

            // 🔥 Get other user ID
            const otherUserId = data.userIds.find(
              (id: string) => id !== user.uid
            )

            if (!otherUserId) continue

            // 🔥 Fetch other user's profile
            const userRef = doc(db, "users", otherUserId)
            const userSnap = await getDoc(userRef)

            let contactName = "User"
            let avatar = "/placeholder.jpg"

            if (userSnap.exists()) {
              const userData = userSnap.data()
              contactName = userData.username || "User"
              avatar =
                userData.profilePictureUrl ||
                "/placeholder.jpg"
            }

            // 🔥 Format timestamp
            let formattedTime = ""
            if (data.lastMessageTimestamp?.toDate) {
              const date =
                data.lastMessageTimestamp.toDate()
              formattedTime = date.toLocaleString()
            }

            results.push({
              id: docSnap.id,
              contactName,
              avatar,
              lastMessage: data.lastMessage || "",
              timestamp: formattedTime,
              unread:
                data.unreadMessageCounts?.[user.uid] > 0,
            })
          }

          setConversations(results)
          setLoading(false)
        }
      )

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading messages...
        </p>
      </div>
    )
  }

  const hasConversations = conversations.length > 0

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-5 py-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            Messages
          </h1>
        </div>
      </div>

      {hasConversations ? (
        <div className="px-5 py-4 space-y-3">
          {conversations.map((conversation) => (
            <Link
  key={conversation.id}
  href={`/chatroom/${conversation.id}${userId ? `?userId=${userId}` : ""}`}
>
              <div className="flex items-center gap-3 pb-4 border-b border-border active:opacity-70 transition-opacity cursor-pointer">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={conversation.avatar}
                      alt={conversation.contactName}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {conversation.contactName}
                    </h3>
                    <span className="text-xs text-muted-foreground ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>

                {conversation.unread && (
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mb-6">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No messages yet
          </h2>
          <p className="text-muted-foreground mb-6">
            When you contact someone, your chats will appear here.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
          >
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  )
}