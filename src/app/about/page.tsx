import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAboutPage } from "@/services/contentful";
import { generateMetadata as genMeta } from "@/lib/seo/metadata";
import type { AboutPage } from "@/types/contentful";
import { CTABanner, ImpactStat } from "@/components/brand";
import { FadeIn } from "@/components/ui/fade-in";
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
      <section className="relative min-h-[70vh] bg-[var(--brand-ink)] pt-20">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={page.pageTitle}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-ink)] via-[var(--brand-ink-soft)] to-[var(--brand-ink-soft)]/60" />
        )}
        <div className="container relative z-10 mx-auto flex min-h-[70vh] flex-col justify-end px-4 pb-16 pt-32 md:justify-center md:pb-0 md:pt-20">
          <div className="max-w-xl">
            <FadeIn delay={0.1} direction="up">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                Our Story
              </p>
            </FadeIn>
            <FadeIn delay={0.2} direction="up">
              <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] text-white md:text-6xl">
                {page.pageTitle}
              </h1>
            </FadeIn>
            {page.heroSubtitle && (
              <FadeIn delay={0.35} direction="up">
                <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
                  {page.heroSubtitle}
                </p>
              </FadeIn>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 0.1} direction="up">
                  <ImpactStat value={stat.value!} label={stat.label!} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
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
          </FadeIn>
        </div>
      </section>

      {/* Vision Section */}
      {page.visionText && (
        <section className="bg-[var(--brand-beige)] py-16 md:py-24">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
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
            </FadeIn>
          </div>
        </section>
      )}

      {/* Values Section */}
      {page.valuesText && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <FadeIn direction="up">
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
            </FadeIn>
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
            {[
              { icon: Heart, title: "Hospital Visits", text: "Supporting mothers in neonatal units with supplies and encouragement." },
              { icon: Home, title: "Home Visits", text: "Continuing care after discharge with guidance and resources." },
              { icon: Users, title: "Discipleship", text: "Nurturing spiritual growth through Bible study and mentorship." },
              { icon: Baby, title: "Outreaches", text: "Community events and awareness campaigns across Uganda." },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1} direction="up">
                <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                </div>
              </FadeIn>
            ))}
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
