import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";

const TOTAL_TIME = 120;
const BUBBLE_COUNT = 160;
const RESUME_KEY = "brushpop_resume";

function generateBubbles(count: number): { id: number; x: number; y: number; size: number; hue: number; delay: number }[] {
  const bubbles: { id: number; x: number; y: number; size: number; hue: number; delay: number }[] = [];
  const gridCols = 10;
  const gridRows = 16;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const id = bubbles.length;
      const xOffset = row % 2 === 0 ? 0 : (100 / gridCols) / 2;
      bubbles.push({
        id,
        x: (col / gridCols) * 100 + xOffset + (Math.random() - 0.5) * 3,
        y: (row / gridRows) * 100 + (Math.random() - 0.5) * 2,
        size: Math.max(13, 14 + (Math.random() - 0.5) * 4),
        hue: 195 + Math.random() * 20,
        delay: Math.random() * 0.15,
      });
    }
  }
  return bubbles.slice(0, count);
}

function tileEasing(t: number): number {
  const base = t;
  const wave1 = Math.sin(t * Math.PI * 4) * 0.04;
  const wave2 = Math.sin(t * Math.PI * 10) * 0.06;
  const wave3 = Math.sin(t * Math.PI * 16 + 0.5) * 0.025;
  const result = base + wave1 + wave2 + wave3;
  return Math.max(0, Math.min(1, result));
}

