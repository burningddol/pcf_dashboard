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
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        height: "100vh",
        borderRight: "1px solid var(--line)",
        background: "var(--bg)",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <p
        style={{
          fontSize: "var(--t-sm)",
          fontWeight: 600,
          color: "var(--fg)",
          padding: "0 8px",
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        HanaLoop PCF
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                height: 32,
                borderRadius: "var(--r-2)",
                padding: "0 10px",
                fontSize: "var(--t-sm)",
                fontWeight: pathname === href ? 500 : 400,
                color: pathname === href ? "var(--fg)" : "var(--fg-3)",
                background: pathname === href ? "var(--bg-2)" : "transparent",
                textDecoration: "none",
                transition: "background .12s, color .12s",
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
