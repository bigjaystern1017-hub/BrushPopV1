import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";
import { CLINIC } from "@/lib/clinicConfig";

export default function Celebrate() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const { saveSession, getStreak } = useSessions();
  const profile = getProfile(params.id || "");

  const [streak, setStreak] = useState(0);
  const sessionSavedRef = useRef(false);
  const fanfareRef = useRef<HTMLAudioElement | null>(null);
  const fanfareFailedRef = useRef(false);

  useEffect(() => {
    if (!loaded) return;
    if (!profile) {
      setLocation("/");
      return;
    }

    // Guard against double-mount saving the session twice
    if (!sessionSavedRef.current) {
      sessionSavedRef.current = true;
      const today = new Date().toISOString().split("T")[0];
      saveSession({
        id: crypto.randomUUID(),
        kidId: profile.id,
        date: today,
        completedAt: Date.now(),
      });
      setTimeout(() => {
        setStreak(getStreak(profile.id));
      }, 100);
      // Play celebration fanfare
      try {
        const fanfare = new Audio("/fanfare.mp3");
        fanfare.volume = 0.7;
        fanfareRef.current = fanfare;
        fanfare.play().catch(() => { fanfareFailedRef.current = true; });
      } catch {}
    }

    return () => {
      if (fanfareRef.current) {
        fanfareRef.current.pause();
        fanfareRef.current = null;
      }
    };
  }, [loaded, profile?.id]);

  if (!loaded)
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-transparent max-w-md mx-auto relative flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Confetti */}
      {Array.from({ length: 55 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.07) % 3}s`,
            animationDuration: `${2.2 + (i % 5) * 0.4}s`,
            backgroundColor: ["#FF6B7A", "#FFB703", "#00B4D8", "#4ADE80", "#c77dff"][i % 5],
            borderRadius: i % 3 === 0 ? "50%" : "2px",
            width: i % 4 === 0 ? "8px" : "10px",
            height: i % 4 === 0 ? "8px" : "18px",
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.45 }}
        className="w-full flex flex-col items-center z-10"
      >
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-black text-primary drop-shadow-sm">You popped it!</h1>
          <p className="text-muted-foreground font-semibold mt-2">Tonight's surprise is revealed. 🎉</p>
        </motion.div>

        {/* Revealed image */}
        <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 border-8 border-white bg-white">
          <img
            src={profile.imageBase64}
            alt="Revealed surprise"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Streak badge */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
          className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-secondary/30 flex items-center gap-3 mb-10"
        >
          <span className="text-3xl">🔥</span>
          <div>
            <div className="font-black text-xl text-foreground">
              {streak} {streak === 1 ? "Day" : "Day"} Streak!
            </div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
              {streak >= 7 ? "On fire! Keep it up!" : "Keep brushing every night!"}
            </div>
          </div>
        </motion.div>

        {CLINIC.showBranding && (
          <div className="w-full mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center">
            <p className="text-foreground/50 text-xs font-bold mb-2">
              Healthy smiles brought to you by
            </p>
            <p className="text-foreground font-black text-base">
              {CLINIC.name}
            </p>
            <a
              href={CLINIC.bookingUrl}
              className="inline-block mt-3 bg-accent text-white font-bold text-sm py-2 px-6 rounded-full shadow-md active:scale-95 transition-transform"
            >
              📞 Book Your Next Checkup
            </a>
          </div>
        )}

        {/* Done button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (fanfareFailedRef.current && fanfareRef.current) {
              fanfareRef.current.play().catch(() => {});
            }
            setLocation("/");
          }}
          data-testid="button-done"
          className="bg-secondary text-secondary-foreground text-2xl font-black py-5 rounded-full shadow-[0_6px_0_hsl(45,95%,40%)] active:translate-y-1.5 active:shadow-[0_2px_0_hsl(45,95%,40%)] transition-all w-full"
        >
          Back Home 🏠
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
