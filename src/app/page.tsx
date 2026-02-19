import Link from "next/link";
import Image from "next/image";
import { Heart, BookOpen, Home as HomeIcon, HandHeart, Briefcase } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EXTERNAL_LINKS } from "@/constants/links";
import { ImpactStat, ProgramCard, DonationModule, CTABanner } from "@/components/brand";
import { getWpArticles, getMamatuliaPrograms, getMamatuliaPartners, getHomepageHero } from "@/services/contentful";
import { StoryCard } from "@/components/brand/story-card";
import type { WpArticle, MamatuliaProgram, MamatuliaPartner, HomepageHero } from "@/types/contentful";

const impactStats = [
  { value: "31,200+", label: "Home visits & outreaches" },
  { value: "1,600", label: "Preemie kits distributed" },
  { value: "11,500", label: "Mothers supported" },
  { value: "6,450", label: "Trainings delivered" },
] as const;

const PROGRAM_ICONS: Record<string, LucideIcon> = {
  "hospital-visits": Heart,
  "home-visits": HomeIcon,
  "discipleship-program": BookOpen,
  "economic-development": Briefcase,
  "outreaches": HandHeart,
};

const CARD_COLORS = [
  "bg-[var(--brand-ink-soft)]",
  "bg-[var(--brand-ink)]",
  "bg-[var(--brand-accent)]",
] as const;

const getAssetUrl = (asset: unknown): string | null => {
  if (!asset || typeof asset !== "object") return null;
  const fields = (asset as Record<string, unknown>).fields as Record<string, unknown> | undefined;
  if (fields && typeof fields === "object") {
    const file = fields.file as Record<string, unknown> | undefined;
    if (file && typeof file.url === "string") {
      return file.url.startsWith("//") ? `https:${file.url}` : file.url;
    }
  }
  return null;
};


