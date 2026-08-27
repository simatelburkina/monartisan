import {
  Wrench,
  Zap,
  Building2,
  PaintRoller,
  Hammer,
  Flame,
  Snowflake,
  WashingMachine,
  Car,
  Shirt,
  Scissors,
  Sparkles,
  Sprout,
  Laptop,
  Settings,
  Truck,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  plomberie: Wrench,
  electricite: Zap,
  maconnerie: Building2,
  peinture: PaintRoller,
  menuiserie: Hammer,
  soudure: Flame,
  climatisation: Snowflake,
  "reparation-electromenager": WashingMachine,
  mecanique: Car,
  couture: Shirt,
  coiffure: Scissors,
  nettoyage: Sparkles,
  jardinage: Sprout,
  informatique: Laptop,
  "installation-maintenance": Settings,
  transport: Truck,
  "autres-services": Boxes,
};

export function CategoryIcon({ slug, className, size = 24 }: { slug: string; className?: string; size?: number }) {
  const Icon = CATEGORY_ICONS[slug] || Wrench;
  return <Icon size={size} strokeWidth={1.75} className={className} />;
}
