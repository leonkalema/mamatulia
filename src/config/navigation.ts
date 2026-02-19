import type { NavItem, SocialLink } from "@/types";

export const mainNavigation: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "What We Do",
    href: "/what-we-do",
    children: [
      { label: "Outreaches", href: "/what-we-do/outreaches" },
      { label: "Discipleship Program", href: "/what-we-do/discipleship" },
      { label: "Preemie Kit", href: "/what-we-do/preemie-kit" },
    ],
  },
  {
    label: "Get Involved",
    href: "/get-involved",
    children: [
      { label: "Donate", href: "/get-involved/donate" },
      { label: "Volunteer", href: "/get-involved/volunteer" },
      { label: "Partner", href: "/get-involved/partner" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Team", href: "/team" },
  { label: "Contact", href: "/contact" },
] as const;

export const socialLinks: readonly SocialLink[] = [
  { platform: "facebook", url: "https://facebook.com/mamatulia" },
  { platform: "instagram", url: "https://instagram.com/mamatulia" },
  { platform: "youtube", url: "https://youtube.com/@mamatulia" },
] as const;
