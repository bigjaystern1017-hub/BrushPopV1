import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, Trophy, Settings } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";
import { CLINIC } from "@/lib/clinicConfig";

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

function themeWallpaperUrl(id: string): string {
  const remap: Record<string, string> = {
    ocean: "ocean-explorers",
    pirates: "pirates-cove",
    sports: "sports-fun",
  };
  return `/wallpapers/${remap[id] ?? id}.png`;
}

export default function KidSelect() {
  const { profiles } = useProfiles();
  const [, setLocation] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-transparent flex flex-col items-center max-w-md mx-auto"
    >
      {/* Header */}
      <div className="w-full text-center pt-10 pb-8 px-6">
        <img
          src="/brushpop-logo.png"
          alt="BrushPop"
          className="h-44 mx-auto mb-2 drop-shadow-lg"
        />
        <p className="text-foreground/60 font-bold text-base mt-1">Pop the plaque. Reveal the prize.</p>
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
          <p className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Who's brushing tonight?
          </p>

          <div className="grid grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                whileTap={{ scale: 0.96 }}
                data-testid={`card-kid-${profile.id}`}
                className="bg-white rounded-3xl shadow-md overflow-hidden cursor-pointer border-2 border-white hover:border-primary/30 transition-colors"
                onClick={() => setLocation(`/brush/${profile.id}`)}
              >
                {/* Theme wallpaper banner strip */}
                <div
                  className="h-2 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${themeWallpaperUrl(profile.theme)})` }}
                />

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
                <div className="flex justify-between items-center px-3 py-2 bg-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/collection/${profile.id}`);
                    }}
                    data-testid={`button-rewards-${profile.id}`}
                    className="flex items-center gap-1 text-xs font-black text-secondary bg-secondary/15 rounded-full px-3 py-1.5 hover:bg-secondary hover:text-white transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Rewards
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation(`/setup/${profile.id}`);
                    }}
                    data-testid={`button-settings-${profile.id}`}
                    className="p-1.5 bg-muted text-muted-foreground rounded-full hover:bg-muted-foreground hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Add kid card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={() => setLocation("/setup")}
              data-testid="button-add-another-kid"
              className="bg-white/60 rounded-3xl border-3 border-dashed border-primary/25 flex flex-col items-center justify-center cursor-pointer min-h-[220px] gap-3"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-sm">
                <Plus className="w-7 h-7" />
              </div>
              <span className="font-black text-primary/60 text-sm">Add Kid</span>
            </motion.div>
          </div>
        </div>
      )}
      <div className="w-full text-center py-6 px-4 mt-auto">
        {CLINIC.showBranding && (
          <div className="mb-3 py-3 px-4 bg-white/40 backdrop-blur-sm rounded-2xl inline-block">
            <p className="text-foreground/50 font-bold text-xs">
              Provided by {CLINIC.name}
            </p>
            <p className="text-foreground/35 text-[11px] mt-0.5">
              {CLINIC.phone}
            </p>
          </div>
        )}
        <p className="text-[10px] text-foreground/30 leading-relaxed">
          © 2026 Brighter Mind Labs. All rights reserved.
          <br />
          BrushPop™ is a product of Brighter Mind Labs.
          <br />
          <span className="underline cursor-pointer">Terms of Service</span> · <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </motion.div>
  );
}
