import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Camera, X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";

export default function Photos() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { getProfile, loaded } = useProfiles();
  const { getKidSessions } = useSessions();

  const [fullscreen, setFullscreen] = useState(false);

  const profile = getProfile(params.id || "");
  const sessions = profile ? getKidSessions(profile.id) : [];

  useEffect(() => {
    if (loaded && !profile) setLocation("/");
  }, [loaded, profile, setLocation]);

  if (!loaded)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  if (!profile) return null;

  const hasPhoto = !!profile.imageBase64;
  const revealCount = sessions.length;

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
          <Camera className="w-5 h-5 text-primary" /> Surprise Photo
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5">
        <p className="text-center text-sm font-black text-muted-foreground uppercase tracking-widest">
          {profile.name}'s surprise
        </p>

        {hasPhoto ? (
          <>
            {/* Thumbnail */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="bg-white rounded-3xl overflow-hidden shadow-md cursor-pointer"
              onClick={() => setFullscreen(true)}
              data-testid="photo-thumbnail"
            >
              <img
                src={profile.imageBase64}
                alt="Surprise photo"
                className="w-full aspect-square object-cover"
              />
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-black text-foreground">Current Surprise</p>
                  <p className="text-sm text-muted-foreground font-semibold mt-0.5">
                    {revealCount === 0
                      ? "Not yet revealed"
                      : `Revealed ${revealCount} ${revealCount === 1 ? "time" : "times"} ✨`}
                  </p>
                </div>
                <div className="bg-primary/10 text-primary text-xs font-black px-3 py-1.5 rounded-full">
                  Tap to expand
                </div>
              </div>
            </motion.div>

            {/* Tip */}
            <p className="text-center text-xs text-muted-foreground font-semibold leading-relaxed px-4">
              Want to change the surprise? Tap ⚙️ on the home screen to upload a new photo.
            </p>
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 border-4 border-primary/10"
            >
              <span className="text-5xl">📷</span>
            </motion.div>
            <h3 className="text-xl font-black text-foreground mb-2">
              Your revealed surprises will show up here!
            </h3>
            <p className="text-muted-foreground font-medium leading-snug max-w-[260px] mb-8">
              Ask a grown-up to add a surprise photo in settings — it'll appear here after your first brush!
            </p>
            <button
              onClick={() => setLocation(`/setup/${profile.id}`)}
              className="bg-primary text-white font-black py-3 px-7 rounded-full shadow-md active:scale-95 transition-transform"
            >
              Add Surprise Photo
            </button>
          </motion.div>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && hasPhoto && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setFullscreen(false)}
            data-testid="photo-fullscreen"
          >
            <button
              className="absolute top-5 right-5 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full z-10"
              onClick={() => setFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              src={profile.imageBase64}
              alt="Surprise photo"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
