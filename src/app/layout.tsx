import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Корпоративные опросы",
  description: "Сервис корпоративных опросов с балльной оценкой",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
