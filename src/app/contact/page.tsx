import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";
import { EXTERNAL_LINKS } from "@/constants/links";
import { getSiteSettings } from "@/services/contentful";
import type { SiteSettings, SocialLink } from "@/types/contentful";

export const revalidate = 60;

export const metadata: Metadata = genMeta({
  title: "Contact Us",
  description: "Get in touch with Mama Tulia Ministries. We'd love to hear from you and answer any questions about our programs supporting preemie mothers.",
  canonical: "/contact",
});

const FALLBACK_CONTACT = {
  email: "mamatuliaug@gmail.com",
  phone: "+(256) 751 847 461",
  phone2: "+(256) 776 627 952",
  address: "P.O BOX 37463, Kampala, Uganda",
} as const;

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
} as const;

export default async function ContactPage() {
  const response = await getSiteSettings();
  const settings: SiteSettings | null = response.data;
  const email: string = settings?.email || FALLBACK_CONTACT.email;
  const phone: string = settings?.phone || FALLBACK_CONTACT.phone;
  const address: string = settings?.address || FALLBACK_CONTACT.address;
  const socialLinks: readonly SocialLink[] = settings?.socialLinks || [];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] bg-[var(--brand-earth)] pt-20">
        <Image
          src="https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-2189/36bb7122ca6eb653f2c07267046cfdd5/IMG_20180918_174706_4-scaled.jpg"
          alt="Contact Us"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="container relative z-10 mx-auto flex min-h-[50vh] flex-col justify-center px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            Get in Touch
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            We&apos;d love to hear from you. Reach out with questions, partnership inquiries, or to learn more about supporting our mission.
          </p>
        </div>
        <div className="absolute -bottom-px left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" className="block w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 30C1200 50 960 60 720 60C480 60 240 50 0 30L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-normal md:text-3xl">Get in Touch</h2>
              <p className="mt-4 text-muted-foreground">
                Whether you want to volunteer, donate, or simply learn more about our work with preemie mothers and their families, we&apos;re here to help.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <a
                      href={`mailto:${email}`}
                      className="text-lg font-medium text-foreground transition hover:text-primary"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Call Us</p>
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                      className="text-lg font-medium text-foreground transition hover:text-primary"
                    >
                      {phone}
                    </a>
                    {!settings?.phone && (
                      <a
                        href={`tel:${FALLBACK_CONTACT.phone2.replace(/[^+\d]/g, "")}`}
                        className="mt-1 block text-lg font-medium text-foreground transition hover:text-primary"
                      >
                        {FALLBACK_CONTACT.phone2}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mailing Address</p>
                    <p className="text-lg font-medium">{address}</p>
                  </div>
                </div>
              </div>

              {socialLinks.length > 0 && (
                <div className="mt-10">
                  <p className="text-sm font-medium text-muted-foreground">Follow Us</p>
                  <div className="mt-3 flex gap-3">
                    {socialLinks.map((social) => {
                      const Icon = SOCIAL_ICONS[social.platform] || Facebook;
                      return (
                        <a
                          key={social.platform}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition hover:bg-primary hover:text-white"
                          aria-label={social.platform}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-normal">Send a Message</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </p>

              <form className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="mt-2 w-full rounded-lg border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="volunteer">Volunteer Opportunities</option>
                    <option value="donate">Donation Questions</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="media">Media & Press</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="mt-2 w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full rounded-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#8b7355] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-normal text-white md:text-3xl">
            Ready to Make a Difference?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            Your support helps us continue our mission of empowering preemie mothers and saving lives.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-white px-8 text-foreground hover:bg-white/90">
              <a href={EXTERNAL_LINKS.DONATE} target="_blank" rel="noopener noreferrer">
                Donate Now
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white px-8 text-white hover:bg-white hover:text-foreground"
            >
              <Link href="/get-involved">Get Involved</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
