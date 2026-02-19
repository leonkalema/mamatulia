import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAboutPage } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { AboutPage } from "@/types/contentful";
import { CTABanner, ImpactStat } from "@/components/brand";
import { EXTERNAL_LINKS } from "@/constants/links";
import { Heart, Users, Home, Baby } from "lucide-react";

export const revalidate = 60;

const getImageUrl = (asset: unknown): string | null => {
  if (!asset || typeof asset !== "object") return null;
  const assetObj = asset as Record<string, unknown>;
  const fields = assetObj.fields as Record<string, unknown> | undefined;
  if (fields && typeof fields === "object") {
    const file = fields.file as Record<string, unknown> | undefined;
    if (file && typeof file.url === "string") {
      return file.url.startsWith("//") ? `https:${file.url}` : file.url;
    }
  }
  return null;
};

export async function generateMetadata(): Promise<Metadata> {
  const response = await getAboutPage();
  if (response.error || !response.data) {
    return genMeta({
      title: "About Us",
      description: "Learn about Mama Tulia Ministries.",
      canonical: "/about",
    });
  }
  const page = response.data;
  return genMeta({
    title: page.pageTitle || "About Us",
    description: page.heroSubtitle || page.missionText?.slice(0, 160) || "Learn about Mama Tulia Ministries.",
    canonical: "/about",
  });
}

export default async function AboutPage() {
  const response = await getAboutPage();

  if (response.error || !response.data) {
    notFound();
  }

  const page: AboutPage = response.data;
  const heroImageUrl = getImageUrl(page.heroImage);
  const missionImageUrl =
    getImageUrl(page.missionImage) ||
    "https://images.ctfassets.net/ld5lxu1wipv6/wpMedia-2416/1f24559e31ebb0432e129a604a01046a/IMG_4143-scaled.jpg";
  
  const stats = [
    { value: page.stat1Value, label: page.stat1Label },
    { value: page.stat2Value, label: page.stat2Label },
    { value: page.stat3Value, label: page.stat3Label },
    { value: page.stat4Value, label: page.stat4Label },
  ].filter((s) => s.value && s.label);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[60vh] bg-[var(--brand-earth)] pt-20">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={page.pageTitle}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 z-0 bg-black/50" />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--brand-earth-dark)] via-[var(--brand-earth)] to-[var(--brand-tan)]/30" />
        )}
        <div className="container relative z-10 mx-auto flex min-h-[60vh] flex-col justify-center px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-white/70">
            Our Story
          </p>
          <h1 className="mt-2 max-w-2xl font-serif text-4xl font-normal leading-tight text-white md:text-5xl lg:text-6xl">
            {page.pageTitle}
          </h1>
          {page.heroSubtitle && (
            <p className="mt-6 max-w-xl text-lg text-white/80">
              {page.heroSubtitle}
            </p>
          )}
        </div>
        {/* Curved divider */}
        <div className="absolute -bottom-px left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" className="block w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 30C1200 50 960 60 720 60C480 60 240 50 0 30L0 60Z" fill="var(--secondary)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <ImpactStat key={stat.label} value={stat.value!} label={stat.label!} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--brand-tan)]">
              <Image
                src={missionImageUrl}
                alt="Mama Tulia team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Our Mission
              </p>
              {page.missionTitle && (
                <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
                  {page.missionTitle}
                </h2>
              )}
              {page.missionText && (
                <div className="mt-6 space-y-4 text-muted-foreground">
                  {page.missionText.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      {page.visionText && (
        <section className="bg-[var(--brand-beige)] py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Our Vision
              </p>
              {page.visionTitle && (
                <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
                  {page.visionTitle}
                </h2>
              )}
              <p className="mt-6 text-lg text-muted-foreground">
                {page.visionText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Values Section */}
      {page.valuesText && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                Our Values
              </p>
              {page.valuesTitle && (
                <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
                  {page.valuesTitle}
                </h2>
              )}
              <p className="mt-6 text-lg text-muted-foreground">
                {page.valuesText}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* What We Do */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              What We Do
            </p>
            <h2 className="mt-2 font-serif text-3xl font-normal md:text-4xl">
              Our Core Programs
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Hospital Visits</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Supporting mothers in neonatal units with supplies and encouragement.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Home className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Home Visits</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Continuing care after discharge with guidance and resources.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Discipleship</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nurturing spiritual growth through Bible study and mentorship.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Baby className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">Outreaches</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Community events and awareness campaigns across Uganda.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <CTABanner
        title={page.ctaTitle || "Join Our Mission"}
        description={page.ctaDescription || "Partner with us to support more preemie mothers and save more lives."}
        primaryButton={{ text: "Donate Now", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Contact Us", href: "/contact" }}
        variant="warm"
      />
    </>
  );
}
