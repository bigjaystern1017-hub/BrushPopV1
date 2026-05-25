import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";

const TOTAL_TIME = 120; // 2 minutes
const ROWS = 7;
const COLS = 5;
const TOTAL_TILES = ROWS * COLS;

export default function Brush() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const profile = getProfile(params.id || "");

  const [isBrushing, setIsBrushing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [visibleTiles, setVisibleTiles] = useState<number[]>(Array.from({length: TOTAL_TILES}, (_, i) => i));
  
  // Create a randomized order for tiles to pop
  const popOrderRef = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (!profile) {
      setLocation("/");
      return;
    }
    // Shuffle tiles
    const order = Array.from({length: TOTAL_TILES}, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    popOrderRef.current = order;
  }, [loaded, profile, setLocation]);

  useEffect(() => {
    if (isBrushing && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
        
        // Calculate how many tiles should be hidden by now
        // e.g. at 120s, 0 hidden. at 0s, 35 hidden.
        const targetHiddenCount = Math.floor(((TOTAL_TIME - (timeLeft - 1)) / TOTAL_TIME) * TOTAL_TILES);
        const currentHiddenCount = TOTAL_TILES - visibleTiles.length;
        
        if (targetHiddenCount > currentHiddenCount) {
          // Pop the next tile
          const nextToPop = popOrderRef.current[currentHiddenCount];
          if (nextToPop !== undefined) {
             setVisibleTiles(prev => prev.filter(t => t !== nextToPop));
          }
        }
      }, 1000);
    } else if (timeLeft === 0 && isBrushing) {
      // Boom!
      setVisibleTiles([]);
      setTimeout(() => {
        setLocation(`/celebrate/${profile?.id}`);
      }, 1500);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isBrushing, timeLeft, visibleTiles.length, profile?.id, setLocation]);

  if (!profile) return null;

  const startBrushing = () => {
    setIsBrushing(true);
  };

  const handleCancel = () => {
    if (confirm("Stop brushing? You'll lose your progress!")) {
      setLocation("/");
    }
  };

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Top icons progress
  const totalIcons = 8;
  const iconsRemaining = Math.ceil((timeLeft / TOTAL_TIME) * totalIcons);

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-black relative overflow-hidden flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={profile.imageBase64} alt="Hidden" className="w-full h-full object-cover" />
      </div>

      {/* Wall Grid */}
      <div className="absolute inset-0 z-10 p-2 pt-20 pb-40">
        <div className="w-full h-full grid gap-1" style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`, gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {Array.from({length: TOTAL_TILES}).map((_, i) => (
             <AnimatePresence key={i}>
                {visibleTiles.includes(i) && (
                  <motion.div
                    exit={{ scale: 0, opacity: 0, rotate: (Math.random() - 0.5) * 45 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-full h-full rounded-sm theme-${profile.theme} relative overflow-hidden`}
                  >
                    {/* Add subtle variation/icons to some tiles based on theme */}
                    {i % 7 === 0 && profile.theme === 'space' && <span className="absolute top-1 left-1 text-[10px] opacity-50">⭐</span>}
                    {i % 5 === 0 && profile.theme === 'jungle' && <span className="absolute bottom-1 right-1 text-[10px] opacity-40">🌿</span>}
                    {i % 8 === 0 && profile.theme === 'underwater' && <span className="absolute top-2 right-2 text-[10px] opacity-30">🫧</span>}
                  </motion.div>
                )}
             </AnimatePresence>
          ))}
        </div>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none">
        
        {/* Top Header */}
        <div className="p-4 flex justify-between items-start pointer-events-auto">
          <button onClick={handleCancel} className="p-3 bg-black/30 backdrop-blur-md rounded-full text-white">
            <X className="w-6 h-6" />
          </button>
          
          {isBrushing && (
            <div className="flex flex-col items-center">
              <div className="bg-black/40 backdrop-blur-md rounded-full py-2 px-4 flex gap-1 mb-2">
                {Array.from({length: totalIcons}).map((_, i) => (
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
        </div>

        {/* Bottom Controls */}
        <div className="p-6 pb-safe pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {!isBrushing ? (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-black text-white mb-6 drop-shadow-md">Ready, {profile.name}?</h2>
              <button 
                onClick={startBrushing}
                className="w-full bg-primary text-white text-2xl font-black py-5 rounded-full shadow-[0_8px_0_hsl(355,85%,45%)] hover:translate-y-[2px] hover:shadow-[0_6px_0_hsl(355,85%,45%)] active:translate-y-[8px] active:shadow-none transition-all"
              >
                START BRUSHING!
              </button>
              <p className="text-white/70 font-bold mt-4">2 Minutes</p>
            </motion.div>
          ) : (
            <div className="text-center">
               <h2 className="text-xl font-bold text-white mb-2 drop-shadow-md">Keep going, {profile.name}!</h2>
               <p className="text-white/80 font-medium">Brush every tooth!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
