"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/activities", label: "활동 데이터" },
];

export default function NavDrawer() {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-52 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-6">
      <p className="mb-8 text-sm font-semibold tracking-tight text-zinc-900">
        HanaLoop PCF
      </p>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex h-9 items-center rounded-md px-3 text-sm transition-colors ${
                pathname === href
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
