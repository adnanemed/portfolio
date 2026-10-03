import type { Metadata } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "StackLab — Dashboard",
  description: "Pilotage du portfolio StackLab",
};

// Fonts — same pairing as the public site: Archivo (400-700) for UI +
// Instrument Serif italic for accent words. Self-hosted by next/font.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

// Anti-flash theme script: apply persisted theme before paint.
const themeScript = `(function(){try{var t=localStorage.getItem("stacklab-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-theme="light"
      suppressHydrationWarning
      className={`${archivo.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
