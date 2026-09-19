import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahyogi — Your digital teammate",
  description: "A continuity workspace for teams and their AI counterparts."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
