import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { socialLinks } from "@/config/navigation";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: null,
  linkedin: null,
} as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-playfair text-lg font-bold">Mama Tulia Ministries</h3>
            <p className="text-sm text-muted-foreground">
              Supporting preemie mothers and families through education, outreach, and care.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/what-we-do" className="text-muted-foreground hover:text-foreground">What We Do</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-foreground">News</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/get-involved/donate" className="text-muted-foreground hover:text-foreground">Donate</Link></li>
              <li><Link href="/get-involved/volunteer" className="text-muted-foreground hover:text-foreground">Volunteer</Link></li>
              <li><Link href="/get-involved/partner" className="text-muted-foreground hover:text-foreground">Partner With Us</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.platform];
                if (!Icon) return null;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={link.platform}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Mama Tulia Ministries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
