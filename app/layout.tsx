import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "OnlyMatt Points - Boutique",
  description: "Achetez des points pour accéder à vos projets favoris",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased flex flex-col min-h-screen">
        <div className="flex-1">
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
