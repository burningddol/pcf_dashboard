"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/activities", label: "활동 데이터" },
];

export default function NavDrawer() {
  const pathname = usePathname();

  return (
    <nav className="w-[200px] shrink-0 h-screen border-r border-[color:var(--line)] bg-[color:var(--bg)] px-3 py-6 flex flex-col gap-1">
      <p className="text-[length:var(--t-sm)] font-semibold text-[color:var(--fg)] px-2 mb-4 tracking-[-0.01em]">
        HanaLoop PCF
      </p>
      <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center h-8 rounded-[var(--r-2)] px-2.5 text-[length:var(--t-sm)] no-underline transition-[background,color] duration-[120ms]",
                  active
                    ? "font-medium text-[color:var(--fg)] bg-[color:var(--bg-2)]"
                    : "font-normal text-[color:var(--fg-3)] bg-transparent"
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
