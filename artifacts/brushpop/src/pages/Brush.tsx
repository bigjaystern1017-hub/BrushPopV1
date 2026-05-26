import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";

const TOTAL_TIME = 120;
const ROWS = 8;
const COLS = 5;
const TOTAL_TILES = ROWS * COLS;

const THEME_WALLPAPERS: Record<string, string> = {
  "blast-off": "/wallpapers/blast-off.png",
  "outer-space": "/wallpapers/outer-space.png",
  "jungle": "/wallpapers/jungle.png",
  "enchanted-jungle": "/wallpapers/enchanted-jungle.png",
  "ocean": "/wallpapers/ocean-explorers.png",
  "pirates": "/wallpapers/pirates-cove.png",
  "fairy-tale": "/wallpapers/fairy-tale.png",
  "playground": "/wallpapers/playground.png",
  "skate-park": "/wallpapers/skate-park.png",
  "robot-lab": "/wallpapers/robot-lab.png",
  "sports": "/wallpapers/sports-fun.png",
  "magical-city": "/wallpapers/magical-city.png",
};

function tileEasing(t: number): number {
  if (t < 0.25) return t * 0.6;
  if (t > 0.9) return 0.85 + (t - 0.9) * 1.5;
  return 0.15 + (t - 0.25) * 1.077;
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
  const [poppedTiles, setPoppedTiles] = useState<Set<number>>(new Set());
  const [wallpaperLoaded, setWallpaperLoaded] = useState(false);

  // Initialize pop order ONCE on mount — not tied to profile dependency
  const popOrderRef = useRef<number[]>(shuffleArray(TOTAL_TILES));
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const poppedCountRef = useRef<number>(0);
  const navigatedRef = useRef(false);

  const wallpaperUrl = THEME_WALLPAPERS[profile?.theme || "space"] || THEME_WALLPAPERS.space;

  // Preload wallpaper image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setWallpaperLoaded(true);
    img.onerror = () => setWallpaperLoaded(true);
    img.src = wallpaperUrl;
  }, [wallpaperUrl]);

  // Redirect if no profile (only after loaded)
  useEffect(() => {
    if (loaded && !profile) {
      setLocation("/");
    }
  }, [loaded, profile, setLocation]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startBrushing = useCallback(() => {
    // Re-shuffle right when brushing starts so it's fresh and random
    popOrderRef.current = shuffleArray(TOTAL_TILES);
    poppedCountRef.current = 0;
    navigatedRef.current = false;
    setPoppedTiles(new Set());
    setTimeLeft(TOTAL_TIME);
    setIsBrushing(true);
    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_TIME - elapsed);

      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setPoppedTiles(new Set(Array.from({ length: TOTAL_TILES }, (_, i) => i)));
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          setTimeout(() => {
            setLocation(`/celebrate/${params.id}`);
          }, 1500);
        }
        return;
      }

      const linearProgress = elapsed / TOTAL_TIME;
      const easedProgress = tileEasing(linearProgress);
      const targetPopped = Math.min(TOTAL_TILES, Math.floor(easedProgress * TOTAL_TILES));

      if (targetPopped > poppedCountRef.current) {
        const newPopped = new Set<number>();
        for (let i = 0; i < targetPopped; i++) {
          newPopped.add(popOrderRef.current[i]);
        }
        poppedCountRef.current = targetPopped;
        setPoppedTiles(newPopped);
      }
    }, 100);
  }, [params.id, setLocation]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleCancel = () => {
    if (confirm("Stop brushing? You'll lose your progress!")) {
      stopTimer();
      setLocation("/");
    }
  };

  if (!loaded || !wallpaperLoaded) return (
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
      {/* Background Image — the hidden photo */}
      <div className="absolute inset-0 z-0">
        <img src={profile.imageBase64} alt="Hidden" className="w-full h-full object-cover" />
      </div>

      {/* Wall Grid — covers entire screen, no padding, no gaps */}
      <div className="absolute inset-0 z-10">
        <div
          className="w-full h-full grid"
          style={{
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 0,
          }}
        >
          {Array.from({ length: TOTAL_TILES }).map((_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const bgPosX = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
            const bgPosY = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;

            return (
              <AnimatePresence key={i}>
                {!poppedTiles.has(i) && (
                  <motion.div
                    exit={{
                      scale: [1, 1.15, 0],
                      opacity: [1, 1, 0],
                      rotate: (Math.random() - 0.5) * 40,
                    }}
                    transition={{
                      duration: 0.4,
                      times: [0, 0.3, 1],
                      ease: "easeOut",
                    }}
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${wallpaperUrl})`,
                      backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                      backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                      borderRadius: "6px",
                      boxShadow: "inset 0 0 8px rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        <div className="p-4 flex justify-between items-start pointer-events-auto">
          <button
            onClick={handleCancel}
            className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white"
            data-testid="button-cancel"
          >
            <X className="w-6 h-6" />
          </button>

          {isBrushing && (
            <div className="flex flex-col items-center">
              <div className="bg-black/40 backdrop-blur-md rounded-full py-2 px-4 flex gap-1 mb-2">
                {Array.from({ length: totalIcons }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      opacity: i < iconsRemaining ? 1 : 0.2,
                      scale: i < iconsRemaining ? 1 : 0.8,
                    }}
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
        </div>

        <div className="p-6 pb-safe pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {!isBrushing ? (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-md">
                Ready to pop some plaque, {profile.name}?
              </h2>
              <button
                onClick={startBrushing}
                data-testid="button-start-brushing"
                className="w-full bg-primary text-white text-2xl font-black py-5 rounded-full shadow-[0_8px_0_hsl(355,85%,45%)] hover:translate-y-[2px] hover:shadow-[0_6px_0_hsl(355,85%,45%)] active:translate-y-[8px] active:shadow-none transition-all"
              >
                START BRUSHING!
              </button>
              <p className="text-white/70 font-bold mt-4">2 Minutes</p>
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">
                Keep brushing — the surprise is coming!
              </h2>
              <p className="text-white/80 font-medium">Brush every tooth, {profile.name}! 🦷</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
