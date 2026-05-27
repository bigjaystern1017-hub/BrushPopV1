import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";

export default function Collection() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const { getKidSessions } = useSessions();

  const profile = getProfile(params.id || "");
  const sessions = getKidSessions(profile?.id || "");

  useEffect(() => {
    if (loaded && !profile) {
      setLocation("/");
    }
  }, [loaded, profile, setLocation]);

  if (!loaded)
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!profile) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

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
          <Star className="w-5 h-5 text-secondary fill-secondary" /> Pop Gallery
        </h1>
        <div className="w-10" />
      </div>

      <div className="p-5 flex-1">
        {/* Profile header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-primary">{profile.name}'s Pops</h2>
          <p className="text-muted-foreground font-semibold text-sm mt-1">
            {sessions.length === 0
              ? "No pops yet"
              : `${sessions.length} ${sessions.length === 1 ? "pop" : "pops"} revealed`}
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-5">
              <span className="text-4xl">🦷</span>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Nothing here yet!</h3>
            <p className="text-muted-foreground font-medium leading-snug max-w-[240px]">
              Finish a brush to unlock your first Pop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: "spring", bounce: 0.3 }}
                data-testid={`card-session-${session.id}`}
                className="bg-white rounded-3xl overflow-hidden shadow-md border-2 border-transparent hover:border-primary/25 transition-colors"
              >
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <img
                    src={profile.imageBase64}
                    alt="Popped surprise"
                    className="w-full h-full object-cover"
                  />
                  {/* Pop badge */}
                  <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    #{sessions.length - i}
                  </div>
                </div>
                {/* Date */}
                <div className="px-3 py-2.5 text-center">
                  <p className="font-black text-sm text-foreground">{formatDate(session.date)}</p>
                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Revealed ✨</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
