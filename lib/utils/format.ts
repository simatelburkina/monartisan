export function formatFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(date)
  );
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "min"],
    [24, "h"],
    [30, "j"],
    [12, "mois"],
    [Number.POSITIVE_INFINITY, "an"],
  ];
  let value = seconds;
  let label = "s";
  for (const [step, unit] of units) {
    if (value < step) {
      label = unit;
      break;
    }
    value = Math.floor(value / step);
    label = unit;
  }
  if (seconds < 60) return "à l'instant";
  return `il y a ${value} ${label}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const STATUS_LABELS: Record<string, string> = {
  published: "Demande publiée",
  proposals_received: "Proposition reçue",
  quote_accepted: "Devis accepté",
  scheduled: "Prestation programmée",
  artisan_en_route: "Artisan en route",
  in_progress: "Prestation en cours",
  completed: "Prestation terminée",
  paid: "Paiement effectué",
  closed: "Prestation clôturée",
  cancelled: "Annulée",
  disputed: "En litige",
};

export const URGENCY_LABELS: Record<string, string> = {
  low: "Pas urgent",
  normal: "Normal",
  high: "Urgent",
  urgent: "Très urgent",
};