function shuffleArray(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export default function Brush() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const profile = getProfile(params.id || "");

  const [isBrushing, setIsBrushing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [poppedBubbles, setPoppedBubbles] = useState<Set<number>>(new Set());
  const [muted, setMuted] = useState(() => localStorage.getItem("brushpop_muted") === "true");
  const [noPhotoMsg, setNoPhotoMsg] = useState(false);

  const bubbles = useMemo(() => generateBubbles(BUBBLE_COUNT), []);

  const popOrderRef = useRef<number[]>(shuffleArray(BUBBLE_COUNT));
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const poppedCountRef = useRef<number>(0);
  const navigatedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Navigate home if profile not found
  useEffect(() => {
    if (loaded && !profile) setLocation("/");
  }, [loaded, profile, setLocation]);

  // Session resume: check localStorage for an interrupted session after profile confirms loaded
  useEffect(() => {
    if (!loaded || !profile) return;
    try {
      const raw = localStorage.getItem(RESUME_KEY);
      if (!raw) return;
      const saved: { startedAt: number; kidId: string } = JSON.parse(raw);
      if (saved.kidId !== profile.id) { localStorage.removeItem(RESUME_KEY); return; }
      const elapsed = (Date.now() - saved.startedAt) / 1000;
      if (elapsed >= TOTAL_TIME) {
        localStorage.removeItem(RESUME_KEY);
        navigatedRef.current = true;
        setLocation(`/celebrate/${profile.id}`);
        return;
      }
      // Pre-populate bubble state to match elapsed time
      const initialPopped = Math.min(BUBBLE_COUNT, Math.floor(tileEasing(elapsed / TOTAL_TIME) * BUBBLE_COUNT));
      const initialSet = new Set<number>();
      for (let i = 0; i < initialPopped; i++) initialSet.add(popOrderRef.current[i]);
      poppedCountRef.current = initialPopped;
      setTimeLeft(Math.ceil(TOTAL_TIME - elapsed));
      setPoppedBubbles(initialSet);
      setIsBrushing(true);

      const startedAt = saved.startedAt;
      intervalRef.current = window.setInterval(() => {
        const el = (Date.now() - startedAt) / 1000;
        const rem = Math.max(0, TOTAL_TIME - el);
        setTimeLeft(Math.ceil(rem));
        if (rem <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          localStorage.removeItem(RESUME_KEY);
          setPoppedBubbles(new Set(Array.from({ length: BUBBLE_COUNT }, (_, i) => i)));
          if (!navigatedRef.current) {
            navigatedRef.current = true;
            if (audioRef.current) audioRef.current.pause();
            setTimeout(() => setLocation(`/celebrate/${profile.id}`), 1500);
          }
          return;
        }
        const tp = Math.min(BUBBLE_COUNT, Math.floor(tileEasing(el / TOTAL_TIME) * BUBBLE_COUNT));
        if (tp > poppedCountRef.current) {
          const np = new Set<number>();
          for (let i = 0; i < tp; i++) np.add(popOrderRef.current[i]);
          poppedCountRef.current = tp;
          setPoppedBubbles(np);
        }
      }, 100);
    } catch {
      localStorage.removeItem(RESUME_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, profile?.id]);

  // iOS requires a user gesture to unlock the Web Audio context.
  useEffect(() => {
    const unlock = () => {
      const silence = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwTHAAAAAAAAAAAAAAAAAAAA//tQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      silence.play().then(() => silence.pause()).catch(() => {});
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("touchstart", unlock, { once: true });
    return () => document.removeEventListener("touchstart", unlock);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
  }, []);

  const startBrushing = useCallback(() => {
    // Guard: no photo uploaded yet
    if (!profile?.imageBase64) {
      setNoPhotoMsg(true);
      setTimeout(() => setNoPhotoMsg(false), 3500);
      return;
    }

    popOrderRef.current = shuffleArray(BUBBLE_COUNT);
    poppedCountRef.current = 0;
    navigatedRef.current = false;
    setPoppedBubbles(new Set());
    setTimeLeft(TOTAL_TIME);
    setIsBrushing(true);

    // Persist session so it can resume if the user navigates away
    const now = Date.now();
    localStorage.setItem(RESUME_KEY, JSON.stringify({ startedAt: now, kidId: profile.id }));

    // Audio: create AND play in the same synchronous tap handler for iOS
    if (!muted) {
      try {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
        const audio = new Audio("/brush-song-v2.m4a");
        audio.volume = 0.5;
        audio.loop = false;
        audioRef.current = audio;
        audio.play().catch((err) => console.warn("Audio play failed:", err));
      } catch (e) {
        console.warn("Audio creation failed:", e);
      }
    }

    startTimeRef.current = now;

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        localStorage.removeItem(RESUME_KEY);
        setPoppedBubbles(new Set(Array.from({ length: BUBBLE_COUNT }, (_, i) => i)));
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          if (audioRef.current) audioRef.current.pause();
          setTimeout(() => setLocation(`/celebrate/${params.id}`), 1500);
        }
        return;
      }

      const linearProgress = elapsed / TOTAL_TIME;
      const easedProgress = tileEasing(linearProgress);
      const targetPopped = Math.min(BUBBLE_COUNT, Math.floor(easedProgress * BUBBLE_COUNT));

      if (targetPopped > poppedCountRef.current) {
        const newPopped = new Set<number>();
        for (let i = 0; i < targetPopped; i++) {
          newPopped.add(popOrderRef.current[i]);
        }
        poppedCountRef.current = targetPopped;
        setPoppedBubbles(newPopped);
      }
    }, 100);
  }, [params.id, setLocation, muted, profile?.id, profile?.imageBase64]);

  useEffect(() => {
    return () => {
      stopTimer();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [stopTimer]);

  const handleCancel = () => {
    if (confirm("Stop brushing? You'll lose your progress!")) {
      localStorage.removeItem(RESUME_KEY);
      stopTimer();
      setLocation("/");
    }
  };

  if (!loaded) return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-black flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!profile) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  const totalIcons = 8;
  const iconsRemaining = Math.ceil((timeLeft / TOTAL_TIME) * totalIcons);

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-black relative overflow-hidden flex flex-col">
      {/* Hidden photo underneath */}
      <div className="absolute inset-0 z-0">
        <img src={profile.imageBase64} alt="Hidden" className="w-full h-full object-contain" />
      </div>

      {/* Bubble overlay */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <AnimatePresence>
          {bubbles.map((bubble) =>
            !poppedBubbles.has(bubble.id) ? (
              <motion.div
                key={bubble.id}
                exit={{
                  scale: [1, 1.3, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 0.4,
                  times: [0, 0.3, 1],
                  ease: "easeOut",
                }}
                style={{
                  position: "absolute",
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}vw`,
                  height: `${bubble.size}vw`,
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, 
                    hsla(${bubble.hue}, 80%, 92%, 1) 0%, 
                    hsla(${bubble.hue}, 75%, 78%, 1) 40%, 
                    hsla(${bubble.hue}, 70%, 65%, 1) 70%, 
                    hsla(${bubble.hue}, 65%, 55%, 1) 100%)`,
                  boxShadow: `
                    inset -2px -3px 6px hsla(${bubble.hue}, 60%, 40%, 0.3),
                    inset 3px 3px 8px hsla(${bubble.hue}, 90%, 95%, 0.6),
                    0 2px 8px hsla(${bubble.hue}, 60%, 40%, 0.15)
                  `,
                }}
              >
                {/* Shine highlight */}
                <div
                  style={{
                    position: "absolute",
                    top: "18%",
                    left: "22%",
                    width: "30%",
                    height: "25%",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)",
                    transform: "rotate(-30deg)",
                  }}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* No-photo toast */}
      <AnimatePresence>
        {noPhotoMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-24 left-4 right-4 z-30 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3"
          >
            <span className="text-2xl">📷</span>
            <p className="font-bold text-foreground text-sm leading-snug">
              Add a surprise photo first — your child will love it!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        <div className="p-4 flex justify-between items-start pointer-events-auto">
          <button
            onClick={handleCancel}
            className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white active:scale-95 transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {isBrushing && (
            <div className="flex flex-col items-center">
              <div className="bg-black/40 backdrop-blur-md rounded-full py-2 px-4 flex gap-1 mb-2">
                {Array.from({ length: totalIcons }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ opacity: i < iconsRemaining ? 1 : 0.2, scale: i < iconsRemaining ? 1 : 0.8 }}
                    className="text-xl"
                  >
                    🦷
                  </motion.span>
                ))}
              </div>
              <div className="bg-primary text-white font-black text-2xl py-1 px-4 rounded-2xl shadow-lg border-2 border-white/20">
                {timeStr}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const newMuted = !muted;
              setMuted(newMuted);
              localStorage.setItem("brushpop_muted", String(newMuted));
              if (audioRef.current) {
                if (newMuted) audioRef.current.pause();
                else if (isBrushing) audioRef.current.play().catch(() => {});
              }
            }}
            className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white active:scale-95 transition-all"
          >
            <span className="text-lg">{muted ? "🔇" : "🔊"}</span>
          </button>
        </div>

        <div className="p-6 pb-safe pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {!isBrushing ? (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-md">
                Ready to pop some plaque, {profile.name}?
              </h2>
              <button
                onClick={startBrushing}
                className="w-full bg-primary text-white text-2xl font-black py-5 rounded-full shadow-[0_8px_0_hsl(355,85%,45%)] active:translate-y-[8px] active:shadow-none transition-all"
              >
                START BRUSHING!
              </button>
              <p className="text-white/70 font-bold mt-4">2 Minutes</p>
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">Keep brushing — the surprise is coming!</h2>
              <p className="text-white/80 font-medium">Brush every tooth, {profile.name}! 🦷</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
