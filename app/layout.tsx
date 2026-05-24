import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pour Me A Drink — Obi",
  description: "New single by Obi. Out June 12.",
  openGraph: {
    title: "Pour Me A Drink — Obi",
    description: "New single by Obi. Out June 12.",
    url: "https://pourmeadrink.com",
    siteName: "Pour Me A Drink",
    images: [{ url: "/images/cover.jpg", width: 1200, height: 1200 }],
    type: "music.song",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pour Me A Drink — Obi",
    images: ["/images/cover.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
