import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useProfiles } from "@/lib/useProfiles";

const CHEVRON_DOWN = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const [installExpanded, setInstallExpanded] = useState(false);
  const [location, navigate] = useLocation();
  const { profiles } = useProfiles();

  const isBrushing = location.startsWith("/brush/");
  if (isBrushing) return null;

  const singleProfile = profiles.length === 1 ? profiles[0] : null;

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const navItems = [
    { emoji: "🏠", label: "Home", path: "/" },
    {
      emoji: "🔥",
      label: "Streak Tracker",
      path: singleProfile ? `/streak/${singleProfile.id}` : "/",
    },
    {
      emoji: "📸",
      label: "Photo Library",
      path: singleProfile ? `/photos/${singleProfile.id}` : "/",
    },
    { emoji: "🦷", label: "About Our Practice", path: "/about" },
  ];

  return (
    <>
      {/* Hamburger button — fixed top-right, visible on all non-brush screens */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-[55] p-3 bg-black/30 backdrop-blur-md rounded-full text-white active:scale-95 transition-transform shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[58] bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed right-0 top-0 bottom-0 z-[60] w-[300px] bg-white rounded-l-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Gradient header */}
              <div
                className="px-5 pt-10 pb-5 relative flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #38bdf8 0%, #fb7185 100%)" }}
              >
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/25 text-white active:scale-95 transition-transform"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src="/brushpop-logo.png"
                  alt="BrushPop"
                  className="h-10 drop-shadow"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}
                />
                <p className="text-white/85 text-sm font-bold mt-1.5 leading-snug">
                  Pop the plaque. Reveal the prize.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-sky-100 via-pink-100 to-transparent flex-shrink-0" />

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => go(item.path)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-colors hover:bg-sky-50 active:bg-sky-100 group"
                  >
                    <span className="text-xl w-7 text-center leading-none">{item.emoji}</span>
                    <span className="text-[15px] font-bold text-gray-800 group-hover:text-sky-600 transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}

                {/* How to Install — expandable row */}
                <div className="rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setInstallExpanded((e) => !e)}
                    className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-pink-50 active:bg-pink-100 group"
                  >
                    <span className="text-xl w-7 text-center leading-none">📲</span>
                    <span className="text-[15px] font-bold text-gray-800 flex-1 group-hover:text-pink-500 transition-colors">
                      How to Install
                    </span>
                    <motion.span
                      animate={{ rotate: installExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400 flex-shrink-0"
                    >
                      {CHEVRON_DOWN}
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {installExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 pt-1 space-y-2.5">
                          <div className="bg-sky-50 rounded-xl p-3.5">
                            <p className="text-[11px] font-black text-sky-500 uppercase tracking-wider mb-1.5">
                              🍎 iPhone / iPad
                            </p>
                            <p className="text-sm text-gray-600 font-medium leading-snug">
                              Open in <strong>Safari</strong> → tap the Share button{" "}
                              <strong>⬆</strong> → <strong>"Add to Home Screen"</strong>
                            </p>
                          </div>
                          <div className="bg-pink-50 rounded-xl p-3.5">
                            <p className="text-[11px] font-black text-pink-400 uppercase tracking-wider mb-1.5">
                              🤖 Android
                            </p>
                            <p className="text-sm text-gray-600 font-medium leading-snug">
                              Open in <strong>Chrome</strong> → tap the{" "}
                              <strong>⋮</strong> menu →{" "}
                              <strong>"Add to Home Screen"</strong>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Footer */}
              <div className="px-5 pb-7 pt-2 text-center flex-shrink-0 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mt-3">Made with 🦷 for happy smiles</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
