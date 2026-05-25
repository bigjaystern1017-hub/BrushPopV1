import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import type { WallTheme } from "@/lib/types";

const TOTAL_TIME = 120; // seconds
const ROWS = 7;
const COLS = 5;
const TOTAL_TILES = ROWS * COLS; // 35

// --- Dramatic pacing curve ---
// Slow start (first 25% of time = ~14% of tiles revealed)
// Steady middle (25–83% of time)
// Fast finale (last 17% of time = rapid bursting)
function expectedRevealed(elapsedSeconds: number): number {
  const t = Math.min(elapsedSeconds / TOTAL_TIME, 1);
  let progress: number;
  if (t < 0.25) {
    // Slow ease-in: first 30s reveals ~5 tiles
    progress = (t / 0.25) ** 2 * 0.14;
  } else if (t < 0.83) {
    // Steady linear middle
    progress = 0.14 + ((t - 0.25) / 0.58) * 0.67;
  } else {
    // Fast finale: ease-out burst for last ~20s
    const ft = (t - 0.83) / 0.17;
    progress = 0.81 + ft * (2 - ft) * 0.19;
  }
  return Math.floor(progress * TOTAL_TILES);
}

// --- Theme config ---
interface ThemeConfig {
  colors: string[];
  icons: string[];
  borderColors: string[];
}

const THEME_CONFIG: Record<WallTheme, ThemeConfig> = {
  space: {
    colors: ["#1a1a2e", "#16213e", "#0f3460", "#3a0ca3", "#2b1d5a", "#480ca8", "#240046"],
    icons: ["⭐", "🌙", "🪐", "🚀", "💫", "🌟", "☄️", "🛸"],
    borderColors: ["#090917", "#0a1225", "#071e3d", "#210568"],
  },
  jungle: {
    colors: ["#1b4332", "#2d6a4f", "#40916c", "#1a3a2a", "#355e3b", "#2f6547", "#145a32"],
    icons: ["🌿", "🍃", "🌴", "🍀", "🌱", "🌺", "🦜", "🐸"],
    borderColors: ["#0d2118", "#163527", "#204b36", "#0e2e1a"],
  },
  underwater: {
    colors: ["#03045e", "#0077b6", "#0096c7", "#023e8a", "#1a5276", "#0466c8", "#1d3557"],
    icons: ["🐠", "🐚", "🫧", "🐙", "🐟", "🦀", "🐬", "🦑"],
    borderColors: ["#010230", "#00457a", "#00567a", "#012050"],
  },
  playground: {
    colors: ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#e9c46a", "#8338ec", "#fb5607", "#3a86ff"],
    icons: ["🎈", "⭐", "🎪", "🎯", "🎡", "🎠", "🎭", "🌈"],
    borderColors: ["#a01b23", "#b07030", "#1a6b62", "#2e5570"],
  },
  graffiti: {
    colors: ["#6c757d", "#495057", "#868e96", "#5c636a", "#74797f", "#4a4e69", "#6b6f7e"],
    icons: ["💥", "⚡", "🔥", "✳️", "💢", "🎨", "💣", "🌀"],
    borderColors: ["#343a40", "#1e2124", "#4a4f54", "#2a2d30"],
  },
  fantasy: {
    colors: ["#6a0572", "#7b2d8b", "#5a189a", "#7209b7", "#560bad", "#3a0ca3", "#9d4edd"],
    icons: ["✨", "🏰", "💎", "👑", "🌟", "🔮", "🦄", "🧚"],
    borderColors: ["#380041", "#42184a", "#2e0c50", "#3c0080"],
  },
};

interface TileProp {
  bgColor: string;
  borderColor: string;
  icon: string;
  showIcon: boolean;
  exitRotate: number;
  exitX: number;
  exitY: number;
}

function buildTileProps(theme: WallTheme): TileProp[] {
  const config = THEME_CONFIG[theme];
  return Array.from({ length: TOTAL_TILES }, (_, i) => ({
    bgColor:
      theme === "playground"
        ? config.colors[i % config.colors.length]
        : config.colors[Math.floor(i * 1.618034) % config.colors.length],
    borderColor: config.borderColors[i % config.borderColors.length],
    icon: config.icons[Math.floor(i * 2.718) % config.icons.length],
    showIcon: (i * 7 + 3) % 10 < 7,
    exitRotate: ((i * 137) % 140) - 70,
    exitX: ((i * 53) % 60) - 30,
    exitY: ((i * 37) % 50) - 25,
  }));
}

function WallTile({ index, props }: { index: number; props: TileProp }) {
  return (
    <motion.div
      key={`tile-${index}`}
      initial={{ scale: 1, opacity: 1 }}
      exit={{
        scale: [1, 1.4, 0],
        opacity: [1, 1, 0],
        rotate: props.exitRotate,
        x: props.exitX,
        y: props.exitY,
      }}
      transition={{ duration: 0.38, times: [0, 0.28, 1] }}
      className="w-full h-full rounded-xl relative overflow-hidden select-none"
      style={{
        backgroundColor: props.bgColor,
        boxShadow: `inset 0 -4px 0 ${props.borderColor}, inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 12px rgba(0,0,0,0.25)`,
        border: `1px solid ${props.borderColor}`,
      }}
    >
      {props.showIcon && (
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
        >
          {props.icon}
        </span>
      )}
    </motion.div>
  );
}

