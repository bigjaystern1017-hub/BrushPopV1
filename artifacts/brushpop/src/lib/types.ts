export type WallTheme = "blast-off" | "outer-space" | "jungle" | "enchanted-jungle" | "ocean" | "pirates" | "fairy-tale" | "playground" | "skate-park" | "robot-lab" | "sports" | "magical-city";

export interface KidProfile {
  id: string;          // crypto.randomUUID()
  name: string;
  imageBase64: string; // resized square, base64
  theme: WallTheme;
  surpriseMode: boolean;
  createdAt: number;
}

export interface BrushSession {
  id: string;
  kidId: string;
  date: string;        // YYYY-MM-DD
  completedAt: number; // timestamp
}
