import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trophy, Settings, Flame, Camera, X, ShieldCheck } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { useSessions } from "@/lib/useSessions";
import { useClinic } from "@/hooks/useClinic";
import { KidProfile } from "@/lib/types";

const THEME_ICONS: Record<string, string> = {
  "blast-off": "🚀",
  "outer-space": "🪐",
  "jungle": "🌿",
  "enchanted-jungle": "🌙",
  "ocean": "🐠",
  "pirates": "🏴‍☠️",
  "fairy-tale": "🏰",
  "playground": "🎈",
  "skate-park": "🛹",
  "robot-lab": "🤖",
  "sports": "⚽",
  "magical-city": "✨",
};

const PRIVACY_TEXT =
  "BrushPop does not collect or store any personal data on external servers. All photos, profiles, and streak data are stored privately on your own device and are never shared with anyone. This app is not a medical application and does not access any health or patient data.";

export default function KidSelect() {
  const clinic = useClinic();
  const { profiles } = useProfiles();
  const { getStreak } = useSessions();
  const [, setLocation] = useLocation();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [noPhotoId, setNoPhotoId] = useState<string | null>(null);

  const handleBrushTap = (profile: KidProfile) => {
    if (!profile.imageBase64) {
      setNoPhotoId(profile.id);
      setTimeout(() => setNoPhotoId(null), 3500);
      return;
    }
    setLocation(`/brush/${profile.id}`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-transparent flex flex-col items-center max-w-md mx-auto"
      >
        {/* Header */}
        <div className="w-full text-center pt-10 pb-6 px-6 flex flex-col items-center">
          <img
            src="/brushpop-logo.png"
            alt="BrushPop"
            className="h-[246px] mx-auto mb-3 drop-shadow-lg"
          />

          {/* Dentist branding pill — second thing a parent sees */}
          {clinic.showBranding && (
            <div className="flex items-center gap-3 bg-white/82 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-md">
              {/* Clinic logo circle */}
              <div className="w-9 h-9 rounded-full bg-sky-50 border-2 border-white/80 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {clinic.logoUrl ? (
                  <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-xl leading-none">🦷</span>
                )}
              </div>

              {/* Text */}
              <div className="text-left pr-1">
                <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide leading-none mb-0.5">
                  Presented by
                </p>
                <p className="text-base font-black text-foreground leading-tight">
                  {clinic.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {profiles.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 w-full pb-12">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-36 h-36 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 border-4 border-primary/10"
            >
              <span className="text-6xl">🦷</span>
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-2">Welcome to BrushPop!</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Add your first kid to start the brushing adventure. They'll reveal a surprise image every time they brush!
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setLocation("/setup")}
              data-testid="button-add-kid"
              className="bg-primary text-white text-xl font-black py-5 px-8 rounded-full shadow-[0_6px_0_hsl(355,85%,45%)] active:translate-y-1.5 active:shadow-[0_2px_0_hsl(355,85%,45%)] transition-all w-full"
            >
              Add Your First Kid
            </motion.button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 px-4 pb-8">
            {/* Section label — title case, friendlier */}
            <p className="text-center text-sm font-bold text-muted-foreground tracking-wide mb-2">
              Who's brushing tonight?
            </p>

            <div className="grid grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  whileTap={{ scale: 0.96 }}
                  data-testid={`card-kid-${profile.id}`}
                  className="bg-white rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.07)] overflow-hidden cursor-pointer border-2 border-white hover:border-primary/30 transition-colors"
                  onClick={() => handleBrushTap(profile)}
                >
                  {/* Accent strip */}
                  <div className="h-2 w-full bg-primary" />

                  {/* Image / initial */}
                  <div className="aspect-square relative overflow-hidden bg-muted flex items-center justify-center">
                    {profile.imageBase64 && !profile.surpriseMode ? (
                      <img
                        src={profile.imageBase64}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-5xl">{THEME_ICONS[profile.theme] ?? "🦷"}</span>
                        <span className="text-3xl font-black text-primary/40">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-2 left-3 text-white font-black text-lg drop-shadow">
                      {profile.name}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 px-2.5 py-2 bg-white">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/streak/${profile.id}`);
                      }}
                      data-testid={`button-streak-${profile.id}`}
                      className="flex items-center gap-0.5 text-xs font-black text-orange-500 bg-orange-50 rounded-full px-2.5 py-1.5 active:scale-95 transition-all shrink-0"
                    >
                      <Flame className="w-3 h-3" />
                      {getStreak(profile.id)}
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/collection/${profile.id}`);
                      }}
                      data-testid={`button-rewards-${profile.id}`}
                      className="flex items-center gap-1 text-xs font-black text-secondary bg-secondary/15 rounded-full px-2.5 py-1.5 active:scale-95 transition-all"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      Pops
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/photos/${profile.id}`);
                      }}
                      data-testid={`button-photos-${profile.id}`}
                      className="flex items-center gap-1 text-xs font-black text-primary bg-primary/10 rounded-full px-2.5 py-1.5 active:scale-95 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Photo
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/setup/${profile.id}`);
                      }}
                      data-testid={`button-settings-${profile.id}`}
                      className="p-1.5 bg-muted text-muted-foreground rounded-full active:scale-95 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add kid card — more intentional appearance */}
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => setLocation("/setup")}
                data-testid="button-add-another-kid"
                className="bg-white/85 rounded-3xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center cursor-pointer min-h-[220px] gap-3"
              >
                <div className="w-14 h-14 bg-primary/25 rounded-full flex items-center justify-center text-primary shadow-md">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="font-black text-primary/70 text-sm">Add Kid</span>
              </motion.div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="w-full py-6 px-4 mt-auto flex flex-col items-center gap-3">

          {/* Legal footer */}
          <p className="text-[10px] text-foreground/30 leading-relaxed text-center">
            © 2026 Brighter Mind Labs. All rights reserved.
            <br />
            BrushPop™ is a product of Brighter Mind Labs.
            <br />
            <span className="underline cursor-pointer active:opacity-70">Terms of Service</span>
            {" · "}
            <span
              className="underline cursor-pointer active:opacity-70"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </span>
          </p>
          <p className="text-[10px] text-foreground/20 font-medium">v1.0</p>
          <p
            className="text-[10px] text-center leading-relaxed pb-3"
            style={{ color: "#94A3B8" }}
          >
            BrushPop is for entertainment and educational purposes only. Not a medical device.
          </p>
        </div>
      </motion.div>

      {/* No-photo toast */}
      <AnimatePresence>
        {noPhotoId && (
          <motion.div
            key="no-photo-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-0 right-0 flex justify-center z-50 px-6 pointer-events-none"
          >
            <div className="bg-foreground text-background font-bold px-5 py-3.5 rounded-2xl shadow-xl text-sm flex items-center gap-2 max-w-xs text-center">
              <span>📷</span>
              Add a surprise photo first — your child will love it!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            key="privacy-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setShowPrivacy(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h2 className="font-black text-lg">Privacy Policy</h2>
                </div>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 rounded-full bg-muted text-muted-foreground active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-foreground/70 leading-relaxed text-sm">
                {PRIVACY_TEXT}
              </p>
              <button
                onClick={() => setShowPrivacy(false)}
                className="mt-6 w-full bg-primary text-white font-black py-3.5 rounded-full active:scale-95 transition-all"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
