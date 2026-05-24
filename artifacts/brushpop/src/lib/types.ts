export type WallTheme = "space" | "jungle" | "underwater" | "playground" | "graffiti" | "fantasy";

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
