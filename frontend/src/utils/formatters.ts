import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "EEE, MMM d · h:mm a");
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "MMM d");
}

export function timeUntil(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

export function scoreColor(score: number): string {
  if (score < 30) return "text-red-500";
  if (score < 65) return "text-yellow-500";
  return "text-green-500";
}

export function scoreBg(score: number): string {
  if (score < 30) return "bg-red-500";
  if (score < 65) return "bg-yellow-500";
  return "bg-green-500";
}

export function scoreLabel(score: number): string {
  if (score < 30) return "Buy Now";
  if (score < 65) return "Neutral";
  return "Wait";
}

export function magnitudeLabel(mag: string): string {
  const map: Record<string, string> = {
    preseason: "Pre-Season",
    regular: "Regular Season",
    postseason: "Playoffs",
    championship: "Championship",
  };
  return map[mag] || mag;
}

export function magnitudeBadgeClass(mag: string): string {
  const map: Record<string, string> = {
    preseason: "bg-slate-600 text-slate-200",
    regular: "bg-blue-900 text-blue-200",
    postseason: "bg-orange-900 text-orange-200",
    championship: "bg-yellow-700 text-yellow-100",
  };
  return map[mag] || "bg-slate-600 text-slate-200";
}
