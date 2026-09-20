import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/theme-provider";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import "./globals.css";

/* Plus Jakarta Sans carries the whole interface: geometric enough to
   feel like a tool, humanist enough to stay warm at small sizes. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/* Instrument Serif appears on single words only — an editorial
   counterpoint against all that geometry. */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Mono is reserved for eyebrows, timecodes and numeric readouts. */
const mono = JetBrains_Mono({
  variable: "--font-mono-ui",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Capite — AI Video Captions & Motion Subtitles Studio",
    template: "%s · Capite",
  },
  description:
    "Capite: Add trending animated captions to any video. 27 motion styles, interactive transcript editor, word-level timing, 100+ languages. Free, open-source and self-hosted.",
  keywords: [
    "Capite",
    "ai captions",
    "video subtitles",
    "animated captions",
    "subtitle generator",
    "whisper transcription",
    "open source caption studio",
    "faster-whisper",
  ],
  openGraph: {
    title: "Capite — AI Video Captions & Motion Subtitles Studio",
    description:
      "Capite: 27 motion styles, interactive transcript editor, word-level timing, 100+ languages. Free, open-source and self-hosted.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${instrument.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-canvas">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            richColors
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-jakarta)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
