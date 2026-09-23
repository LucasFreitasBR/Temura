import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Temura — Presença que move.",
  description:
    "Sites e landing pages, tráfego pago e produção audiovisual. A Temura conecta estratégia, design e conteúdo para colocar sua marca em movimento.",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
