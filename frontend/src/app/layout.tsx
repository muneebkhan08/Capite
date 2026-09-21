import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "~/components/theme-provider";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { publicSiteUrl, repositoryUrl } from "~/lib/site";
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
    default: "Capite — Free, Self-Hosted AI Video Caption Generator",
    template: "%s · Capite",
  },
  description:
    "Free, open-source AI video caption generator. Create editable, animated subtitles with local faster-whisper transcription, 27 motion styles, and MP4/SRT/VTT/ASS exports.",
  metadataBase: publicSiteUrl,
  applicationName: "Capite",
  authors: [{ name: "Muhammad Muneeb Khan", url: repositoryUrl }],
  creator: "Muhammad Muneeb Khan",
  publisher: "Capite",
  category: "Video editing",
  keywords: [
    "Capite",
    "AI video caption generator",
    "open source caption generator",
    "self hosted subtitle generator",
    "animated captions",
    "subtitle generator",
    "faster-whisper",
    "Submagic alternative",
    "CapCut auto captions alternative",
    "video subtitles",
  ],
  alternates: publicSiteUrl ? { canonical: "/" } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Capite — Free, Self-Hosted AI Video Caption Generator",
    description:
      "Create editable, animated captions locally with faster-whisper, 27 motion styles, and standard subtitle exports.",
    type: "website",
    siteName: "Capite",
    ...(publicSiteUrl
      ? {
          url: publicSiteUrl.toString(),
          images: [
            {
              url: "/logo.png",
              width: 1024,
              height: 1024,
              alt: "Capite — open-source AI video caption generator",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Capite — Free, Self-Hosted AI Video Caption Generator",
    description:
      "Open-source animated captions with local faster-whisper transcription and editable word timing.",
    ...(publicSiteUrl ? { images: ["/logo.png"] } : {}),
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
