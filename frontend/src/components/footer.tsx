"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "~/components/icons/github";
import { LinkedinIcon } from "~/components/icons/linkedin";

const REPO = "https://github.com/muneebkhan08/Capite";
const LINKEDIN = "https://www.linkedin.com/in/muhammadmuneebkhan8304/";
const EMAIL = "muneebkhan08304@gmail.com";

const COLUMNS: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Generate captions", href: "/" },
      { label: "Caption history", href: "/history" },
      { label: "Self-host guide", href: `${REPO}#quick-start`, external: true },
      { label: "API reference", href: `${REPO}/blob/main/docs/API.md`, external: true },
    ],
  },
  {
    title: "Open Source",
    links: [
      { label: "Repository", href: REPO, external: true },
      { label: "Architecture", href: `${REPO}/blob/main/ARCHITECTURE.md`, external: true },
      { label: "Contributing", href: `${REPO}/blob/main/CONTRIBUTING.md`, external: true },
      { label: "Report an issue", href: `${REPO}/issues`, external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: LINKEDIN, external: true },
      { label: "GitHub (@muneebkhan08)", href: "https://github.com/muneebkhan08", external: true },
      { label: "Email Support", href: `mailto:${EMAIL}`, external: true },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/captions/")) {
    return null;
  }

  return (
    <footer className="bg-grain relative overflow-hidden bg-oat-950 text-oat-300">
      {/* A single moss bloom keeps the dark slab from reading as a black box */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/4 h-80 w-[40rem] rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, #3e8968, transparent 70%)" }}
      />

      <div className="relative z-10 container mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:gap-x-12">
          {/* Brand block */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-oat-900 p-1 shadow-sm ring-1 ring-oat-800">
                <img src="/logo.svg" alt="Capite Logo" className="h-full w-full object-contain" />
              </span>
              <span className="flex items-center gap-1.5 text-[16px] leading-none font-semibold tracking-[-0.02em] text-oat-50">
                Capite
                <span className="rounded-full bg-brand/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent-lime">
                  Studio
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-[26ch] text-sm leading-relaxed text-oat-500">
              Animated subtitles for any video. Self-hosted, private, and{" "}
              <span className="text-editorial text-[1.05em] text-oat-300">
                genuinely free
              </span>
              .
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <a
                href={REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-oat-900 bg-oat-900/60 text-oat-400 transition-colors hover:border-brand hover:bg-brand hover:text-white"
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-oat-900 bg-oat-900/60 text-oat-400 transition-colors hover:border-[#0077B5] hover:bg-[#0077B5] hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-oat-900 bg-oat-900/60 text-oat-400 transition-colors hover:border-brand hover:bg-brand hover:text-white"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-eyebrow mb-5 text-oat-600">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm text-oat-400 transition-colors hover:text-oat-50"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-oat-400 transition-colors hover:text-oat-50"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-oat-900 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-oat-600">
            &copy; {currentYear} Capite. Built by{" "}
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-oat-400 underline-offset-4 hover:text-brand hover:underline"
            >
              Muhammad Muneeb Khan
            </a>
            .
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="chip border-oat-900 bg-oat-900/70 text-oat-400">
              MIT Licence
            </span>
            <a
              href={`mailto:${EMAIL}`}
              className="text-xs text-oat-500 hover:text-oat-300"
            >
              {EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
