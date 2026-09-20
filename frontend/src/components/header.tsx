"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState, useSyncExternalStore } from "react";
import { History, Menu, Moon, Sun, X } from "lucide-react";
import { GithubIcon } from "~/components/icons/github";

const subscribe = () => () => {};
function useHasMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const REPO = "https://github.com/muneebkhan08/Capite";

const NAV_LINKS = [
  { href: "/", label: "Home", external: false },
  { href: "/history", label: "History", external: false },
  { href: REPO, label: "GitHub", external: true },
];

/** Capite logo mark */
function CaptionMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-oat-950 p-1 shadow-sm ring-1 ring-line ${className}`}
    >
      <img src="/logo.svg" alt="Capite Logo" className="h-full w-full object-contain" />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useHasMounted();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render the main navigation header on the caption studio / result page
  // so the studio top navbar (sub-header) has full view and no double-header collision.
  if (pathname?.startsWith("/captions/")) {
    return null;
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        isScrolled
          ? "border-b border-line bg-canvas/80 shadow-sm backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-canvas"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between gap-6 px-6">
        {/* Logo lockup */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg outline-none"
          aria-label="Capite — home"
        >
          <CaptionMark className="transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex items-center gap-1.5 text-[16px] leading-none font-semibold tracking-[-0.02em] text-ink">
            Capite
            <span className="rounded-full bg-brand-wash px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand">
              AI Studio
            </span>
          </span>
        </Link>

        {/* Segmented desktop navigation — the active route reads as a
            raised pill rather than a colour change alone. */}
        <div className="hidden items-center gap-1 rounded-full border border-line bg-surface-2 p-1 md:flex">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-subtle transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-surface text-ink shadow-xs"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Toggle dark mode"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>

          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink md:grid"
            aria-label="GitHub repository"
          >
            <GithubIcon className="h-[18px] w-[18px]" />
          </a>

          <span className="mx-1 hidden h-5 w-px bg-line md:block" />

          <Link
            href="/history"
            className="btn-brand hidden cursor-pointer items-center gap-1.5 px-4 py-2 text-[13px] md:inline-flex"
          >
            <History className="h-[15px] w-[15px]" />
            History
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-line bg-canvas/95 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <GithubIcon className="h-4 w-4" />
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-brand-wash text-brand"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
