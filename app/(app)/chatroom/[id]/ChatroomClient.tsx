"use client"

export const dynamicParams = true

export const dynamic = "force-dynamic"
import { useEffect, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, Send, Paperclip } from "lucide-react"

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore"

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"

import { onAuthStateChanged } from "firebase/auth"
import { db, auth, storage } from "@/firebase/firebaseConfig"

import MediaUploadOverlay from "@/components/MediaUploadOverlay"
import FullscreenViewer from "@/components/FullscreenViewer"
import { generateVideoThumbnail } from "@/lib/generateVideoThumbnail"

interface Message {
  id: string
  senderId: string
  message?: string | null
  type: "text" | "image" | "video"
  mediaUrl?: string | null
  thumbnailUrl?: string | null
  timestamp: any
  status?: "sending" | "sent" | "read"
}

export default function ChatroomPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdFromQuery = searchParams.get("userId")

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewer, setViewer] = useState<{
    url: string
    type: "image" | "video"
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* AUTH */
  useEffect(() => {
    return onAuthStateChanged(auth, setCurrentUser)
  }, [])

  /* LOAD OTHER USER */
  useEffect(() => {
    if (!id || !currentUser) return

    const load = async () => {
      const chatRef = doc(db, "chatrooms", id)
      const snap = await getDoc(chatRef)
      if (!snap.exists()) return

      const data = snap.data()
      const otherId = data.userIds.find(
        (uid: string) => uid !== currentUser.uid
      )

      if (otherId) {
        const userSnap = await getDoc(doc(db, "users", otherId))
        if (userSnap.exists()) {
          setOtherUser({ id: otherId, ...userSnap.data() })
        }
      }

      await updateDoc(chatRef, {
        [`unreadMessageCounts.${currentUser.uid}`]: 0,
      })
    }

    load()
  }, [id, currentUser])

  /* REALTIME MESSAGES */
  useEffect(() => {
    if (!id) return

    const messagesRef = collection(db, "chatrooms", id, "chats")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    return onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Message[]

      setMessages(msgs)
    })
  }, [id])

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* SEND TEXT */
  const sendTextMessage = async () => {
    if (!newMessage.trim() || !currentUser || !otherUser) return

    const chatRef = doc(db, "chatrooms", id)
    const messagesRef = collection(chatRef, "chats")

    await addDoc(messagesRef, {
      senderId: currentUser.uid,
      message: newMessage.trim(),
      type: "text",
      status: "sent",
      timestamp: serverTimestamp(),
    })

    await updateDoc(chatRef, {
      lastMessage: newMessage.trim(),
      lastMessageTimestamp: serverTimestamp(),
      [`unreadMessageCounts.${otherUser.id}`]: increment(1),
    })

    setNewMessage("")
  }

  /* MEDIA UPLOAD */
  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    if (!isImage && !isVideo) return

    let thumbnail: string

    if (isImage) {
      thumbnail = URL.createObjectURL(file)
    } else {
      thumbnail = await generateVideoThumbnail(file)
    }

    setUploadPreview(thumbnail)
    setUploadProgress(0)

    const chatRef = doc(db, "chatrooms", id)
    const messagesRef = collection(chatRef, "chats")

    const messageDoc = await addDoc(messagesRef, {
      senderId: currentUser.uid,
      type: isImage ? "image" : "video",
      mediaUrl: null,
      thumbnailUrl: thumbnail,
      status: "sending",
      timestamp: serverTimestamp(),
    })

    const storageRef = ref(storage, `chatMedia/${id}/${messageDoc.id}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(Math.round(progress))
      },
      null,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)

        await updateDoc(
          doc(db, "chatrooms", id, "chats", messageDoc.id),
          {
            mediaUrl: url,
            status: "sent",
          }
        )

        setUploadPreview(null)
        setUploadProgress(0)
      }
    )
  }

  if (!otherUser) return null

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">

      {/* HEADER */}
      <div className="sticky top-0 bg-background border-b px-5 py-4 flex items-center gap-3 z-10">
        <button onClick={() => router.back()}>
          <ChevronLeft />
        </button>

        <Image
          src={otherUser.profilePictureUrl || "/placeholder.jpg"}
          alt="avatar"
          width={44}
          height={44}
          className="rounded-full object-cover"
        />

        <div>
          <p className="font-semibold">{otherUser.username}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser?.uid

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-3xl overflow-hidden ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {/* TEXT */}
                {msg.type === "text" && (
                  <p className="px-4 py-3 text-sm">{msg.message}</p>
                )}

                {/* IMAGE */}
                {msg.type === "image" &&
                  (msg.thumbnailUrl || msg.mediaUrl) && (
                    <div
                      onClick={() =>
                        msg.mediaUrl &&
                        setViewer({ url: msg.mediaUrl, type: "image" })
                      }
                      className="cursor-pointer"
                    >
                      <img
                        src={msg.thumbnailUrl || msg.mediaUrl!}
                        className="object-cover max-w-xs rounded-2xl"
                      />
                    </div>
                  )}

                {/* VIDEO */}
                {msg.type === "video" && msg.thumbnailUrl && (
                  <div
                    onClick={() =>
                      msg.mediaUrl &&
                      setViewer({ url: msg.mediaUrl, type: "video" })
                    }
                    className="relative cursor-pointer"
                  >
                    <img
                      src={msg.thumbnailUrl}
                      className="object-cover max-w-xs rounded-2xl"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        ▶ Play
                      </div>
                    </div>
                  </div>
                )}

                {/* STATUS */}
                {isMe && msg.status && (
                  <p className="text-xs px-3 pb-1 text-right opacity-70">
                    {msg.status === "sent" && "✓"}
                    {msg.status === "read" && "✓✓"}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-5 py-4">
        <div className="flex gap-3 items-center">

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <Paperclip size={18} />
          </button>

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendTextMessage()
            }
            className="flex-1 border rounded-xl px-4 py-2"
            placeholder="Type a message..."
          />

          <button
            onClick={sendTextMessage}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-xl"
          >
            <Send size={18} />
          </button>

        </div>
      </div>

      {uploadPreview && (
        <MediaUploadOverlay
          preview={uploadPreview}
          progress={uploadProgress}
        />
      )}

      {viewer && (
        <FullscreenViewer
          url={viewer.url}
          type={viewer.type}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  )
}