import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";

export default function Collection() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile } = useProfiles();
  const { getKidSessions } = useSessions();
  
  const profile = getProfile(params.id || "");
  const sessions = getKidSessions(profile?.id || "");

  if (!profile) {
    setLocation("/");
    return null;
  }

  // Format date safely
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background max-w-md mx-auto flex flex-col"
    >
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => setLocation("/")} className="p-2 rounded-full hover:bg-muted">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-secondary" /> Collection</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-6 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-primary">{profile.name}'s Rewards</h2>
          <p className="text-muted-foreground font-medium mt-1">{sessions.length} brushes completed</p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Trophy className="w-20 h-20 mb-4" />
            <h3 className="text-xl font-bold">No rewards yet</h3>
            <p>Start brushing to reveal images!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* For this MVP without a real backend storing separate images per session, 
                we just show the current profile image for every session, 
                but in a real app these would be unique images. */}
            {sessions.map((session, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={session.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
              >
                <div className="aspect-square bg-muted">
                  <img src={profile.imageBase64} alt="Reward" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 text-center bg-white">
                  <p className="font-bold text-sm text-foreground">{formatDate(session.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
