"use client"

interface Props {
  preview: string
  progress: number
}

export default function MediaUploadOverlay({
  preview,
  progress,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-2xl w-80 text-center">

        <img
          src={preview}
          className="w-full h-48 object-cover rounded-xl mb-4"
        />

        <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-3 text-sm">{progress}% Uploading...</p>
      </div>
    </div>
  )
}