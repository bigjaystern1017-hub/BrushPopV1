import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLINIC } from "@/lib/clinicConfig";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            backgroundImage: "url('/app-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        >
          {/* Floating bubbles behind logo */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0, scale: 0.5 }}
              animate={{
                y: -20,
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute"
              style={{
                left: `${15 + i * 13}%`,
                bottom: "30%",
                width: `${20 + i * 5}px`,
                height: `${20 + i * 5}px`,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8), rgba(135,206,250,0.3))",
              }}
            />
          ))}

          {/* Logo with bounce-in animation */}
          <motion.img
            src="/brushpop-logo.png"
            alt="BrushPop"
            className="h-[269px] drop-shadow-xl relative z-10"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              bounce: 0.5,
              duration: 1,
            }}
          />

          {/* Tagline fades in after logo */}
          <motion.p
            className="text-foreground/60 font-bold text-lg mt-4 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Pop the plaque. Reveal the prize.
          </motion.p>

          {CLINIC.showBranding && (
            <motion.p
              className="text-foreground/40 font-semibold text-sm mt-6 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Brought to you by {CLINIC.name}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
