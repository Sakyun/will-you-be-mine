import { useCallback, useEffect, useRef, useState } from "react";

// ============================================
// EDIT THESE VALUES ↓↓↓
const NAME = "BoomBooYoom";
const MAX_ESCAPES = 5;
// ============================================

const HEART_EMOJIS = ["❤️", "💕", "💗", "💖", "💘", "💝", "💓", "💞"];

interface FloatingHeart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

interface BurstHeart {
  id: number;
  tx: number;
  ty: number;
  size: number;
  emoji: string;
  rotation: number;
}

const ValentinePage = () => {
  const [escapeCount, setEscapeCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [burstHearts, setBurstHearts] = useState<BurstHeart[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [trailHearts, setTrailHearts] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);

  const canClick = escapeCount >= MAX_ESCAPES;

  // Check screen size
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Generate floating background hearts
  const [floatingHearts] = useState<FloatingHeart[]>(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 16 + Math.random() * 24,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
    }))
  );

  const yeeetButton = useCallback(() => {
    if (canClick) return;

    const btnW = 200;
    const btnH = 70;
    const padding = 20;
    const maxX = window.innerWidth - btnW - padding;
    const maxY = window.innerHeight - btnH - padding;
    const newX = padding + Math.random() * maxX;
    const newY = padding + Math.random() * maxY;

    // Add trail hearts
    if (buttonPos) {
      const trail = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        x: buttonPos.x + btnW / 2 + (Math.random() - 0.5) * 40,
        y: buttonPos.y + btnH / 2 + (Math.random() - 0.5) * 40,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      }));
      setTrailHearts((prev) => [...prev, ...trail]);
      setTimeout(() => {
        setTrailHearts((prev) => prev.filter((h) => !trail.find((t) => t.id === h.id)));
      }, 800);
    }

    setButtonPos({ x: newX, y: newY });
    setEscapeCount((c) => c + 1);
  }, [canClick, buttonPos]);

  const handleClick = () => {
    if (!canClick) return;
    setAccepted(true);

    // Create burst hearts
    const hearts: BurstHeart[] = Array.from({ length: 60 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.5;
      const distance = 150 + Math.random() * 400;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        size: 16 + Math.random() * 32,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
        rotation: Math.random() * 360,
      };
    });
    setBurstHearts(hearts);

    setTimeout(() => setShowMessage(true), 600);
    setTimeout(() => setBurstHearts([]), 3000);
  };

  // Mobile block
  if (!isDesktop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-valentine-gradient p-8">
        <p className="text-center font-body text-2xl font-semibold text-foreground">
          Please open this on a desktop to see the surprise ❤️
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-valentine-gradient"
    >
      {/* Floating background hearts */}
      {floatingHearts.map((heart) => (
        <span
          key={heart.id}
          className="pointer-events-none fixed animate-float-heart select-none"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            zIndex: 0,
          }}
        >
          {heart.emoji}
        </span>
      ))}

      {/* Trail hearts from button movement */}
      {trailHearts.map((h) => (
        <span
          key={h.id}
          className="pointer-events-none fixed select-none transition-all duration-700"
          style={{
            left: h.x,
            top: h.y,
            fontSize: "18px",
            opacity: 0,
            transform: `translateY(-30px) scale(0)`,
            zIndex: 5,
          }}
        >
          {h.emoji}
        </span>
      ))}

      {/* Heart burst explosion */}
      {burstHearts.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {burstHearts.map((heart) => (
            <span
              key={heart.id}
              className="absolute animate-heart-burst select-none"
              style={{
                fontSize: `${heart.size}px`,
                "--tx": `${heart.tx}px`,
                "--ty": `${heart.ty}px`,
                transform: `rotate(${heart.rotation}deg)`,
              } as React.CSSProperties}
            >
              {heart.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {!accepted ? (
          <h1 className="font-display text-gradient-romantic text-7xl font-bold leading-tight drop-shadow-sm md:text-8xl">
            Will you be my Valentine?
          </h1>
        ) : (
          <div className={showMessage ? "animate-bounce-in" : "opacity-0"}>
            <h1 className="font-display text-gradient-romantic text-7xl font-bold leading-tight md:text-8xl">
              I love you, {NAME} ❤️
            </h1>
            <p className="mt-6 font-body text-2xl text-muted-foreground animate-pulse-love">
              You made my heart so happy 💕
            </p>
          </div>
        )}

        {/* The escaping button - starts below question */}
        {!accepted && !buttonPos && (
          <button
            ref={buttonRef}
            onMouseEnter={yeeetButton}
            onClick={handleClick}
            className="z-20 mt-12 rounded-full bg-primary px-10 py-5 font-body text-xl font-bold text-primary-foreground shadow-lg transition-all duration-100 ease-out cursor-default"
          >
            Yes 💘
          </button>
        )}
      </div>

      {/* The escaping button - after first escape, fixed position */}
      {!accepted && buttonPos && (
        <button
          ref={buttonRef}
          onMouseEnter={yeeetButton}
          onClick={handleClick}
          className={`
            z-20 rounded-full bg-primary px-10 py-5 font-body text-xl font-bold
            text-primary-foreground shadow-lg
            ${canClick
              ? "animate-pulse-love cursor-pointer hover:scale-110 hover:shadow-2xl"
              : "cursor-default"
            }
          `}
          style={{
            position: "fixed",
            left: buttonPos.x,
            top: buttonPos.y,
            transition: "left 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          Yes 💘
        </button>
      )}
    </div>
  );
};

export default ValentinePage;
