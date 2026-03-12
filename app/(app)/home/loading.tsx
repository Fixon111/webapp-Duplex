"use client";

export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-t-primary border-r-primary/30 border-b-primary/30 border-l-primary/30 rounded-full animate-spin"></div>
        <p className="text-foreground text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
