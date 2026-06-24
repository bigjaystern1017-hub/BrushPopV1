import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Phone, CalendarCheck } from "lucide-react";
import { CLINIC } from "@/lib/clinicConfig";

export default function About() {
  const [, setLocation] = useLocation();

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
        <h1 className="text-lg font-black">Our Practice</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5">
        {/* Logo */}
        {CLINIC.logoUrl && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center pt-4"
          >
            <img
              src={CLINIC.logoUrl}
              alt={CLINIC.name}
              className="h-28 object-contain drop-shadow-md"
            />
          </motion.div>
        )}

        {/* Name card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm text-center"
        >
          <h2 className="text-2xl font-black text-primary mb-3">{CLINIC.name}</h2>
          <p className="text-foreground/70 font-medium leading-relaxed text-base">
            {CLINIC.description}
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm"
        >
          {/* Phone */}
          <a
            href={`tel:${CLINIC.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors active:bg-muted"
            data-testid="link-phone"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                Call us
              </p>
              <p className="font-black text-foreground text-lg">{CLINIC.phone}</p>
            </div>
          </a>

          <div className="h-px bg-muted mx-5" />

          {/* Booking */}
          <a
            href={CLINIC.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors active:bg-muted"
            data-testid="link-booking"
          >
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                Book an appointment
              </p>
              <p className="font-black text-secondary text-base">Schedule online →</p>
            </div>
          </a>
        </motion.div>

        {/* Book CTA button */}
        <motion.a
          href={CLINIC.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className="block text-center bg-secondary text-white text-lg font-black py-4 px-8 rounded-full shadow-[0_5px_0_hsl(199,70%,35%)] active:translate-y-1 active:shadow-[0_2px_0_hsl(199,70%,35%)] transition-all"
          data-testid="button-book"
        >
          Book an Appointment
        </motion.a>

        <p className="text-center text-xs text-muted-foreground/60 font-medium leading-relaxed">
          Powered by BrushPop™ — helping families build healthy habits one brush at a time.
        </p>
        <p
          className="text-[10px] text-center leading-relaxed pb-6"
          style={{ color: "#94A3B8" }}
        >
          BrushPop is for entertainment and educational purposes only. Not a medical device.
        </p>
      </div>
    </motion.div>
  );
}
