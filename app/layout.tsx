import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Strategic Tension Engine",
  description:
    "AI-native strategic tension platform — multiplayer negotiation, evolving constraints, and reflection.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-[100dvh] min-h-screen touch-manipulation antialiased pb-[max(0px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-none fixed inset-0 -z-10 grid-backdrop" />
        <div className="pointer-events-none fixed inset-0 -z-10 noise" />
        {children}
      </body>
    </html>
  );
}
