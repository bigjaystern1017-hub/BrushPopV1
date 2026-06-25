export type ClinicConfig = {
  name: string;
  phone: string;
  bookingUrl: string;
  description: string;
  logoUrl: string | null;
  showBranding: boolean;
};

export const CLINICS: Record<string, ClinicConfig> = {
  warren: {
    name: "Just for Warren!! 🦷✨",
    phone: "",
    bookingUrl: "",
    description: "This app was made just for you, Warren! Keep popping those bubbles!",
    logoUrl: "/brushpop-logo.png",
    showBranding: true,
  },
  demo: {
    name: "Smith Pediatric Dentistry",
    phone: "(919) 555-0100",
    bookingUrl: "https://smithpediatricdentistry.com/book",
    description: "We're a family-focused pediatric dental practice dedicated to making every visit fun and fear-free.",
    logoUrl: "/brushpop-logo.png",
    showBranding: true,
  },
};

export const DEFAULT_CLINIC: ClinicConfig = {
  name: "Your Pediatric Dentist",
  phone: "(555) 123-4567",
  bookingUrl: "",
  description: "We're a family-focused pediatric dental practice dedicated to making every visit fun and fear-free.",
  logoUrl: "/brushpop-logo.png",
  showBranding: true,
};
