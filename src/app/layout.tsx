import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFe System",
  description: "Sistema de Notas Fiscais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white`}>
        <div className="flex min-h-screen bg-white">
          <Sidebar />
          <main className="flex-1 p-8 bg-white">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
} 