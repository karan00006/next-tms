import type { Metadata, Viewport } from "next";
import { Sora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notes Vault",
  description: "Secure notes and admin dashboard migrated from PHP to Next.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${sora.variable} ${spaceGrotesk.variable}`}>
      <body>
        <div className="app-content">{children}</div>
        <footer className="app-footer" role="contentinfo">
          <div className="app-footer-inner">
            <p>Notes Vault</p>
            <small>Made by KARAN © {year}</small>
          </div>
        </footer>
      </body>
    </html>
  );
}
