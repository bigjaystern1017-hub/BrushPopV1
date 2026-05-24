import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";

export default function Celebrate() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile } = useProfiles();
  const { saveSession, getStreak } = useSessions();
  const profile = getProfile(params.id || "");
  
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!profile) {
      setLocation("/");
      return;
    }

    // Save session on mount
    const today = new Date().toISOString().split('T')[0];
    saveSession({
      id: crypto.randomUUID(),
      kidId: profile.id,
      date: today,
      completedAt: Date.now()
    });

    // We get the streak AFTER saving, so it includes today
    // Small timeout to let state settle if needed, but synchronous is fine
    setTimeout(() => {
       setStreak(getStreak(profile.id));
    }, 100);

  }, [profile?.id]);

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* CSS Confetti */}
      {Array.from({length: 60}).map((_, i) => (
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            backgroundColor: ['#FF6B7A', '#FFB703', '#00B4D8', '#4ADE80'][Math.floor(Math.random() * 4)]
          }}
        />
      ))}

      <motion.div 
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full flex flex-col items-center z-10"
      >
        <h1 className="text-4xl font-black text-primary mb-8 drop-shadow-sm">You did it!</h1>
        
        <div className="w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl mb-8 border-8 border-white bg-white">
          <img src={profile.imageBase64} alt="Revealed" className="w-full h-full object-cover" />
        </div>

        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-primary/20 flex items-center gap-3 mb-12"
        >
          <span className="text-3xl">🔥</span>
          <div>
             <div className="font-black text-xl text-foreground">{streak} Day Streak!</div>
             <div className="text-sm text-muted-foreground font-bold">Keep it up!</div>
          </div>
        </motion.div>

        <button 
          onClick={() => setLocation("/")}
          className="bg-secondary text-secondary-foreground text-2xl font-black py-5 px-12 rounded-full shadow-[0_8px_0_hsl(45,95%,45%)] hover:translate-y-[2px] hover:shadow-[0_6px_0_hsl(45,95%,45%)] active:translate-y-[8px] active:shadow-none transition-all w-full"
        >
          Done! ✨
        </button>
      </motion.div>
    </motion.div>
  );
}
