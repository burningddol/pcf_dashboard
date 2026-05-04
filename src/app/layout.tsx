import type { Metadata } from "next";
import "./globals.css";
import NavDrawer from "@/components/dashboard/NavDrawer";

export const metadata: Metadata = {
  title: "HanaLoop PCF 대시보드",
  description: "제품 탄소 발자국(PCF) 시각화 대시보드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="pcf flex h-screen" style={{ background: "var(--bg)" }}>
        <NavDrawer />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