// --- Main component ---
export default function Brush() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const profile = getProfile(params.id || "");

  const [isBrushing, setIsBrushing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [visibleTiles, setVisibleTiles] = useState<number[]>(
    Array.from({ length: TOTAL_TILES }, (_, i) => i)
  );

  const popOrderRef = useRef<number[]>([]);
  const tilePropsMemo = useRef<TileProp[]>([]);

  // Refs for timer — never trigger re-renders
  const elapsedMsRef = useRef(0);
  const revealedCountRef = useRef(0);
  const lastDisplayedSecondRef = useRef(0);
  const profileIdRef = useRef<string | undefined>(undefined);

  // Keep profileId ref current
  profileIdRef.current = profile?.id;

  useEffect(() => {
    if (!loaded) return;
    if (!profile) {
      setLocation("/");
      return;
    }
    // Shuffle pop order
    const order = Array.from({ length: TOTAL_TILES }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    popOrderRef.current = order;
    tilePropsMemo.current = buildTileProps(profile.theme);
  }, [loaded, profile, setLocation]);

  // Main timer — only re-runs when isBrushing changes
  useEffect(() => {
    if (!isBrushing) return;

    // Reset counters when brushing starts
    elapsedMsRef.current = 0;
    revealedCountRef.current = 0;
    lastDisplayedSecondRef.current = 0;

    const interval = setInterval(() => {
      elapsedMsRef.current += 100;
      const elapsedSeconds = elapsedMsRef.current / 1000;

      // Update countdown display once per second
      const displaySecond = Math.floor(elapsedSeconds);
      if (displaySecond > lastDisplayedSecondRef.current) {
        lastDisplayedSecondRef.current = displaySecond;
        const remaining = Math.max(0, TOTAL_TIME - displaySecond);
        setTimeLeft(remaining);
      }

      // Check how many tiles should be revealed by now
      const targetCount = expectedRevealed(elapsedSeconds);
      if (targetCount > revealedCountRef.current) {
        const from = revealedCountRef.current;
        const to = targetCount;
        revealedCountRef.current = to;
        // Slice out the indices to pop
        const toPop = popOrderRef.current.slice(from, to);
        if (toPop.length > 0) {
          setVisibleTiles((prev) => prev.filter((t) => !toPop.includes(t)));
        }
      }

      // Timer finished
      if (elapsedSeconds >= TOTAL_TIME) {
        clearInterval(interval);
        // Pop any stragglers immediately
        setVisibleTiles([]);
        setTimeLeft(0);
        setTimeout(() => {
          setLocation(`/celebrate/${profileIdRef.current}`);
        }, 1200);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isBrushing, setLocation]);

  if (!loaded)
    return (
      <div className="h-[100dvh] w-full max-w-md mx-auto bg-black flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!profile) return null;

  const startBrushing = () => setIsBrushing(true);

  const handleCancel = () => {
    if (confirm("Stop brushing? You'll lose your progress!")) {
      setLocation("/");
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  const totalIcons = 8;
  const iconsRemaining = Math.ceil((timeLeft / TOTAL_TIME) * totalIcons);
  const revealPercent = Math.round(
    ((TOTAL_TILES - visibleTiles.length) / TOTAL_TILES) * 100
  );

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-black relative overflow-hidden">
      {/* Background image with pulsing glow */}
      <div className="absolute inset-0 z-0">
        <img
          src={profile.imageBase64}
          alt="Hidden"
          className="w-full h-full object-cover"
        />
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>

      {/* Wall grid — full screen */}
      <div className="absolute inset-0 z-10 p-1.5">
        <div
          className="w-full h-full grid gap-1.5"
          style={{
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: TOTAL_TILES }).map((_, i) => (
            <AnimatePresence key={i}>
              {visibleTiles.includes(i) && tilePropsMemo.current[i] && (
                <WallTile index={i} props={tilePropsMemo.current[i]} />
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* UI overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        {/* Top bar */}
        <div className="p-4 flex justify-between items-start pointer-events-auto">
          <button
            onClick={handleCancel}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white shadow-lg"
            data-testid="button-cancel"
          >
            <X className="w-5 h-5" />
          </button>

          {isBrushing && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="bg-black/50 backdrop-blur-md rounded-full py-2 px-3 flex gap-1 shadow-lg">
                {Array.from({ length: totalIcons }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      opacity: i < iconsRemaining ? 1 : 0.2,
                      scale: i < iconsRemaining ? 1 : 0.75,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="text-lg"
                  >
                    🦷
                  </motion.span>
                ))}
              </div>
              <div className="bg-primary text-white font-black text-2xl py-1 px-5 rounded-2xl shadow-lg border-2 border-white/20">
                {timeStr}
              </div>
            </motion.div>
          )}
        </div>

        {/* Reveal % badge */}
        {isBrushing && revealPercent > 0 && (
          <div className="absolute top-24 right-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-lg"
            >
              <span className="text-xs font-black text-primary">
                {revealPercent}% revealed!
              </span>
            </motion.div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="p-6 pb-8 pointer-events-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <AnimatePresence mode="wait">
            {!isBrushing ? (
              <motion.div
                key="start"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="text-center"
              >
                <h2 className="text-3xl font-black text-white mb-5 drop-shadow-md">
                  Ready, {profile.name}?
                </h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={startBrushing}
                  className="w-full bg-primary text-white text-2xl font-black py-5 rounded-full shadow-[0_8px_0_hsl(355,85%,45%)] active:translate-y-2 active:shadow-[0_2px_0_hsl(355,85%,45%)] transition-all"
                  data-testid="button-start-brushing"
                >
                  START BRUSHING! 🦷
                </motion.button>
                <p className="text-white/60 font-bold mt-3 text-sm">
                  2 minutes · tiles pop away as you brush!
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="brushing"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-xl font-black text-white mb-1 drop-shadow-md">
                  Keep going, {profile.name}! 💪
                </h2>
                <p className="text-white/70 font-semibold text-sm">
                  Brush every tooth!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
