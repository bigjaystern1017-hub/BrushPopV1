import { useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Flame } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";

function getDayLetter(dateStr: string) {
  return ["S", "M", "T", "W", "T", "F", "S"][new Date(dateStr + "T12:00:00").getDay()];
}

function getEncouragement(streak: number): string {
  if (streak === 0) return "Time to start your streak! 🦷";
  if (streak === 1) return "Day 1! Great start! 🌟";
  if (streak === 2) return "2 days in a row! Keep it up! 💪";
  if (streak <= 4) return `${streak} days! You're getting the habit! 🎉`;
  if (streak <= 6) return `${streak} days! You're on a roll! ⭐`;
  if (streak === 7) return "A full week! That's AMAZING! 🔥";
  if (streak <= 13) return `${streak} days! You're incredible! 🔥🔥`;
  return `${streak} days! YOU'RE ON FIRE! 🔥🔥🔥`;
}

export default function StreakPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const { getKidSessions, getStreak } = useSessions();

  const profile = getProfile(params.id || "");

  useEffect(() => {
    if (loaded && !profile) setLocation("/");
  }, [loaded, profile, setLocation]);

  const streak = profile ? getStreak(profile.id) : 0;
  const sessions = profile ? getKidSessions(profile.id) : [];

  const last14 = useMemo(() => {
    const brushedDays = new Set(sessions.map((s) => s.date));
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split("T")[0];
      return { dateStr, brushed: brushedDays.has(dateStr), letter: getDayLetter(dateStr) };
    });
  }, [sessions]);

  if (!loaded)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!profile) return null;

  const week1 = last14.slice(0, 7);
  const week2 = last14.slice(7);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-transparent max-w-md mx-auto flex flex-col"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setLocation("/")}
          className="p-2 rounded-full hover:bg-muted"
          data-testid="button-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-black flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> Streak
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-5 flex flex-col gap-6">
        {/* Kid name */}
        <p className="text-center text-sm font-black text-muted-foreground uppercase tracking-widest">
          {profile.name}'s brushing streak
        </p>

        {/* Big streak number */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-40 h-40 bg-white rounded-full shadow-xl flex flex-col items-center justify-center border-4 border-orange-100">
              <span className="text-6xl font-black text-orange-500 leading-none">{streak}</span>
              <span className="text-sm font-black text-orange-300 uppercase tracking-wider mt-1">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute -top-3 -right-3 text-4xl"
            >
              🔥
            </motion.div>
          </div>
        </motion.div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-4 bg-white rounded-3xl px-6 py-4 shadow-sm text-center"
        >
          <p className="text-lg font-black text-foreground leading-snug">
            {getEncouragement(streak)}
          </p>
        </motion.div>

        {/* 14-day calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl p-5 shadow-sm"
        >
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-4 text-center">
            Last 14 days
          </h2>
          <div className="flex flex-col gap-3">
            {[week1, week2].map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5">
                {week.map(({ dateStr, brushed, letter }) => (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground">{letter}</span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.4, delay: 0.4 + wi * 0.07 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-base shadow-sm
                        ${brushed
                          ? "bg-primary text-white shadow-primary/30"
                          : "bg-muted text-muted-foreground/40"
                        }`}
                    >
                      {brushed ? "✓" : "·"}
                    </motion.div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Total sessions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground font-semibold"
        >
          {sessions.length === 0
            ? "No sessions yet — start brushing to build your streak!"
            : `${sessions.length} total ${sessions.length === 1 ? "session" : "sessions"} completed 🦷`}
        </motion.div>
      </div>
    </motion.div>
  );
}
