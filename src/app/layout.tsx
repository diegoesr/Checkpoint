import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Checkpoint",
  description:
    "Registra lo que juegas, guarda favoritos y comparte con amigos. La red social para gamers.",
  icons: {
    icon: [{ url: "/assets/icons/checkpoint.png", type: "image/png" }],
    apple: "/assets/icons/checkpoint.png",
    shortcut: "/assets/icons/checkpoint.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
