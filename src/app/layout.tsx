import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = { title: "Blackjack", description: "Simulador de Blackjack" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}