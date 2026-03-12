"use client"

interface Props {
  url: string
  type: "image" | "video"
  onClose: () => void
}

export default function FullscreenViewer({
  url,
  type,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">

      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-2xl"
      >
        ✕
      </button>

      {type === "image" ? (
        <img
          src={url}
          className="max-h-[90%] max-w-[95%] object-contain"
        />
      ) : (
        <video
          src={url}
          controls
          autoPlay
          className="max-h-[90%] max-w-[95%]"
        />
      )}
    </div>
  )
}