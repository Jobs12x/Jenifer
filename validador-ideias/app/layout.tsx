import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Validador de Ideias",
  description: "Valide ideias de negócio com Design Thinking, Lean Startup e dados sintéticos gerados por IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
