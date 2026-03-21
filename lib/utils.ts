import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasEnvVars =
  supabaseUrl &&
  supabasePublishableKey;

export function formatDate(value: string | Date, pattern = "dd MMM yyyy") {
  return format(new Date(value), pattern);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatMood(value: number) {
  return value.toFixed(1);
}

export function getMoodLabel(score: number) {
  if (score >= 4.5) return "Muy positivo";
  if (score >= 3.5) return "Estable";
  if (score >= 2.5) return "Atención";
  return "Crítico";
}

export function getMoodColor(score: number) {
  if (score >= 4) return "emerald";
  if (score >= 3) return "amber";
  return "rose";
}