const getImageUrl = (article: WpArticle): string | null => {
  const asset = article.featuredImage as unknown;
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

const getExcerpt = (article: WpArticle): string => {
  const raw: string = article.excerptHtml || article.bodyHtml || "";
  const text: string = raw.replace(/<[^>]*>/g, "").trim();
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
};

export default async function Home() {
  const [storiesResponse, programsResponse, partnersResponse, heroResponse] = await Promise.all([
    getWpArticles({ limit: 3 }),
    getMamatuliaPrograms(),
    getMamatuliaPartners(),
    getHomepageHero(),
  ]);
  const stories: readonly WpArticle[] = storiesResponse.data?.items || [];
  const featuredStory: WpArticle | undefined = stories[0];
  const corePrograms: readonly MamatuliaProgram[] = (programsResponse.data?.items || [])
    .filter((p) => p.category === "Core Program")
    .slice(0, 3);
  const partners: readonly MamatuliaPartner[] = partnersResponse.data || [];
  const hero: HomepageHero | null = heroResponse.data;
  const heroImageUrl = getAssetUrl(hero?.heroImage);
  const isExternalUrl = (url: string): boolean => url.startsWith("http");

  return (
    <>
      {/* Hero — editorial: image fills viewport, type panel overlaps from left */}
      <section className="relative min-h-screen bg-[var(--brand-ink)]">
        {heroImageUrl ? (
          <>
            <Image
              src={heroImageUrl}
              alt={hero?.headline || ""}
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
        <div className="container relative z-10 mx-auto flex min-h-screen flex-col justify-end px-4 pb-20 pt-32 md:justify-center md:pb-0 md:pt-20">
          <div className="max-w-xl">
            {hero?.tagline && (
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                {hero.tagline}
              </p>
            )}
            <h1 className="mt-5 font-serif text-5xl font-light leading-[1.08] text-white md:text-6xl lg:text-7xl">
              {hero?.headline || "Every preemie deserves a fighting chance"}
            </h1>
            {hero?.subtext && (
              <p className="mt-6 max-w-sm text-base leading-relaxed text-white/60">
                {hero.subtext}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-8">
              {/* Primary CTA — Contentful or fallback to Donate */}
              {hero?.primaryButtonText && hero.primaryButtonUrl ? (
                isExternalUrl(hero.primaryButtonUrl) ? (
                  <a
                    href={hero.primaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-b-2 border-white pb-0.5 text-base font-medium text-white transition-colors hover:border-white/50 hover:text-white/70"
                  >
                    {hero.primaryButtonText}
                  </a>
                ) : (
                  <Link
                    href={hero.primaryButtonUrl}
                    className="border-b-2 border-white pb-0.5 text-base font-medium text-white transition-colors hover:border-white/50 hover:text-white/70"
                  >
                    {hero.primaryButtonText}
                  </Link>
                )
              ) : (
                <a
                  href={EXTERNAL_LINKS.DONATE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b-2 border-white pb-0.5 text-base font-medium text-white transition-colors hover:border-white/50 hover:text-white/70"
                >
                  Give a Preemie Kit
                </a>
              )}
              {/* Secondary CTA — Contentful or fallback to Programs */}
              {hero?.secondaryButtonText && hero.secondaryButtonUrl ? (
                isExternalUrl(hero.secondaryButtonUrl) ? (
                  <a
                    href={hero.secondaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-white/50 transition-colors hover:text-white/80"
                  >
                    {hero.secondaryButtonText}
                  </a>
                ) : (
                  <Link
                    href={hero.secondaryButtonUrl}
                    className="text-base text-white/50 transition-colors hover:text-white/80"
                  >
                    {hero.secondaryButtonText}
                  </Link>
                )
              ) : (
                <Link
                  href="/programs"
                  className="text-base text-white/50 transition-colors hover:text-white/80"
                >
                  Our programs
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats — editorial, left-aligned, no background */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
            {impactStats.map((stat) => (
              <ImpactStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Thin rule */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-[var(--brand-rule)]" />
      </div>

      {/* Programs — left-offset heading, taller cards */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--brand-accent)]">
                What We Do
              </p>
              <h2 className="mt-3 font-serif text-3xl font-light leading-tight md:text-4xl">
                Programs that save lives
              </h2>
            </div>
            <Link
              href="/programs"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline md:mb-1"
            >
              View all programs
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {corePrograms.map((program, i) => (
              <ProgramCard
                key={program.slug}
                title={program.name}
                description={program.summary}
                href={`/programs/${program.slug}`}
                icon={PROGRAM_ICONS[program.slug]}
                imageUrl={getAssetUrl(program.image)}
                color={CARD_COLORS[i % CARD_COLORS.length]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story + Donation — asymmetric 60/40, no background */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-[3fr_2fr] lg:gap-20">
            {/* Featured Story */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--brand-accent)]">
                Stories of Hope
              </p>
              <h2 className="mt-3 font-serif text-3xl font-light leading-tight md:text-4xl">
                Meet the mothers we serve
              </h2>
              {featuredStory ? (
                <div className="mt-10">
                  <StoryCard
                    title={featuredStory.title}
                    slug={featuredStory.slug}
                    excerpt={getExcerpt(featuredStory)}
                    date={featuredStory.date}
                    imageUrl={getImageUrl(featuredStory)}
                    authorName={featuredStory.author?.name}
                    variant="featured"
                  />
                </div>
              ) : (
                <p className="mt-8 text-muted-foreground">Stories coming soon.</p>
              )}
              <Link
                href="/news"
                className="mt-8 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Read all stories
              </Link>
            </div>

            {/* Donation Module */}
            <div className="flex items-start pt-0 lg:pt-16">
              <DonationModule className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement — left-aligned, large */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-[var(--brand-rule)]" />
      </div>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <p className="max-w-3xl font-serif text-2xl font-light leading-[1.5] text-foreground/70 md:text-3xl">
            &ldquo;By God&apos;s grace, we support mothers, save lives, and strengthen faith.&rdquo;
          </p>
        </div>
      </section>

      {/* Partners — no border-top, just spacing */}
      {partners.length > 0 && (
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Trusted Partners
            </p>
            <div className="flex flex-wrap items-center gap-10 md:gap-14">
              {partners.map((partner) => {
                const logoUrl = getAssetUrl(partner.logo);
                if (!logoUrl) return null;
                return partner.website ? (
                  <a
                    key={partner.slug}
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-8 w-20 opacity-40 grayscale transition-all duration-[var(--duration-normal)] hover:opacity-80 hover:grayscale-0 md:h-10 md:w-28"
                    title={partner.name}
                  >
                    <Image
                      src={logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </a>
                ) : (
                  <div
                    key={partner.slug}
                    className="relative h-8 w-20 opacity-40 grayscale md:h-10 md:w-28"
                    title={partner.name}
                  >
                    <Image
                      src={logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <CTABanner
        title="Ready to make a difference?"
        description="Your support helps us continue our mission of empowering preemie mothers and saving lives."
        primaryButton={{ text: "Donate Now", href: EXTERNAL_LINKS.DONATE, external: true }}
        secondaryButton={{ text: "Contact Us", href: "/contact" }}
        variant="warm"
      />
    </>
  );
}
