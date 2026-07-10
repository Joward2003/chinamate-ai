import Link from "next/link";
import {
  AppWindow,
  ChevronRight,
  CircleDollarSign,
  Landmark,
  MessageCircle,
  Smartphone,
  TrainFront,
  UtensilsCrossed,
  CarFront,
  type LucideIcon,
} from "lucide-react";
import type { PickerOption } from "@/data/helpCards";

const iconMap: Record<PickerOption["icon"], LucideIcon> = {
  payment: CircleDollarSign,
  taxi: CarFront,
  food: UtensilsCrossed,
  metro: TrainFront,
  attraction: Landmark,
  app: Smartphone,
  person: MessageCircle,
};

export function ProblemList({ options }: { options: PickerOption[] }) {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const Icon = iconMap[option.icon] ?? AppWindow;
        return (
          <Link
            key={option.label}
            href={option.destination}
            className="group flex min-h-[82px] items-center gap-4 rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-moss/20"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ef] text-moss">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold tracking-[-0.02em]">{option.label}</span>
              <span className="mt-1 block text-sm text-ink/55">{option.description}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-ink/30 transition group-hover:translate-x-1 group-hover:text-moss" />
          </Link>
        );
      })}
    </div>
  );
}
