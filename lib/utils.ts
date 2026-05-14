import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function tensionLabel(value: number): {
  label: string;
  tone: "low" | "mid" | "high" | "critical";
} {
  if (value < 25) return { label: "Stable", tone: "low" };
  if (value < 55) return { label: "Pressurized", tone: "mid" };
  if (value < 80) return { label: "Volatile", tone: "high" };
  return { label: "Critical", tone: "critical" };
}
