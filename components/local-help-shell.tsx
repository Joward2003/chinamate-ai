"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, Navigation, UserRound, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/help", label: "Help", icon: UsersRound },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function LocalHelpShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper pb-24 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-black/[0.07] bg-paper/92 backdrop-blur-xl">
        <div className="page-shell flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ChinaMate home">
            <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-moss text-white">
              <Navigation className="h-4 w-4 rotate-45 fill-current" />
            </span>
            <span className="text-lg font-bold tracking-[-0.03em]">ChinaMate</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active ? "bg-ink text-white" : "text-ink/58 hover:bg-black/5 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/help/chinese"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-moss shadow-sm transition hover:border-moss/30"
          >
            中文 Help
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.08] bg-white/96 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/help"
                  ? pathname.startsWith("/help") || pathname.startsWith("/card") || pathname.startsWith("/phrase")
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-semibold",
                  active ? "text-moss" : "text-ink/45",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-moss/10")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
