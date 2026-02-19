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
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled && "bg-white/95 shadow-sm backdrop-blur-sm"
      )}
    >
      <nav className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full p-1 transition-all",
              useDarkText ? "bg-transparent" : "bg-white/95 shadow-sm"
            )}
          >
            <Image
              src="/images/Logo-Mamatulia-final.png"
              alt="Mama Tulia"
              width={44}
              height={44}
              className="h-11 w-11"
              priority
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                useDarkText
                  ? "text-foreground/80 hover:text-foreground"
                  : "text-white/90 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="rounded-full px-6">
            <a href={EXTERNAL_LINKS.DONATE} target="_blank" rel="noopener noreferrer">Donate</a>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden",
            useDarkText ? "text-foreground" : "text-white"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      <div
        className={cn(
          "absolute left-0 right-0 top-20 bg-white shadow-lg md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-3 text-base font-small text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild className="mt-4 w-full rounded-full">
            <a href={EXTERNAL_LINKS.DONATE} target="_blank" rel="noopener noreferrer">Donate</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
