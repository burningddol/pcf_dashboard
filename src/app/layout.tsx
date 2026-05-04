import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HanaLoop PCF 대시보드",
  description: "제품 탄소 발자국(PCF) 시각화 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="pcf">{children}</body>
    </html>
  );
}
