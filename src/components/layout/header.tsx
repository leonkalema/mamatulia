"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EXTERNAL_LINKS } from "@/constants/links";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Stories", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

const DARK_HERO_ROUTES: readonly string[] = ["/", "/news", "/about", "/programs", "/contact"];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const hasDarkHero: boolean = DARK_HERO_ROUTES.includes(pathname) || pathname.startsWith("/programs/");
  const useDarkText: boolean = scrolled || !hasDarkHero;

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-[var(--duration-normal)]",
        scrolled && "bg-[var(--brand-surface)]/96 backdrop-blur-sm border-b border-[var(--brand-rule)]"
      )}
    >
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/mama.png"
            alt="Mama Tulia"
            width={56}
            height={56}
            className="h-14 w-14"
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative text-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:transition-all after:duration-[var(--duration-normal)] hover:after:w-full",
                useDarkText
                  ? "text-foreground/70 hover:text-foreground after:bg-foreground"
                  : "text-white/80 hover:text-white after:bg-white"
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={EXTERNAL_LINKS.DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "border px-5 py-2 text-sm font-medium transition-colors",
              useDarkText
                ? "border-foreground/20 text-foreground hover:border-foreground/50 hover:bg-foreground hover:text-background"
                : "border-white/40 text-white hover:border-white hover:bg-white hover:text-foreground"
            )}
          >
            Donate
          </a>
        </div>

        <button
          type="button"
          className={cn(
            "md:hidden p-2 transition-colors",
            useDarkText ? "text-foreground" : "text-white"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "absolute left-0 right-0 top-20 border-b border-[var(--brand-rule)] bg-[var(--brand-surface)] md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="px-6 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block border-b border-[var(--brand-rule)] py-4 text-base text-foreground/70 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={EXTERNAL_LINKS.DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block border border-foreground/20 px-5 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Donate
          </a>
        </div>
      </div>
    </header>
  );
}
