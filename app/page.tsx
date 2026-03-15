"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

interface Dot {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

const styles = `
  .entry-container {
    min-height: 100vh;
    width: 100vw;
    padding: 0;
    margin: 0;
    background-color: #0c1a2b;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e8e4dc;
    overflow: hidden;
    position: relative;
  }

  .dots-animation {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .falling-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #d4a74a;
    border-radius: 50%;
    box-shadow: 0 0 15px rgba(212, 167, 74, 0.8);
  }

  @media (max-width: 768px) {
    .entry-container {
      min-height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    .dots-animation {
      height: 100vh;
    }

    .falling-dot {
      width: 6px;
      height: 6px;
      box-shadow: 0 0 8px rgba(212, 167, 74, 0.7);
    }
  }

  @keyframes fall-and-form {
    0% {
      left: var(--start-x);
      top: -20px;
      opacity: 1;
    }
    30% {
      left: var(--start-x);
      top: 50vh;
      opacity: 1;
    }
    100% {
      left: var(--end-x);
      top: var(--end-y);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    .falling-dot {
      width: 8px;
      height: 8px;
    }
  }
`;

// Letter patterns for dot formation (5x7 grid per letter)
const letterPatterns: { [key: string]: number[][] } = {
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  X: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
};

const generateDotPositions = () => {
  const text = "DUPLEX";
  const dots: Dot[] = [];
  let dotIndex = 0;

  const width = typeof window !== "undefined" ? window.innerWidth : 800;
  const height = typeof window !== "undefined" ? window.innerHeight : 600;

  const scale = Math.min(1, Math.max(0.5, Math.min(width / 800, height / 700)));
  const spacing = 16 * scale; // scaled space between dots
  const charSpacing = 32 * scale; // scaled space between chars

  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate total width needed
  let totalWidth = 0;
  for (const char of text) {
    if (char === " ") {
      totalWidth += charSpacing;
    } else if (letterPatterns[char]) {
      totalWidth += letterPatterns[char][0].length * spacing + charSpacing;
    }
  }

  let currentX = centerX - totalWidth / 2;
  
  // Generate dots for each character
  for (const char of text) {
    if (char === " ") {
      currentX += charSpacing;
      continue;
    }
    
    const pattern = letterPatterns[char] || letterPatterns["D"];
    
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        if (pattern[row][col]) {
          if (dotIndex < 150) {
            const letterHeight = letterPatterns[char].length * spacing;
            dots.push({
              id: dotIndex,
              startX: Math.random() * 100,
              startY: -20,
              endX: currentX + col * spacing,
              endY: centerY - letterHeight / 2 + row * spacing,
              delay: Math.random() * 1.2,
            });
            dotIndex++;
          }
        }
      }
    }
    currentX += pattern[0].length * spacing + charSpacing;
  }
  
  return dots;
};

export default function EntryPage() {
  const router = useRouter();
  const [dots, setDots] = useState<Dot[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const newDots = generateDotPositions();
    setDots(newDots);

    // Check auth after animation completes (10 seconds)
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace("/home");
        } else {
          router.replace("/entry");
        }
      });
      return () => unsubscribe();
    }, 10500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <style>{styles}</style>
      <div className="entry-container">
        {isAnimating && (
          <div className="dots-animation">
            {dots.map((dot) => (
              <div
                key={dot.id}
                className="falling-dot"
                style={{
                  "--start-x": `${dot.startX}%`,
                  "--end-x": `${dot.endX}px`,
                  "--end-y": `${dot.endY}px`,
                  animation: `fall-and-form 10s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                  animationDelay: `${dot.delay}s`,
                } as React.CSSProperties & { "--start-x": string; "--end-x": string; "--end-y": string }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
